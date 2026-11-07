/**
 * Host half of the usage-insights bundle.
 *
 * Reads the durable session log through `ctx.sessionQuery`, folds every
 * `assistant/message` usage record once (forks replay their parent messages,
 * so records are deduplicated by assistant message id), and serves the
 * aggregate at `/usage-insights.json` for the Client dashboard.
 *
 * Two billing models are supported:
 * - DeepSeek API: CNY list price, with DeepSeek's weekday peak windows.
 * - GLM Coding Plan: no CNY price; estimated plan credits, with GLM's own
 *   14:00–18:00 weekday peak window and 50% off-peak credit multiplier.
 *
 * Records are grouped by provider id because the session log stores the
 * provider route, not the API key. Configuring each key as its own provider
 * therefore gives one row per key; `providerLabels` can rename those rows.
 */

const TZ = 'Asia/Shanghai';

const PRICES = {
  'deepseek-flash': {
    hit: { peak: 0.04, offpeak: 0.02 },
    miss: { peak: 2, offpeak: 1 },
    output: { peak: 8, offpeak: 4 },
  },
  'deepseek-v4-pro': {
    hit: { peak: 0.3, offpeak: 0.15 },
    miss: { peak: 9, offpeak: 4.5 },
    output: { peak: 27, offpeak: 13.5 },
  },
};

const MODEL_ALIASES = {
  'deepseek-v4-flash': 'deepseek-flash',
  'deepseek-v4-flash-vision-exp': 'deepseek-flash',
  'deepseek-chat': 'deepseek-flash',
  'deepseek-reasoner': 'deepseek-flash',
  'deepseek-v4-pro': 'deepseek-v4-pro',
  'deepseek-pro': 'deepseek-v4-pro',
};

/** GLM Coding Plan credit coefficients (credits per 10k tokens). */
const GLM_CREDITS = {
  'glm-5.3': { input: 6.9, cached: 1.7, output: 24 },
  'glm-5.3-flash': { input: 2.3, cached: 0.56, output: 8 },
};
const GLM_OFFPEAK_MULTIPLIER = 0.5;

/** Public holidays in China. Weekend holidays are already off-peak. */
const DEFAULT_HOLIDAYS = [
  // 2025
  '2025-01-01',
  '2025-01-28', '2025-01-29', '2025-01-30', '2025-01-31',
  '2025-02-01', '2025-02-02', '2025-02-03', '2025-02-04',
  '2025-04-04', '2025-04-05', '2025-04-06',
  '2025-05-01', '2025-05-02', '2025-05-03', '2025-05-04', '2025-05-05',
  '2025-05-31', '2025-06-01', '2025-06-02',
  '2025-10-01', '2025-10-02', '2025-10-03', '2025-10-04',
  '2025-10-05', '2025-10-06', '2025-10-07', '2025-10-08',
  // 2026 (State Council schedule published 2025-11-04)
  '2026-01-01', '2026-01-02', '2026-01-03',
  '2026-02-15', '2026-02-16', '2026-02-17', '2026-02-18', '2026-02-19',
  '2026-02-20', '2026-02-21', '2026-02-22', '2026-02-23',
  '2026-04-04', '2026-04-05', '2026-04-06',
  '2026-05-01', '2026-05-02', '2026-05-03', '2026-05-04', '2026-05-05',
  '2026-06-19', '2026-06-20', '2026-06-21',
  '2026-09-25', '2026-09-26', '2026-09-27',
  '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04',
  '2026-10-05', '2026-10-06', '2026-10-07',
];

const shanghaiClock = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  hourCycle: 'h23',
});

function shanghaiParts(ms) {
  const values = {};
  for (const part of shanghaiClock.formatToParts(new Date(ms))) {
    if (part.type !== 'literal') values[part.type] = part.value;
  }
  return {
    year: Number(values.year),
    month: Number(values.month),
    day: Number(values.day),
    hour: Number(values.hour),
  };
}

function dateKey(ms) {
  const p = shanghaiParts(ms);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

function addDaysKey(key, offset) {
  const [year, month, day] = key.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + offset));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}-${String(date.getUTCDate()).padStart(2, '0')}`;
}

function weekdayOfKey(key) {
  const [year, month, day] = key.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day)).getUTCDay();
}

function isOffDay(ms, holidays) {
  const key = dateKey(ms);
  if (holidays.has(key)) return true;
  const weekday = weekdayOfKey(key);
  return weekday === 0 || weekday === 6;
}

/** DeepSeek: Mon-Fri 09:00-12:00 and 14:00-18:00. */
function isDeepSeekPeakTime(ms, holidays) {
  if (isOffDay(ms, holidays)) return false;
  const hour = shanghaiParts(ms).hour;
  return (hour >= 9 && hour < 12) || (hour >= 14 && hour < 18);
}

/** GLM Coding Plan: Mon-Fri 14:00-18:00; off-peak credits are 50%. */
function isGlmPeakTime(ms, holidays) {
  if (isOffDay(ms, holidays)) return false;
  const hour = shanghaiParts(ms).hour;
  return hour >= 14 && hour < 18;
}

function resolveDeepSeekModel(model) {
  const raw = String(model || '').toLowerCase();
  if (MODEL_ALIASES[raw]) return MODEL_ALIASES[raw];
  if (raw.includes('pro')) return 'deepseek-v4-pro';
  return 'deepseek-flash';
}

function resolveGlmCreditModel(model) {
  const raw = String(model || '').toLowerCase();
  if (raw.includes('flash') || raw.includes('turbo') || raw.includes('4.7')) return 'glm-5.3-flash';
  return 'glm-5.3';
}

function resolveFamily(provider, model) {
  const p = String(provider || '').toLowerCase();
  const m = String(model || '').toLowerCase();
  const text = `${p} ${m}`;
  if (text.includes('deepseek')) return 'deepseek';
  if (text.includes('glm') || text.includes('zhipu') || text.includes('bigmodel') || text.includes('z.ai') || text.includes('zai')) {
    return 'glm';
  }
  return 'other';
}

function planForFamily(family) {
  if (family === 'deepseek') return 'deepseek-api';
  if (family === 'glm') return 'glm-coding';
  return 'usage-only';
}

function normalizeUsage(usage) {
  if (!usage || typeof usage !== 'object') return null;
  const inputTokens = Math.max(0, Number(usage.inputTokens) || 0);
  const outputTokens = Math.max(0, Number(usage.outputTokens) || 0);
  const cacheReadTokens = Math.max(0, Number(usage.cacheReadTokens) || 0);
  const cacheWriteTokens = Math.max(0, Number(usage.cacheWriteTokens) || 0);
  const totalTokens = inputTokens + outputTokens + cacheReadTokens + cacheWriteTokens;
  if (totalTokens <= 0) return null;
  return { inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens, totalTokens };
}

function createStats() {
  return {
    calls: 0,
    inputTokens: 0,
    cacheReadTokens: 0,
    cacheWriteTokens: 0,
    outputTokens: 0,
    totalTokens: 0,
    promptTokens: 0,
    cacheHitRate: 0,
    cacheSavings: 0,
    peakTokens: 0,
    offpeakTokens: 0,
    peakCost: 0,
    offpeakCost: 0,
    cost: 0,
    peakCredits: 0,
    offpeakCredits: 0,
    credits: 0,
  };
}

function addRecord(stats, record, peak) {
  const usage = record.usage;
  stats.calls += 1;
  stats.inputTokens += usage.inputTokens;
  stats.cacheReadTokens += usage.cacheReadTokens;
  stats.cacheWriteTokens += usage.cacheWriteTokens;
  stats.outputTokens += usage.outputTokens;
  stats.totalTokens += usage.totalTokens;
  if (peak) {
    stats.peakTokens += usage.totalTokens;
  } else {
    stats.offpeakTokens += usage.totalTokens;
  }

  if (record.family === 'deepseek') {
    const prices = PRICES[record.pricedAs];
    const hitPrice = peak ? prices.hit.peak : prices.hit.offpeak;
    const missPrice = peak ? prices.miss.peak : prices.miss.offpeak;
    const outputPrice = peak ? prices.output.peak : prices.output.offpeak;
    const cost = (
      usage.cacheReadTokens * hitPrice
      + (usage.inputTokens + usage.cacheWriteTokens) * missPrice
      + usage.outputTokens * outputPrice
    ) / 1e6;
    const savings = usage.cacheReadTokens * (missPrice - hitPrice) / 1e6;
    stats.cost += cost;
    stats.cacheSavings += savings;
    if (peak) stats.peakCost += cost;
    else stats.offpeakCost += cost;
    return;
  }

  if (record.family === 'glm') {
    const coefficients = GLM_CREDITS[record.glmCreditsAs] || GLM_CREDITS['glm-5.3'];
    const baseCredits = (
      (usage.inputTokens + usage.cacheWriteTokens) * coefficients.input
      + usage.cacheReadTokens * coefficients.cached
      + usage.outputTokens * coefficients.output
    ) / 10000;
    const credits = baseCredits * (peak ? 1 : GLM_OFFPEAK_MULTIPLIER);
    stats.credits += credits;
    if (peak) stats.peakCredits += credits;
    else stats.offpeakCredits += credits;
  }
}

function finalize(stats) {
  const promptTokens = stats.inputTokens + stats.cacheReadTokens + stats.cacheWriteTokens;
  return {
    calls: stats.calls,
    inputTokens: stats.inputTokens,
    cacheReadTokens: stats.cacheReadTokens,
    cacheWriteTokens: stats.cacheWriteTokens,
    outputTokens: stats.outputTokens,
    totalTokens: stats.totalTokens,
    promptTokens,
    cacheHitRate: promptTokens > 0 ? stats.cacheReadTokens / promptTokens : 0,
    cacheSavings: round6(stats.cacheSavings),
    peakTokens: stats.peakTokens,
    offpeakTokens: stats.offpeakTokens,
    peakCost: round6(stats.peakCost),
    offpeakCost: round6(stats.offpeakCost),
    cost: round6(stats.cost),
    peakCredits: round6(stats.peakCredits),
    offpeakCredits: round6(stats.offpeakCredits),
    credits: round6(stats.credits),
  };
}

function round6(value) {
  return Math.round(value * 1e6) / 1e6;
}

function createPeriod() {
  return {
    all: createStats(),
    deepseek: createStats(),
    glm: createStats(),
    other: createStats(),
  };
}

function addToPeriod(period, record, peak) {
  addRecord(period.all, record, peak);
  addRecord(period[record.family], record, peak);
}

function finalizePeriod(period) {
  const all = finalize(period.all);
  return {
    ...all,
    all,
    deepseek: finalize(period.deepseek),
    glm: finalize(period.glm),
    other: finalize(period.other),
  };
}

function preferOriginal(candidate, previous) {
  if (!previous) return true;
  const candidateForked = candidate.parentSession ? 1 : 0;
  const previousForked = previous.parentSession ? 1 : 0;
  if (candidateForked !== previousForked) return candidateForked < previousForked;
  if (candidate.sessionCreatedAt !== previous.sessionCreatedAt) {
    return candidate.sessionCreatedAt < previous.sessionCreatedAt;
  }
  return candidate.seq < previous.seq;
}

function safeMessage(error) {
  return error instanceof Error ? error.message : String(error);
}

export const inject = ['webServer', 'sessionQuery'];

export function apply(ctx, config = {}) {
  const cacheTtlMs = Math.max(1000, Number(config.cacheTtlMs) || 20000);
  const holidays = new Set([
    ...DEFAULT_HOLIDAYS,
    ...(Array.isArray(config.holidays) ? config.holidays.map(String) : []),
  ]);
  const providerLabels = config.providerLabels && typeof config.providerLabels === 'object'
    ? config.providerLabels
    : {};

  let cached;
  let cachedAt = 0;
  let pending;

  async function readProviderNames() {
    const names = new Map();
    const llm = ctx.get('llm');
    if (!llm) return names;
    for (const method of ['listProviders', 'listConfigurableProviders']) {
      if (typeof llm[method] !== 'function') continue;
      try {
        const result = await llm[method]();
        for (const provider of result || []) {
          const id = provider.id || provider.provider;
          const name = provider.name || provider.displayName;
          if (id && name) names.set(id, name);
        }
      } catch {
        // Provider display names are a nicety; raw ids remain usable.
      }
    }
    return names;
  }

  async function buildSummary() {
    const now = Date.now();
    const todayKey = dateKey(now);
    const last30Start = addDaysKey(todayKey, -29);
    const last7Start = addDaysKey(todayKey, -6);
    const monthStart = `${todayKey.slice(0, 8)}01`;

    const providerNames = await readProviderNames();
    const sessions = await ctx.sessionQuery.listSessions();
    const metas = new Map();
    const candidates = [];
    const failures = [];
    let sessionsRead = 0;
    let eventsRead = 0;

    for (const record of sessions) {
      const header = record.header;
      const meta = {
        id: header.id,
        title: '',
        cwd: header.cwd || '',
        createdAt: header.createdAt,
        parentSession: header.parentSession || null,
        origin: header.origin || null,
        usageCount: 0,
      };
      try {
        const snapshot = await ctx.sessionQuery.readSession(header.id);
        sessionsRead += 1;
        eventsRead += snapshot.events.length;
        for (const event of snapshot.events) {
          if (event.type !== 'assistant/message' || !event.data || !event.data.usage) continue;
          const usage = normalizeUsage(event.data.usage);
          if (!usage) continue;
          const message = event.data.message || {};
          const time = Number.isFinite(event.time) ? event.time : header.createdAt;
          const model = message.source && message.source.model ? message.source.model : 'unknown';
          const provider = message.source && message.source.provider ? message.source.provider : 'unknown';
          const family = resolveFamily(provider, model);
          const messageId = message.id || `${header.id}:${event.seq}`;
          candidates.push({
            key: messageId,
            sessionId: header.id,
            sessionCreatedAt: header.createdAt,
            parentSession: header.parentSession || null,
            time,
            seq: event.seq,
            provider,
            model,
            family,
            plan: planForFamily(family),
            pricedAs: family === 'deepseek' ? resolveDeepSeekModel(model) : null,
            glmCreditsAs: family === 'glm' ? resolveGlmCreditModel(model) : null,
            usage,
          });
          meta.usageCount += 1;
        }
      } catch (error) {
        failures.push({ id: header.id, message: safeMessage(error) });
      }
      metas.set(header.id, meta);
    }

    const byMessage = new Map();
    for (const candidate of candidates) {
      const previous = byMessage.get(candidate.key);
      if (preferOriginal(candidate, previous)) byMessage.set(candidate.key, candidate);
    }
    const records = [...byMessage.values()];

    const usedSessionIds = [...new Set(records.map((record) => record.sessionId))];
    await Promise.all(usedSessionIds.map(async (sessionId) => {
      const meta = metas.get(sessionId);
      if (!meta) return;
      try {
        const title = await ctx.sessionQuery.readTitle(sessionId);
        if (title && title.title) meta.title = title.title;
      } catch {
        // A missing title is not a failure of the usage report.
      }
    }));

    const periods = {
      today: createPeriod(),
      last7: createPeriod(),
      last30: createPeriod(),
      month: createPeriod(),
      all: createPeriod(),
    };
    const daily = new Map();
    for (let index = 29; index >= 0; index -= 1) {
      daily.set(addDaysKey(todayKey, -index), createPeriod());
    }
    const modelStats = new Map();
    const providerStats = new Map();
    const sessionStats = new Map();

    for (const record of records) {
      const key = dateKey(record.time);
      const peak = record.family === 'glm'
        ? isGlmPeakTime(record.time, holidays)
        : record.family === 'deepseek'
          ? isDeepSeekPeakTime(record.time, holidays)
          : false;

      addToPeriod(periods.all, record, peak);
      if (key === todayKey) addToPeriod(periods.today, record, peak);
      if (key >= last7Start && key <= todayKey) addToPeriod(periods.last7, record, peak);
      if (key >= last30Start && key <= todayKey) addToPeriod(periods.last30, record, peak);
      if (key >= monthStart && key <= todayKey) addToPeriod(periods.month, record, peak);

      if (key >= last30Start && key <= todayKey) {
        const bucket = daily.get(key);
        if (bucket) addToPeriod(bucket, record, peak);

        const modelKey = `${record.family}:${record.model}`;
        let modelEntry = modelStats.get(modelKey);
        if (!modelEntry) {
          modelEntry = {
            model: record.model,
            family: record.family,
            plan: record.plan,
            pricedAs: record.pricedAs,
            glmCreditsAs: record.glmCreditsAs,
            providers: new Set(),
            stats: createStats(),
          };
          modelStats.set(modelKey, modelEntry);
        }
        modelEntry.providers.add(record.provider);
        addRecord(modelEntry.stats, record, peak);
      }

      const providerKey = `${record.family}:${record.provider}`;
      let providerEntry = providerStats.get(providerKey);
      if (!providerEntry) {
        providerEntry = {
          provider: record.provider,
          providerLabel: String(providerLabels[record.provider] || providerNames.get(record.provider) || providerLabelFallback(record.provider, record.family)),
          family: record.family,
          plan: record.plan,
          models: new Set(),
          lastActive: 0,
          stats: createStats(),
        };
        providerStats.set(providerKey, providerEntry);
      }
      providerEntry.models.add(record.model);
      addRecord(providerEntry.stats, record, peak);
      if (record.time > providerEntry.lastActive) providerEntry.lastActive = record.time;

      let sessionEntry = sessionStats.get(record.sessionId);
      if (!sessionEntry) {
        sessionEntry = {
          stats: createStats(),
          lastActive: 0,
          providers: new Set(),
          families: new Set(),
        };
        sessionStats.set(record.sessionId, sessionEntry);
      }
      sessionEntry.providers.add(record.provider);
      sessionEntry.families.add(record.family);
      addRecord(sessionEntry.stats, record, peak);
      if (record.time > sessionEntry.lastActive) sessionEntry.lastActive = record.time;
    }

    const dailySeries = [...daily.entries()].map(([date, period]) => ({
      date,
      ...finalizePeriod(period),
    }));

    const models = [...modelStats.values()]
      .map((entry) => ({
        model: entry.model,
        family: entry.family,
        plan: entry.plan,
        pricedAs: entry.pricedAs,
        glmCreditsAs: entry.glmCreditsAs,
        providers: [...entry.providers],
        ...finalize(entry.stats),
      }))
      .sort((a, b) => b.cost - a.cost || b.credits - a.credits || b.totalTokens - a.totalTokens);

    const providers = [...providerStats.values()]
      .map((entry) => ({
        provider: entry.provider,
        providerLabel: entry.providerLabel,
        family: entry.family,
        plan: entry.plan,
        models: [...entry.models],
        lastActive: entry.lastActive,
        ...finalize(entry.stats),
      }))
      .sort((a, b) => b.cost - a.cost || b.credits - a.credits || b.totalTokens - a.totalTokens);

    const sessionSeries = [...sessionStats.entries()]
      .map(([sessionId, entry]) => {
        const meta = metas.get(sessionId) || {};
        const cwd = meta.cwd || '';
        const cwdName = cwd.split(/[\\/]/).filter(Boolean).pop() || '';
        return {
          id: sessionId,
          title: meta.title || cwdName || sessionId.slice(0, 18),
          cwd: cwdName,
          parentSession: meta.parentSession || null,
          origin: meta.origin || null,
          providers: [...entry.providers],
          families: [...entry.families],
          lastActive: entry.lastActive,
          ...finalize(entry.stats),
        };
      })
      .sort((a, b) => b.lastActive - a.lastActive || b.cost - a.cost);

    const anyUsage = records.length > 0;
    return {
      generatedAt: now,
      timezone: TZ,
      currency: 'CNY',
      pricing: {
        unit: 'CNY per 1M tokens',
        effective: '2026-11',
        peakWindow: 'Mon-Fri 09:00-12:00 and 14:00-18:00 (Asia/Shanghai) on ordinary weekdays; weekends and Chinese statutory holidays are off-peak all day',
        table: PRICES,
        note: 'DeepSeek estimates use the public API list price. Actual billing may differ.',
        source: 'https://api-docs.deepseek.com/zh-cn/quick_start/pricing/',
        glm: {
          plan: 'GLM Coding Plan',
          peakWindow: 'Mon-Fri 14:00-18:00 (Asia/Shanghai) on ordinary weekdays; weekends and Chinese statutory holidays are off-peak all day',
          offpeakMultiplier: GLM_OFFPEAK_MULTIPLIER,
          credits: GLM_CREDITS,
          note: 'GLM Coding Plan has no per-token CNY price here. Credits are estimated from the official coefficients and exclude MCP tool calls.',
          source: 'https://docs.bigmodel.cn/cn/coding-plan/overview',
        },
      },
      today: todayKey,
      month: monthStart,
      periods: {
        today: finalizePeriod(periods.today),
        last7: finalizePeriod(periods.last7),
        last30: finalizePeriod(periods.last30),
        month: finalizePeriod(periods.month),
        all: finalizePeriod(periods.all),
      },
      daily: dailySeries,
      models,
      providers,
      sessions: sessionSeries,
      meta: {
        sessionsRead,
        sessionsFailed: failures.length,
        failures,
        eventsRead,
        calls: records.length,
        providers: providers.length,
        families: [...new Set(records.map((record) => record.family))],
        hasUsage: anyUsage,
        recentSessionId: sessionSeries.length > 0 ? sessionSeries[0].id : null,
      },
    };
  }

  async function getSummary(force) {
    if (!force && cached && Date.now() - cachedAt < cacheTtlMs) return cached;
    if (pending) return pending;
    pending = buildSummary()
      .then((summary) => {
        cached = summary;
        cachedAt = Date.now();
        return summary;
      })
      .finally(() => {
        pending = undefined;
      });
    return pending;
  }

  ctx.effect(() => ctx.webServer.register({
    kind: 'exact',
    path: '/usage-insights.json',
    resource: async (request) => {
      try {
        const url = new URL(request.url);
        const summary = await getSummary(url.searchParams.get('refresh') === '1');
        return new Response(JSON.stringify(summary), {
          status: 200,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store',
          },
        });
      } catch (error) {
        return new Response(JSON.stringify({ error: safeMessage(error) }), {
          status: 500,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'cache-control': 'no-store',
          },
        });
      }
    },
  }));
}

function providerLabelFallback(provider, family) {
  if (provider && provider !== 'unknown') return provider;
  if (family === 'glm') return 'GLM Coding Plan';
  if (family === 'deepseek') return 'DeepSeek';
  return 'Unknown provider';
}
