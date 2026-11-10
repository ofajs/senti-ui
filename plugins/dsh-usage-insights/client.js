window.__ModuleLoader__.load({
  id: '@local/dsh-usage-insights',
  factory(require) {
    const React = require('react');
    const h = React.createElement;
    const {
      useCallback,
      useEffect,
      useState,
      useSyncExternalStore,
    } = React;

    const NS = 'usage-insights';

    const ZH = {
      'panel.title': '用量与费用',
      'page.title': 'Token 用量与费用',
      'page.subtitle': 'DeepSeek 按公开价估算 · GLM Coding Plan 按套餐积分 · 峰谷按北京时间',
      'page.updated': '更新于',
      'page.refresh': '刷新',
      'page.refreshing': '刷新中…',
      'page.loading': '正在汇总会话用量…',
      'page.error': '无法读取用量数据',
      'page.retry': '重试',
      'page.emptyTitle': '还没有可统计的模型调用',
      'page.emptyBody': '发送一条消息后再回来刷新，这里会显示 token、缓存命中与费用分析。',
      'period.today': '今日（当前）',
      'period.last7': '最近 7 天',
      'period.last30': '最近 30 天',
      'period.month': '本月',
      'period.all': '全部累计',
      'stats.tokens': 'tokens',
      'stats.calls': '次调用',
      'stats.miss': '未命中',
      'stats.hit': '命中缓存',
      'stats.output': '输出',
      'stats.peak': '峰',
      'stats.offpeak': '谷',
      'stats.cacheRate': '缓存命中',
      'stats.savings': '缓存节省',
      'stats.credits': '积分',
      'stats.creditEstimate': '预估积分',
      'stats.deepseek': 'DeepSeek',
      'stats.glm': 'GLM',
      'chart.dailyTokens': '最近 30 天 Token 构成（全部服务商）',
      'chart.dailyTokensDesc': '每天按缓存命中、缓存未命中与输出拆分，含 DeepSeek 与 GLM',
      'chart.dailyCost': '最近 30 天 DeepSeek 每日费用',
      'chart.dailyCostDesc': '仅 DeepSeek API 按人民币计价；GLM Coding Plan 不按 token 计价',
      'chart.noData': '暂无数据',
      'chart.legendHit': '缓存命中',
      'chart.legendMiss': '缓存未命中',
      'chart.legendOutput': '输出',
      'chart.legendPeak': '峰时',
      'chart.legendOffpeak': '谷时',
      'section.peak': 'DeepSeek 峰谷费用',
      'section.peakDesc': '周一至周五 09:00–12:00、14:00–18:00 为峰时；周六、周日和法定节假日全天为谷时。',
      'section.glm': 'GLM Coding Plan 用量',
      'section.glmDesc': '不计算人民币费用，按套餐积分估算。峰时为周一至周五 14:00–18:00；非峰时积分消耗为 50%。',
      'section.cache': '缓存命中分析',
      'section.cacheDesc': '缓存命中价远低于未命中价；以下是最近 30 天的命中率与节省估算。',
      'section.current': '当前会话',
      'section.currentDesc': '你最近打开的这个会话的累计用量',
      'section.providers': '按 Provider / Key 统计',
      'section.providersDesc': 'DSH 日志保存 provider，不保存 API Key；每个 key 配成独立 provider 即可分别统计。',
      'section.models': '模型用量分布',
      'section.modelsDesc': '最近 30 天各模型的 token 占比与费用 / 积分',
      'section.sessions': '会话费用排行',
      'section.sessionsDesc': '按最近活跃时间排序，展示每个会话的累计用量',
      'section.pricing': '计价口径',
      'table.session': '会话',
      'table.lastActive': '最近活跃',
      'table.provider': 'Provider / Key',
      'table.type': '类型',
      'table.models': '模型',
      'table.calls': '调用',
      'table.tokens': 'Tokens',
      'table.rate': '缓存命中',
      'table.cost': '费用',
      'table.costOrCredits': '费用 / 积分',
      'table.peakOffpeak': '峰 / 谷',
      'misc.sessionCount': '个会话',
      'misc.providerCount': '个 provider',
      'misc.pricingNote': 'DeepSeek 按百万 tokens 的公开标价估算，实际扣费以 DeepSeek 账单为准。',
      'misc.pricingLink': '查看 DeepSeek 官方价格',
      'misc.cacheHitShort': '命中',
      'misc.noSessions': '暂无会话',
      'misc.noDeepseek': '暂无 DeepSeek 用量',
      'misc.noGlm': '暂无 GLM 用量',
      'misc.peakLabel': '峰时费用',
      'misc.offpeakLabel': '谷时费用',
      'misc.hitTokens': '命中 tokens',
      'misc.missTokens': '未命中 tokens',
      'misc.saved': '相比全部未命中节省',
      'misc.top': '最高',
      'misc.unknownModel': '未知模型',
      'misc.sameWindow': '卡片统计全部会话；当前所有用量都发生在今天，因此近 7 天、近 30 天、本月与今日一致。',
      'misc.deepseekApi': 'DeepSeek API',
      'misc.glmPlan': 'GLM Coding Plan',
      'misc.usageOnly': '仅用量',
      'misc.estimatedCredits': '预估积分',
      'misc.deepseekCost': 'DeepSeek 费用',
      'misc.glmCredits': 'GLM 预估积分',
      'misc.glmNotPriced': '套餐内，不计价',
      'misc.creditsNote': '积分按官方系数估算，不含 MCP 工具调用。',
      'misc.glmSource': 'GLM 用量说明',
      'misc.keyLimit': '同一 provider 下的多个 Key 无法区分；如需分开统计，请为每个 Key 配置独立 provider。',
      'misc.flashPricing': 'DeepSeek Flash',
    };

    const EN = {
      'panel.title': 'Usage & cost',
      'page.title': 'Token usage & cost',
      'page.subtitle': 'DeepSeek list prices · GLM Coding Plan credits · peak/off-peak in Beijing time',
      'page.updated': 'Updated',
      'page.refresh': 'Refresh',
      'page.refreshing': 'Refreshing…',
      'page.loading': 'Aggregating session usage…',
      'page.error': 'Unable to read usage data',
      'page.retry': 'Retry',
      'page.emptyTitle': 'No model calls to report yet',
      'page.emptyBody': 'Send a message, then refresh to see tokens, cache hits, and cost analysis.',
      'period.today': 'Today (current)',
      'period.last7': 'Last 7 days',
      'period.last30': 'Last 30 days',
      'period.month': 'This month',
      'period.all': 'All time',
      'stats.tokens': 'tokens',
      'stats.calls': 'calls',
      'stats.miss': 'Cache miss',
      'stats.hit': 'Cache hit',
      'stats.output': 'Output',
      'stats.peak': 'Peak',
      'stats.offpeak': 'Off-peak',
      'stats.cacheRate': 'Cache hit rate',
      'stats.savings': 'Cache savings',
      'stats.credits': 'credits',
      'stats.creditEstimate': 'Estimated credits',
      'stats.deepseek': 'DeepSeek',
      'stats.glm': 'GLM',
      'chart.dailyTokens': 'Token mix over the last 30 days (all providers)',
      'chart.dailyTokensDesc': 'Daily cache-hit, cache-miss, and output tokens, including DeepSeek and GLM',
      'chart.dailyCost': 'DeepSeek daily cost over the last 30 days',
      'chart.dailyCostDesc': 'Only DeepSeek API is priced in CNY; GLM Coding Plan is not token-priced',
      'chart.noData': 'No data',
      'chart.legendHit': 'Cache hit',
      'chart.legendMiss': 'Cache miss',
      'chart.legendOutput': 'Output',
      'chart.legendPeak': 'Peak',
      'chart.legendOffpeak': 'Off-peak',
      'section.peak': 'DeepSeek peak vs off-peak',
      'section.peakDesc': 'Mon–Fri 09:00–12:00 and 14:00–18:00 are peak. Weekends and Chinese statutory holidays are off-peak all day.',
      'section.glm': 'GLM Coding Plan usage',
      'section.glmDesc': 'No CNY price; credits are estimated from the plan. Peak is Mon–Fri 14:00–18:00, and off-peak usage costs 50% credits.',
      'section.cache': 'Cache hit analysis',
      'section.cacheDesc': 'Cache hits cost far less than misses. Rates and savings below cover the last 30 days.',
      'section.current': 'Current session',
      'section.currentDesc': 'Cumulative usage for the conversation you opened most recently',
      'section.providers': 'Usage by provider / key',
      'section.providersDesc': 'The session log stores the provider, not the API key. Configure each key as its own provider to get one row per key.',
      'section.models': 'Usage by model',
      'section.modelsDesc': 'Token share and DeepSeek cost or GLM credits per model over the last 30 days',
      'section.sessions': 'Session cost ranking',
      'section.sessionsDesc': 'Sessions ordered by latest activity, with cumulative usage',
      'section.pricing': 'Pricing basis',
      'table.session': 'Session',
      'table.lastActive': 'Last active',
      'table.provider': 'Provider / key',
      'table.type': 'Type',
      'table.models': 'Models',
      'table.calls': 'Calls',
      'table.tokens': 'Tokens',
      'table.rate': 'Cache hit',
      'table.cost': 'Cost',
      'table.costOrCredits': 'Cost / credits',
      'table.peakOffpeak': 'Peak / off-peak',
      'misc.sessionCount': 'sessions',
      'misc.providerCount': 'providers',
      'misc.pricingNote': 'DeepSeek estimates use public per-million-token list prices. Actual billing is on your DeepSeek invoice.',
      'misc.pricingLink': 'DeepSeek official pricing',
      'misc.cacheHitShort': 'hit',
      'misc.noSessions': 'No sessions',
      'misc.noDeepseek': 'No DeepSeek usage',
      'misc.noGlm': 'No GLM usage',
      'misc.peakLabel': 'Peak cost',
      'misc.offpeakLabel': 'Off-peak cost',
      'misc.hitTokens': 'Hit tokens',
      'misc.missTokens': 'Miss tokens',
      'misc.saved': 'Saved versus all misses',
      'misc.top': 'top',
      'misc.unknownModel': 'Unknown model',
      'misc.sameWindow': 'Cards cover all sessions. All usage so far happened today, so the 7-day, 30-day, and month totals match today.',
      'misc.deepseekApi': 'DeepSeek API',
      'misc.glmPlan': 'GLM Coding Plan',
      'misc.usageOnly': 'Usage only',
      'misc.estimatedCredits': 'Estimated credits',
      'misc.deepseekCost': 'DeepSeek cost',
      'misc.glmCredits': 'GLM estimated credits',
      'misc.glmNotPriced': 'Included in plan, not priced',
      'misc.creditsNote': 'Credits are estimated from official coefficients and exclude MCP tool calls.',
      'misc.glmSource': 'GLM usage policy',
      'misc.keyLimit': 'Multiple keys under one provider cannot be separated. Configure each key as its own provider to keep them apart.',
      'misc.flashPricing': 'DeepSeek Flash',
    };

    const CSS = `
.dsh-usage-page {
  min-height: 100%;
  height: 100%;
  overflow-y: auto;
  box-sizing: border-box;
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font-family: inherit;
  font-size: 13px;
  line-height: 1.5;
}
.dsh-usage-inner {
  max-width: 1180px;
  margin: 0 auto;
  padding: 30px 32px 64px;
  box-sizing: border-box;
}
.dsh-usage-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}
.dsh-usage-title {
  margin: 0;
  font-size: 24px;
  line-height: 1.25;
  font-weight: 650;
  letter-spacing: -0.01em;
}
.dsh-usage-subtitle {
  margin: 6px 0 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 12.5px;
}
.dsh-usage-header-side {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 8px;
  flex: none;
}
.dsh-usage-updated {
  color: var(--dsw-alias-label-secondary);
  font-size: 11.5px;
  white-space: nowrap;
}
.dsh-usage-refresh {
  appearance: none;
  border: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1);
  color: var(--dsw-alias-label-primary);
  border-radius: 8px;
  padding: 6px 13px;
  font: inherit;
  font-size: 12.5px;
  cursor: pointer;
  transition: background-color 120ms ease, border-color 120ms ease;
}
.dsh-usage-refresh:hover:not(:disabled) {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 8%, var(--dsw-alias-bg-layer-1));
  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 45%, var(--dsw-alias-border-l2));
}
.dsh-usage-refresh:disabled {
  cursor: default;
  opacity: 0.6;
}
.dsh-usage-refresh:focus-visible {
  outline: 2px solid var(--dsw-alias-brand-primary);
  outline-offset: 2px;
}
.dsh-usage-kpis {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}
.dsh-usage-window-hint {
  margin: -6px 0 18px;
  padding: 9px 12px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 5%, var(--dsw-alias-bg-layer-1));
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
}
.dsh-usage-kpi {
  min-width: 0;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1);
  border-radius: 12px;
  padding: 14px 15px 12px;
  box-sizing: border-box;
}
.dsh-usage-kpi-label {
  color: var(--dsw-alias-label-secondary);
  font-size: 11.5px;
  font-weight: 550;
  white-space: nowrap;
}
.dsh-usage-kpi-cost {
  margin-top: 8px;
  font-size: 23px;
  line-height: 1.15;
  font-weight: 650;
  letter-spacing: -0.02em;
  font-variant-numeric: tabular-nums;
}
.dsh-usage-kpi-tokens {
  margin-top: 3px;
  color: var(--dsw-alias-label-secondary);
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
}
.dsh-usage-kpi-subcost {
  min-height: 14px;
  margin-top: 2px;
  color: var(--dsw-alias-label-secondary);
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
}
.dsh-usage-kpi-metrics {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 6px;
  margin-top: 11px;
  padding-top: 10px;
  border-top: 1px solid var(--dsw-alias-border-l1);
}
.dsh-usage-kpi-metrics div {
  min-width: 0;
}
.dsh-usage-kpi-metrics span {
  display: block;
  color: var(--dsw-alias-label-secondary);
  font-size: 10.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dsh-usage-kpi-metrics b {
  display: block;
  margin-top: 1px;
  font-size: 11.5px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dsh-usage-kpi-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 5px 8px;
  margin-top: 10px;
  color: var(--dsw-alias-label-secondary);
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
}
.dsh-usage-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-right: 3px;
  vertical-align: 1px;
}
.dsh-usage-dot.peak { background: var(--dsw-alias-brand-primary); }
.dsh-usage-dot.offpeak { background: var(--dsw-alias-state-success-primary); }
.dsh-usage-dot.hit { background: var(--dsw-alias-state-success-primary); }
.dsh-usage-dot.miss { background: var(--dsw-alias-brand-primary); }
.dsh-usage-dot.output { background: var(--dsw-alias-state-warn-primary); }
.dsh-usage-current {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 14px;
  padding: 15px 18px;
  border: 1px solid var(--dsw-alias-border-l1);
  border-left: 3px solid var(--dsw-alias-brand-primary);
  border-radius: 12px;
  background: var(--dsw-alias-bg-layer-1);
}
.dsh-usage-current-title {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.dsh-usage-current-eyebrow {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  color: var(--dsw-alias-label-secondary);
  font-size: 10.5px;
  font-weight: 550;
  letter-spacing: 0.02em;
}
.dsh-usage-current-title strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 13.5px;
  font-weight: 600;
}
.dsh-usage-current-title > span:last-child {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--dsw-alias-label-secondary);
  font-size: 10.5px;
}
.dsh-usage-current-metrics {
  display: flex;
  align-items: stretch;
  gap: 22px;
  flex: none;
}
.dsh-usage-current-metric {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 64px;
}
.dsh-usage-current-metric span {
  color: var(--dsw-alias-label-secondary);
  font-size: 10px;
  white-space: nowrap;
}
.dsh-usage-current-metric b {
  font-size: 13px;
  font-weight: 600;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.dsh-usage-current-metric b.cost {
  color: var(--dsw-alias-brand-primary);
  font-size: 16px;
  letter-spacing: -0.01em;
}
.dsh-usage-card {
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1);
  border-radius: 12px;
  padding: 16px 18px;
  box-sizing: border-box;
  min-width: 0;
}
.dsh-usage-card + .dsh-usage-card {
  margin-top: 14px;
}
.dsh-usage-card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}
.dsh-usage-card-title {
  margin: 0;
  font-size: 14px;
  line-height: 1.35;
  font-weight: 620;
}
.dsh-usage-card-desc {
  margin: 3px 0 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 11.5px;
}
.dsh-usage-legend {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 6px 12px;
  color: var(--dsw-alias-label-secondary);
  font-size: 10.5px;
  white-space: nowrap;
}
.dsh-usage-legend span {
  display: inline-flex;
  align-items: center;
}
.dsh-usage-chart {
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr);
  grid-template-rows: 190px 18px;
  gap: 6px 8px;
}
.dsh-usage-chart.short {
  grid-template-rows: 132px 18px;
}
.dsh-usage-yaxis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-end;
  color: var(--dsw-alias-label-secondary);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  padding-bottom: 1px;
}
.dsh-usage-plot {
  position: relative;
  min-width: 0;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
}
.dsh-usage-grid {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  pointer-events: none;
}
.dsh-usage-gridline {
  border-top: 1px dashed var(--dsw-alias-border-l1);
  opacity: 0.75;
}
.dsh-usage-bars {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  gap: 3px;
  padding: 0 2px;
}
.dsh-usage-bar-col {
  position: relative;
  flex: 1 1 0;
  min-width: 3px;
  height: 100%;
  display: flex;
  align-items: flex-end;
  border-radius: 3px 3px 0 0;
}
.dsh-usage-bar-col:hover {
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 7%, transparent);
}
.dsh-usage-stack {
  width: 100%;
  min-height: 1px;
  display: flex;
  flex-direction: column-reverse;
  border-radius: 3px 3px 0 0;
  overflow: hidden;
}
.dsh-usage-seg {
  width: 100%;
  min-height: 1px;
}
.dsh-usage-seg.hit,
.dsh-usage-seg.offpeak {
  background: var(--dsw-alias-state-success-primary);
}
.dsh-usage-seg.miss,
.dsh-usage-seg.peak {
  background: var(--dsw-alias-brand-primary);
}
.dsh-usage-seg.output {
  background: var(--dsw-alias-state-warn-primary);
}
.dsh-usage-xaxis {
  grid-column: 2;
  display: flex;
  gap: 3px;
  padding: 0 2px;
  color: var(--dsw-alias-label-secondary);
  font-size: 9.5px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.dsh-usage-xlabel {
  flex: 1 1 0;
  min-width: 0;
  overflow: visible;
}
.dsh-usage-xlabel span {
  display: block;
  transform: translateX(-50%);
  width: 28px;
  text-align: center;
}
.dsh-usage-xlabel:first-child span {
  transform: translateX(0);
  text-align: left;
}
.dsh-usage-xlabel:last-child span {
  transform: translateX(-100%);
  text-align: right;
}
.dsh-usage-empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
}
.dsh-usage-two-col {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
  gap: 14px;
  margin-top: 14px;
}
.dsh-usage-two-col .dsh-usage-card {
  margin-top: 0;
}
.dsh-usage-split-bar {
  display: flex;
  height: 12px;
  border-radius: 999px;
  overflow: hidden;
  background: var(--dsw-alias-bg-layer-2);
  margin: 18px 0 16px;
}
.dsh-usage-split-peak {
  height: 100%;
  background: var(--dsw-alias-brand-primary);
}
.dsh-usage-split-offpeak {
  height: 100%;
  background: var(--dsw-alias-state-success-primary);
}
.dsh-usage-split-rows {
  display: grid;
  gap: 9px;
}
.dsh-usage-split-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 10px;
  align-items: baseline;
  font-size: 12px;
}
.dsh-usage-split-row .label {
  display: inline-flex;
  align-items: center;
  color: var(--dsw-alias-label-secondary);
}
.dsh-usage-split-row strong {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.dsh-usage-split-row .pct {
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
  width: 42px;
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.dsh-usage-split-note {
  margin: 14px 0 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 11px;
}
.dsh-usage-cache {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr);
  align-items: center;
  gap: 18px;
}
.dsh-usage-donut {
  width: 112px;
  height: 112px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.dsh-usage-donut::after {
  content: '';
  position: absolute;
  inset: 13px;
  border-radius: 50%;
  background: var(--dsw-alias-bg-layer-1);
}
.dsh-usage-donut-center {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.dsh-usage-donut-center strong {
  font-size: 21px;
  line-height: 1.1;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}
.dsh-usage-donut-center span {
  margin-top: 3px;
  color: var(--dsw-alias-label-secondary);
  font-size: 9.5px;
}
.dsh-usage-cache-rows {
  display: grid;
  gap: 8px;
  min-width: 0;
}
.dsh-usage-cache-row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  font-size: 11.5px;
}
.dsh-usage-cache-row span {
  color: var(--dsw-alias-label-secondary);
}
.dsh-usage-cache-row strong {
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.dsh-usage-cache-saving {
  margin-top: 4px;
  padding-top: 9px;
  border-top: 1px solid var(--dsw-alias-border-l1);
  color: var(--dsw-alias-state-success-primary);
  font-size: 12px;
  font-weight: 600;
}
.dsh-usage-model-list {
  display: grid;
  gap: 12px;
}
.dsh-usage-model-row {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr) 92px;
  gap: 12px;
  align-items: center;
  font-size: 11.5px;
}
.dsh-usage-model-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 550;
  display: flex;
  align-items: center;
  gap: 6px;
}
.dsh-usage-model-track {
  height: 8px;
  border-radius: 999px;
  background: var(--dsw-alias-bg-layer-2);
  overflow: hidden;
}
.dsh-usage-model-fill {
  height: 100%;
  border-radius: inherit;
  background: var(--dsw-alias-brand-primary);
}
.dsh-usage-model-cost {
  text-align: right;
  font-variant-numeric: tabular-nums;
  color: var(--dsw-alias-label-secondary);
}
.dsh-usage-model-cost strong {
  color: var(--dsw-alias-label-primary);
  font-weight: 600;
}
.dsh-usage-table-wrap {
  overflow-x: auto;
}
.dsh-usage-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 11.5px;
}
.dsh-usage-table th {
  text-align: left;
  padding: 0 10px 8px 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 10.5px;
  font-weight: 500;
  white-space: nowrap;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
}
.dsh-usage-table td {
  padding: 9px 10px 9px 0;
  border-bottom: 1px solid var(--dsw-alias-border-l1);
  vertical-align: middle;
}
.dsh-usage-table tr:last-child td {
  border-bottom: 0;
}
.dsh-usage-table th:not(:first-child),
.dsh-usage-table td:not(:first-child) {
  text-align: right;
}
.dsh-usage-session-title {
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: 420px;
}
.dsh-usage-session-title strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 550;
}
.dsh-usage-session-title span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--dsw-alias-label-secondary);
  font-size: 10.5px;
  direction: rtl;
  text-align: left;
}
.dsh-usage-table .num {
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.dsh-usage-pricing {
  margin-top: 18px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1);
  border-radius: 12px;
  padding: 14px 18px;
}
.dsh-usage-pricing-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 10px;
}
.dsh-usage-price-cell {
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  padding: 9px 11px;
}
.dsh-usage-price-cell span {
  display: block;
  color: var(--dsw-alias-label-secondary);
  font-size: 10.5px;
}
.dsh-usage-price-cell strong {
  display: block;
  margin-top: 2px;
  font-size: 12.5px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}
.dsh-usage-pricing-foot {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 12px;
  color: var(--dsw-alias-label-secondary);
  font-size: 10.5px;
}
.dsh-usage-pricing-foot a {
  color: var(--dsw-alias-brand-primary);
  text-decoration: none;
}
.dsh-usage-pricing-foot a:hover {
  text-decoration: underline;
}
.dsh-usage-pricing-glm {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid var(--dsw-alias-border-l1);
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px 16px;
  color: var(--dsw-alias-label-secondary);
  font-size: 10.5px;
}
.dsh-usage-pricing-glm strong {
  display: block;
  color: var(--dsw-alias-label-primary);
  font-size: 11.5px;
  font-weight: 600;
  margin-bottom: 2px;
}
.dsh-usage-pricing-glm a {
  color: var(--dsw-alias-brand-primary);
  text-decoration: none;
  white-space: nowrap;
}
.dsh-usage-pricing-glm a:hover {
  text-decoration: underline;
}
.dsh-usage-family-badge {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  padding: 1px 7px;
  font-size: 9.5px;
  font-weight: 600;
  line-height: 1.5;
  white-space: nowrap;
  border: 1px solid var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-secondary);
  background: var(--dsw-alias-bg-layer-2);
}
.dsh-usage-family-badge.deepseek {
  color: var(--dsw-alias-brand-primary);
  border-color: color-mix(in srgb, var(--dsw-alias-brand-primary) 35%, var(--dsw-alias-border-l1));
  background: color-mix(in srgb, var(--dsw-alias-brand-primary) 8%, var(--dsw-alias-bg-layer-2));
}
.dsh-usage-family-badge.glm {
  color: var(--dsw-alias-state-success-primary);
  border-color: color-mix(in srgb, var(--dsw-alias-state-success-primary) 35%, var(--dsw-alias-border-l1));
  background: color-mix(in srgb, var(--dsw-alias-state-success-primary) 8%, var(--dsw-alias-bg-layer-2));
}
.dsh-usage-provider-title {
  display: flex;
  flex-direction: column;
  min-width: 0;
  max-width: 260px;
}
.dsh-usage-provider-title strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 600;
}
.dsh-usage-provider-title span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--dsw-alias-label-secondary);
  font-size: 10px;
}
.dsh-usage-provider-models {
  display: block;
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--dsw-alias-label-secondary);
  font-size: 10.5px;
}
.dsh-usage-provider-note {
  margin: 10px 0 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 10.5px;
}
.dsh-usage-glm-periods {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 12px;
}
.dsh-usage-glm-period {
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-2);
  border-radius: 8px;
  padding: 9px 11px;
  min-width: 0;
}
.dsh-usage-glm-period span {
  display: block;
  color: var(--dsw-alias-label-secondary);
  font-size: 10px;
  white-space: nowrap;
}
.dsh-usage-glm-period strong {
  display: block;
  margin-top: 2px;
  font-size: 14px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dsh-usage-glm-period small {
  display: block;
  color: var(--dsw-alias-state-success-primary);
  font-size: 10px;
  margin-top: 1px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dsh-usage-glm-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}
.dsh-usage-glm-stat {
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  padding: 10px 12px;
  min-width: 0;
}
.dsh-usage-glm-stat span {
  display: block;
  color: var(--dsw-alias-label-secondary);
  font-size: 10px;
  white-space: nowrap;
}
.dsh-usage-glm-stat strong {
  display: block;
  margin-top: 3px;
  font-size: 15px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dsh-usage-glm-stat strong.credit {
  color: var(--dsw-alias-state-success-primary);
}
.dsh-usage-glm-split {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.dsh-usage-glm-row {
  border: 1px solid var(--dsw-alias-border-l1);
  border-radius: 8px;
  padding: 10px 12px;
  min-width: 0;
}
.dsh-usage-glm-row-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  color: var(--dsw-alias-label-secondary);
  font-size: 10.5px;
}
.dsh-usage-glm-row-values {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-top: 6px;
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
}
.dsh-usage-glm-row-values strong {
  font-weight: 600;
}
.dsh-usage-glm-note {
  margin: 12px 0 0;
  color: var(--dsw-alias-label-secondary);
  font-size: 10.5px;
}
.dsh-usage-glm-note a {
  color: var(--dsw-alias-brand-primary);
  text-decoration: none;
}
.dsh-usage-glm-note a:hover {
  text-decoration: underline;
}
.dsh-usage-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 320px;
  border: 1px solid var(--dsw-alias-border-l1);
  background: var(--dsw-alias-bg-layer-1);
  border-radius: 12px;
  padding: 32px;
  text-align: center;
}
.dsh-usage-status h2 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}
.dsh-usage-status p {
  margin: 0;
  max-width: 420px;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
}
.dsh-usage-spinner {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  border: 2px solid var(--dsw-alias-border-l2);
  border-top-color: var(--dsw-alias-brand-primary);
  animation: dsh-usage-spin 0.8s linear infinite;
}
@keyframes dsh-usage-spin {
  to { transform: rotate(360deg); }
}
@media (max-width: 1080px) {
  .dsh-usage-kpis { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .dsh-usage-kpi:nth-child(4), .dsh-usage-kpi:nth-child(5) { grid-column: span 1; }
}
@media (max-width: 860px) {
  .dsh-usage-inner { padding: 22px 18px 48px; }
  .dsh-usage-header { flex-direction: column; }
  .dsh-usage-header-side { align-items: flex-start; flex-direction: row; }
  .dsh-usage-kpis { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dsh-usage-two-col { grid-template-columns: minmax(0, 1fr); }
  .dsh-usage-current { flex-direction: column; align-items: flex-start; }
  .dsh-usage-current-metrics { flex-wrap: wrap; gap: 14px 22px; }
  .dsh-usage-cache { grid-template-columns: 96px minmax(0, 1fr); gap: 14px; }
  .dsh-usage-donut { width: 96px; height: 96px; }
  .dsh-usage-donut::after { inset: 12px; }
  .dsh-usage-model-row { grid-template-columns: 150px minmax(0, 1fr) 82px; }
  .dsh-usage-pricing-grid { grid-template-columns: minmax(0, 1fr); }
  .dsh-usage-provider-title { max-width: 180px; }
  .dsh-usage-provider-models { max-width: 150px; }
  .dsh-usage-glm-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dsh-usage-glm-periods { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .dsh-usage-glm-split { grid-template-columns: minmax(0, 1fr); }
}
@media (max-width: 560px) {
  .dsh-usage-kpis { grid-template-columns: minmax(0, 1fr); }
  .dsh-usage-card { padding: 14px; }
  .dsh-usage-chart { grid-template-columns: 42px minmax(560px, 1fr); overflow-x: auto; }
}
@media (prefers-reduced-motion: reduce) {
  .dsh-usage-spinner { animation: none; }
}
`;

    let lastActiveSessionId = null;

    function formatTokens(value) {
      const number = Number(value) || 0;
      if (number >= 1e9) return `${trimZero((number / 1e9).toFixed(2))}B`;
      if (number >= 1e6) return `${trimZero((number / 1e6).toFixed(2))}M`;
      if (number >= 1e3) return `${trimZero((number / 1e3).toFixed(1))}K`;
      return String(Math.round(number));
    }

    function trimZero(text) {
      return text.replace(/\.0+$/, '').replace(/(\.\d*[1-9])0+$/, '$1');
    }

    function formatCny(value) {
      const number = Number(value) || 0;
      if (number > 0 && number < 0.01) return `¥${number.toFixed(4)}`;
      if (number > 0 && number < 1) return `¥${number.toFixed(3)}`;
      return `¥${number.toFixed(2)}`;
    }

    function formatPercent(value) {
      const number = Number(value) || 0;
      return `${(number * 100).toFixed(1)}%`;
    }

    function formatCredits(value) {
      const number = Number(value) || 0;
      const rounded = number >= 100 ? Math.round(number) : Math.round(number * 100) / 100;
      return rounded.toLocaleString(undefined, { maximumFractionDigits: 2 });
    }

    function formatCostOrCredits(stats, t) {
      const cost = Number(stats && stats.cost) || 0;
      const credits = Number(stats && stats.credits) || 0;
      if (cost > 0 && credits > 0) return `${formatCny(cost)} + ${formatCredits(credits)} ${t('stats.credits')}`;
      if (cost > 0) return formatCny(cost);
      if (credits > 0) return `${formatCredits(credits)} ${t('stats.credits')}`;
      return '—';
    }

    function primaryCostLabel(stats, t) {
      const cost = Number(stats && stats.cost) || 0;
      const credits = Number(stats && stats.credits) || 0;
      if (cost > 0) return formatCny(cost);
      if (credits > 0) return `${formatCredits(credits)} ${t('stats.credits')}`;
      return '—';
    }

    function secondaryCostLabel(stats, t) {
      const cost = Number(stats && stats.cost) || 0;
      const credits = Number(stats && stats.credits) || 0;
      if (cost > 0 && credits > 0) return `+ ${formatCredits(credits)} ${t('stats.credits')}`;
      if (cost > 0) return t('misc.deepseekApi');
      if (credits > 0) return t('misc.glmPlan');
      return '';
    }

    function familyLabel(family, t) {
      if (family === 'glm') return t('misc.glmPlan');
      if (family === 'deepseek') return t('misc.deepseekApi');
      return t('misc.usageOnly');
    }

    function FamilyBadge({ family, t }) {
      return h('span', { className: `dsh-usage-family-badge ${family}` }, familyLabel(family, t));
    }

    function prettyModel(model) {
      const raw = String(model || '');
      if (raw === 'deepseek-flash') return 'DeepSeek Flash';
      if (raw === 'deepseek-v4-pro') return 'DeepSeek V4 Pro';
      return raw || 'Unknown';
    }

    function shortDay(date) {
      return String(date).slice(5).replace('-', '/');
    }

    function sumSeries(item, series) {
      return series.reduce((total, entry) => total + (Number(item[entry.key]) || 0), 0);
    }

    function StackedBarChart({ data, series, short, tickFormat, titleFor, emptyText }) {
      const max = Math.max(1, ...data.map((item) => sumSeries(item, series)));
      const ticks = [max, max / 2, 0];
      const hasData = data.some((item) => sumSeries(item, series) > 0);
      return h('div', { className: `dsh-usage-chart${short ? ' short' : ''}` },
        h('div', { className: 'dsh-usage-yaxis' }, ticks.map((tick, index) => h('span', { key: index }, tickFormat(tick)))),
        h('div', { className: 'dsh-usage-plot' },
          h('div', { className: 'dsh-usage-grid' }, [0, 1, 2].map((index) => h('div', { key: index, className: 'dsh-usage-gridline' }))),
          !hasData
            ? h('div', { className: 'dsh-usage-empty' }, emptyText)
            : h('div', { className: 'dsh-usage-bars' }, data.map((item) => {
              const total = sumSeries(item, series);
              const height = total > 0 ? Math.max(1.5, (total / max) * 100) : 0;
              return h('div', {
                key: item.date,
                className: 'dsh-usage-bar-col',
                title: titleFor(item),
                'aria-label': titleFor(item),
              }, height > 0
                ? h('div', { className: 'dsh-usage-stack', style: { height: `${height}%` } },
                  series.map((entry) => h('div', {
                    key: entry.key,
                    className: `dsh-usage-seg ${entry.className}`,
                    style: { flexGrow: Math.max(0.000001, Number(item[entry.key]) || 0) },
                  })))
                : null);
            })),
        ),
        h('div'),
        h('div', { className: 'dsh-usage-xaxis' }, data.map((item, index) => h('span', {
          key: item.date,
          className: 'dsh-usage-xlabel',
        }, index % 5 === 0 || index === data.length - 1
          ? h('span', null, shortDay(item.date))
          : null))),
      );
    }

    function Legend({ items }) {
      return h('div', { className: 'dsh-usage-legend' }, items.map((item) => h('span', { key: item.key },
        h('i', { className: `dsh-usage-dot ${item.className}` }),
        item.label,
      )));
    }

    function StatCard({ label, stats, t }) {
      const miss = (stats.inputTokens || 0) + (stats.cacheWriteTokens || 0);
      const deepseek = stats.deepseek || {};
      const glm = stats.glm || {};
      return h('article', { className: 'dsh-usage-kpi' },
        h('div', { className: 'dsh-usage-kpi-label' }, label),
        h('div', { className: 'dsh-usage-kpi-cost', title: formatCostOrCredits(stats, t) }, primaryCostLabel(stats, t)),
        h('div', { className: 'dsh-usage-kpi-subcost' }, secondaryCostLabel(stats, t)),
        h('div', { className: 'dsh-usage-kpi-tokens' }, `${formatTokens(stats.totalTokens)} ${t('stats.tokens')} · ${stats.calls || 0} ${t('stats.calls')}`),
        h('div', { className: 'dsh-usage-kpi-metrics' },
          h('div', null, h('span', null, t('stats.miss')), h('b', { title: String(miss) }, formatTokens(miss))),
          h('div', null, h('span', null, t('stats.hit')), h('b', { title: String(stats.cacheReadTokens || 0) }, formatTokens(stats.cacheReadTokens))),
          h('div', null, h('span', null, t('stats.output')), h('b', { title: String(stats.outputTokens || 0) }, formatTokens(stats.outputTokens))),
        ),
        h('div', { className: 'dsh-usage-kpi-foot' },
          deepseek.calls > 0
            ? h('span', null, h('i', { className: 'dsh-usage-dot peak' }), `DS ${t('stats.peak')} ${formatCny(deepseek.peakCost)} · ${t('stats.offpeak')} ${formatCny(deepseek.offpeakCost)}`)
            : null,
          glm.calls > 0
            ? h('span', null, h('i', { className: 'dsh-usage-dot offpeak' }), `GLM ${t('stats.peak')} ${formatTokens(glm.peakTokens)} · ${t('stats.offpeak')} ${formatTokens(glm.offpeakTokens)}`)
            : null,
          h('span', null, `${t('stats.cacheRate')} ${formatPercent(stats.cacheHitRate)}`),
        ),
      );
    }

    function CurrentSessionStrip({ session, t }) {
      const miss = (session.inputTokens || 0) + (session.cacheWriteTokens || 0);
      const peakParts = [];
      if (session.cost > 0) {
        peakParts.push(`DS ${formatCny(session.peakCost)} / ${formatCny(session.offpeakCost)}`);
      }
      if (session.credits > 0) {
        peakParts.push(`GLM ${formatCredits(session.peakCredits)} / ${formatCredits(session.offpeakCredits)} ${t('stats.credits')}`);
      }
      const peakLabel = peakParts.length > 0 ? peakParts.join(' · ') : '—';
      return h('section', { className: 'dsh-usage-current', 'aria-label': t('section.current') },
        h('div', { className: 'dsh-usage-current-title' },
          h('span', { className: 'dsh-usage-current-eyebrow' },
            h('i', { className: 'dsh-usage-dot peak' }),
            t('section.current'),
            ' · ',
            t('section.currentDesc'),
          ),
          h('strong', { title: session.title }, session.title),
          h('span', { title: session.cwd },
            `${miss ? formatTokens(miss) : '0'} ${t('stats.miss')} · ${formatTokens(session.cacheReadTokens)} ${t('stats.hit')} · ${formatTokens(session.outputTokens)} ${t('stats.output')} · ${session.calls} ${t('stats.calls')}${session.providers && session.providers.length ? ` · ${session.providers.join(' / ')}` : ''}`,
          ),
        ),
        h('div', { className: 'dsh-usage-current-metrics' },
          h('div', { className: 'dsh-usage-current-metric' },
            h('span', null, t('table.costOrCredits')),
            h('b', { className: 'cost' }, formatCostOrCredits(session, t)),
          ),
          h('div', { className: 'dsh-usage-current-metric' },
            h('span', null, t('table.tokens')),
            h('b', { title: String(session.totalTokens) }, formatTokens(session.totalTokens)),
          ),
          h('div', { className: 'dsh-usage-current-metric' },
            h('span', null, t('stats.cacheRate')),
            h('b', null, formatPercent(session.cacheHitRate)),
          ),
          h('div', { className: 'dsh-usage-current-metric' },
            h('span', null, `${t('stats.peak')} / ${t('stats.offpeak')}`),
            h('b', null, peakLabel),
          ),
        ),
      );
    }

    function TokenChart({ data, t }) {
      const series = [
        { key: 'cacheReadTokens', className: 'hit' },
        { key: 'inputTokens', className: 'miss' },
        { key: 'outputTokens', className: 'output' },
      ];
      return h('section', { className: 'dsh-usage-card' },
        h('div', { className: 'dsh-usage-card-head' },
          h('div', null,
            h('h2', { className: 'dsh-usage-card-title' }, t('chart.dailyTokens')),
            h('p', { className: 'dsh-usage-card-desc' }, t('chart.dailyTokensDesc')),
          ),
          h(Legend, { items: [
            { key: 'hit', className: 'hit', label: t('chart.legendHit') },
            { key: 'miss', className: 'miss', label: t('chart.legendMiss') },
            { key: 'output', className: 'output', label: t('chart.legendOutput') },
          ] }),
        ),
        h(StackedBarChart, {
          data,
          series,
          tickFormat: formatTokens,
          emptyText: t('chart.noData'),
          titleFor: (item) => `${item.date}\n${t('chart.legendHit')} ${formatTokens(item.cacheReadTokens)}\n${t('chart.legendMiss')} ${formatTokens(item.inputTokens)}\n${t('chart.legendOutput')} ${formatTokens(item.outputTokens)}\n${item.cost > 0 ? formatCny(item.cost) : ''}${item.credits > 0 ? ` · ${formatCredits(item.credits)} ${t('stats.credits')}` : ''}`,
        }),
      );
    }

    function CostChart({ data, t }) {
      const chartData = data.map((item) => ({
        date: item.date,
        peakCost: item.deepseek ? item.deepseek.peakCost : 0,
        offpeakCost: item.deepseek ? item.deepseek.offpeakCost : 0,
      }));
      const series = [
        { key: 'offpeakCost', className: 'offpeak' },
        { key: 'peakCost', className: 'peak' },
      ];
      return h('section', { className: 'dsh-usage-card' },
        h('div', { className: 'dsh-usage-card-head' },
          h('div', null,
            h('h2', { className: 'dsh-usage-card-title' }, t('chart.dailyCost')),
            h('p', { className: 'dsh-usage-card-desc' }, t('chart.dailyCostDesc')),
          ),
          h(Legend, { items: [
            { key: 'peak', className: 'peak', label: t('chart.legendPeak') },
            { key: 'offpeak', className: 'offpeak', label: t('chart.legendOffpeak') },
          ] }),
        ),
        h(StackedBarChart, {
          data: chartData,
          series,
          short: true,
          tickFormat: formatCny,
          emptyText: t('chart.noData'),
          titleFor: (item) => `${item.date}\n${t('chart.legendPeak')} ${formatCny(item.peakCost)}\n${t('chart.legendOffpeak')} ${formatCny(item.offpeakCost)}\n${formatCny(item.peakCost + item.offpeakCost)}`,
        }),
      );
    }

    function PeakCard({ stats, t }) {
      if (!stats || !stats.calls) {
        return h('section', { className: 'dsh-usage-card' },
          h('div', { className: 'dsh-usage-card-head' },
            h('div', null,
              h('h2', { className: 'dsh-usage-card-title' }, t('section.peak')),
              h('p', { className: 'dsh-usage-card-desc' }, t('section.peakDesc')),
            ),
          ),
          h('div', { className: 'dsh-usage-empty', style: { position: 'static', minHeight: '72px' } }, t('misc.noDeepseek')),
        );
      }
      const peakCost = stats.peakCost || 0;
      const offpeakCost = stats.offpeakCost || 0;
      const total = peakCost + offpeakCost;
      const peakPct = total > 0 ? (peakCost / total) * 100 : 0;
      const offpeakPct = total > 0 ? 100 - peakPct : 0;
      return h('section', { className: 'dsh-usage-card' },
        h('div', { className: 'dsh-usage-card-head' },
          h('div', null,
            h('h2', { className: 'dsh-usage-card-title' }, t('section.peak')),
            h('p', { className: 'dsh-usage-card-desc' }, t('section.peakDesc')),
          ),
        ),
        h('div', { className: 'dsh-usage-split-bar', 'aria-hidden': 'true' },
          h('div', { className: 'dsh-usage-split-peak', style: { width: `${peakPct}%` } }),
          h('div', { className: 'dsh-usage-split-offpeak', style: { width: `${offpeakPct}%` } }),
        ),
        h('div', { className: 'dsh-usage-split-rows' },
          h('div', { className: 'dsh-usage-split-row' },
            h('span', { className: 'label' }, h('i', { className: 'dsh-usage-dot peak' }), t('misc.peakLabel')),
            h('strong', null, formatCny(peakCost)),
            h('span', { className: 'pct' }, `${peakPct.toFixed(1)}%`),
          ),
          h('div', { className: 'dsh-usage-split-row' },
            h('span', { className: 'label' }, h('i', { className: 'dsh-usage-dot offpeak' }), t('misc.offpeakLabel')),
            h('strong', null, formatCny(offpeakCost)),
            h('span', { className: 'pct' }, `${offpeakPct.toFixed(1)}%`),
          ),
        ),
        h('p', { className: 'dsh-usage-split-note' }, `${formatTokens(stats.peakTokens)} / ${formatTokens(stats.offpeakTokens)} ${t('stats.tokens')}`),
      );
    }

    function GlmCard({ stats, periods, t }) {
      if (!stats || !stats.calls) {
        return h('section', { className: 'dsh-usage-card' },
          h('div', { className: 'dsh-usage-card-head' },
            h('div', null,
              h('h2', { className: 'dsh-usage-card-title' }, t('section.glm')),
              h('p', { className: 'dsh-usage-card-desc' }, t('section.glmDesc')),
            ),
          ),
          h('div', { className: 'dsh-usage-empty', style: { position: 'static', minHeight: '72px' } }, t('misc.noGlm')),
        );
      }
      const peakCredits = stats.peakCredits || 0;
      const offpeakCredits = stats.offpeakCredits || 0;
      const totalCredits = peakCredits + offpeakCredits;
      const peakPct = totalCredits > 0 ? (peakCredits / totalCredits) * 100 : 0;
      const offpeakPct = totalCredits > 0 ? 100 - peakPct : 0;
      const periodRows = [
        { key: 'today', label: t('period.today') },
        { key: 'last7', label: t('period.last7') },
        { key: 'last30', label: t('period.last30') },
        { key: 'month', label: t('period.month') },
      ];
      return h('section', { className: 'dsh-usage-card' },
        h('div', { className: 'dsh-usage-card-head' },
          h('div', null,
            h('h2', { className: 'dsh-usage-card-title' }, t('section.glm')),
            h('p', { className: 'dsh-usage-card-desc' }, t('section.glmDesc')),
          ),
          h(FamilyBadge, { family: 'glm', t }),
        ),
        h('div', { className: 'dsh-usage-glm-periods' }, periodRows.map((row) => {
          const period = periods && periods[row.key] ? periods[row.key].glm : null;
          return h('div', { className: 'dsh-usage-glm-period', key: row.key },
            h('span', null, row.label),
            h('strong', null, formatTokens(period ? period.totalTokens : 0)),
            h('small', null, `${formatCredits(period ? period.credits : 0)} ${t('stats.credits')}`),
          );
        })),
        h('div', { className: 'dsh-usage-glm-grid' },
          h('div', { className: 'dsh-usage-glm-stat' },
            h('span', null, t('stats.creditEstimate')),
            h('strong', { className: 'credit' }, formatCredits(stats.credits)),
          ),
          h('div', { className: 'dsh-usage-glm-stat' },
            h('span', null, t('table.tokens')),
            h('strong', null, formatTokens(stats.totalTokens)),
          ),
          h('div', { className: 'dsh-usage-glm-stat' },
            h('span', null, t('stats.cacheRate')),
            h('strong', null, formatPercent(stats.cacheHitRate)),
          ),
          h('div', { className: 'dsh-usage-glm-stat' },
            h('span', null, t('table.calls')),
            h('strong', null, String(stats.calls)),
          ),
        ),
        h('div', { className: 'dsh-usage-split-bar', 'aria-hidden': 'true' },
          h('div', { className: 'dsh-usage-split-peak', style: { width: `${peakPct}%` } }),
          h('div', { className: 'dsh-usage-split-offpeak', style: { width: `${offpeakPct}%` } }),
        ),
        h('div', { className: 'dsh-usage-glm-split' },
          h('div', { className: 'dsh-usage-glm-row' },
            h('div', { className: 'dsh-usage-glm-row-title' },
              h('span', null, h('i', { className: 'dsh-usage-dot peak' }), t('stats.peak'), ' · 14:00–18:00'),
              h('span', null, `${peakPct.toFixed(1)}%`),
            ),
            h('div', { className: 'dsh-usage-glm-row-values' },
              h('span', null, `${formatCredits(peakCredits)} ${t('stats.credits')}`),
              h('strong', null, `${formatTokens(stats.peakTokens)} ${t('stats.tokens')}`),
            ),
          ),
          h('div', { className: 'dsh-usage-glm-row' },
            h('div', { className: 'dsh-usage-glm-row-title' },
              h('span', null, h('i', { className: 'dsh-usage-dot offpeak' }), t('stats.offpeak'), ' · 50%'),
              h('span', null, `${offpeakPct.toFixed(1)}%`),
            ),
            h('div', { className: 'dsh-usage-glm-row-values' },
              h('span', null, `${formatCredits(offpeakCredits)} ${t('stats.credits')}`),
              h('strong', null, `${formatTokens(stats.offpeakTokens)} ${t('stats.tokens')}`),
            ),
          ),
        ),
        h('p', { className: 'dsh-usage-glm-note' },
          `${t('misc.creditsNote')} `,
          h('a', { href: 'https://docs.bigmodel.cn/cn/coding-plan/overview', target: '_blank', rel: 'noreferrer' }, t('misc.glmSource')),
        ),
      );
    }

    function CacheCard({ stats, t }) {
      const rate = Number(stats.cacheHitRate) || 0;
      const degrees = Math.max(0, Math.min(360, rate * 360));
      const miss = (stats.inputTokens || 0) + (stats.cacheWriteTokens || 0);
      return h('section', { className: 'dsh-usage-card' },
        h('div', { className: 'dsh-usage-card-head' },
          h('div', null,
            h('h2', { className: 'dsh-usage-card-title' }, t('section.cache')),
            h('p', { className: 'dsh-usage-card-desc' }, t('section.cacheDesc')),
          ),
        ),
        h('div', { className: 'dsh-usage-cache' },
          h('div', {
            className: 'dsh-usage-donut',
            style: {
              background: `conic-gradient(var(--dsw-alias-state-success-primary) ${degrees}deg, var(--dsw-alias-bg-layer-2) 0deg)`,
            },
            role: 'img',
            'aria-label': `${t('stats.cacheRate')} ${formatPercent(rate)}`,
          }, h('div', { className: 'dsh-usage-donut-center' },
            h('strong', null, formatPercent(rate)),
            h('span', null, t('stats.cacheRate')),
          )),
          h('div', { className: 'dsh-usage-cache-rows' },
            h('div', { className: 'dsh-usage-cache-row' },
              h('span', null, h('i', { className: 'dsh-usage-dot hit' }), t('misc.hitTokens')),
              h('strong', null, formatTokens(stats.cacheReadTokens)),
            ),
            h('div', { className: 'dsh-usage-cache-row' },
              h('span', null, h('i', { className: 'dsh-usage-dot miss' }), t('misc.missTokens')),
              h('strong', null, formatTokens(miss)),
            ),
            stats.cost > 0
              ? h('div', { className: 'dsh-usage-cache-saving' }, `${t('stats.savings')} ${formatCny(stats.cacheSavings)}`)
              : null,
          ),
        ),
      );
    }

    function ModelsCard({ models, t }) {
      const max = Math.max(1, ...models.map((model) => model.totalTokens || 0));
      return h('section', { className: 'dsh-usage-card' },
        h('div', { className: 'dsh-usage-card-head' },
          h('div', null,
            h('h2', { className: 'dsh-usage-card-title' }, t('section.models')),
            h('p', { className: 'dsh-usage-card-desc' }, t('section.modelsDesc')),
          ),
        ),
        models.length === 0
          ? h('div', { className: 'dsh-usage-empty', style: { position: 'static', minHeight: '56px' } }, t('chart.noData'))
          : h('div', { className: 'dsh-usage-model-list' }, models.map((model) => {
            const width = model.totalTokens > 0 ? Math.max(2, (model.totalTokens / max) * 100) : 0;
            return h('div', {
              className: 'dsh-usage-model-row',
              key: `${model.family}:${model.model}`,
              title: `${model.model} · ${formatCostOrCredits(model, t)} · ${formatTokens(model.totalTokens)} ${t('stats.tokens')}`,
            },
              h('span', { className: 'dsh-usage-model-name' },
                h(FamilyBadge, { family: model.family, t }),
                ' ',
                prettyModel(model.model),
              ),
              h('div', { className: 'dsh-usage-model-track' },
                h('div', { className: 'dsh-usage-model-fill', style: { width: `${width}%` } }),
              ),
              h('span', { className: 'dsh-usage-model-cost' },
                h('strong', null, formatCostOrCredits(model, t)),
                h('br'),
                formatTokens(model.totalTokens),
              ),
            );
          })),
      );
    }

    function SessionsCard({ sessions, t, locale }) {
      const formatter = new Intl.DateTimeFormat(locale || undefined, {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      });
      return h('section', { className: 'dsh-usage-card' },
        h('div', { className: 'dsh-usage-card-head' },
          h('div', null,
            h('h2', { className: 'dsh-usage-card-title' }, t('section.sessions')),
            h('p', { className: 'dsh-usage-card-desc' }, `${t('section.sessionsDesc')} · ${sessions.length} ${t('misc.sessionCount')}`),
          ),
        ),
        sessions.length === 0
          ? h('div', { className: 'dsh-usage-empty', style: { position: 'static', minHeight: '56px' } }, t('misc.noSessions'))
          : h('div', { className: 'dsh-usage-table-wrap' },
            h('table', { className: 'dsh-usage-table' },
              h('thead', null, h('tr', null,
                h('th', null, t('table.session')),
                h('th', null, t('table.lastActive')),
                h('th', null, t('table.calls')),
                h('th', null, t('table.tokens')),
                h('th', null, t('table.rate')),
                h('th', null, t('table.costOrCredits')),
              )),
              h('tbody', null, sessions.map((session) => h('tr', { key: session.id },
                h('td', null, h('div', { className: 'dsh-usage-session-title' },
                  h('strong', { title: session.title }, session.title),
                  h('span', { title: session.cwd }, session.cwd || session.id),
                )),
                h('td', { className: 'num' }, formatter.format(new Date(session.lastActive || Date.now()))),
                h('td', { className: 'num' }, String(session.calls)),
                h('td', { className: 'num' }, formatTokens(session.totalTokens)),
                h('td', { className: 'num' }, formatPercent(session.cacheHitRate)),
                h('td', { className: 'num' }, formatCostOrCredits(session, t)),
              ))),
            ),
          ),
      );
    }

    function ProvidersCard({ providers, t }) {
      return h('section', { className: 'dsh-usage-card' },
        h('div', { className: 'dsh-usage-card-head' },
          h('div', null,
            h('h2', { className: 'dsh-usage-card-title' }, t('section.providers')),
            h('p', { className: 'dsh-usage-card-desc' }, `${t('section.providersDesc')} · ${t('period.all')} · ${providers.length} ${t('misc.providerCount')}`),
          ),
        ),
        providers.length === 0
          ? h('div', { className: 'dsh-usage-empty', style: { position: 'static', minHeight: '56px' } }, t('chart.noData'))
          : h('div', { className: 'dsh-usage-table-wrap' },
            h('table', { className: 'dsh-usage-table' },
              h('thead', null, h('tr', null,
                h('th', null, t('table.provider')),
                h('th', null, t('table.type')),
                h('th', null, t('table.models')),
                h('th', null, t('table.calls')),
                h('th', null, t('table.tokens')),
                h('th', null, t('table.peakOffpeak')),
                h('th', null, t('table.costOrCredits')),
              )),
              h('tbody', null, providers.map((provider) => h('tr', { key: `${provider.family}:${provider.provider}` },
                h('td', null, h('div', { className: 'dsh-usage-provider-title' },
                  h('strong', { title: provider.providerLabel }, provider.providerLabel),
                  provider.providerLabel !== provider.provider
                    ? h('span', { title: provider.provider }, provider.provider)
                    : null,
                )),
                h('td', null, h(FamilyBadge, { family: provider.family, t })),
                h('td', null, h('span', {
                  className: 'dsh-usage-provider-models',
                  title: provider.models.join(', '),
                }, provider.models.join(', '))),
                h('td', { className: 'num' }, String(provider.calls)),
                h('td', { className: 'num' }, formatTokens(provider.totalTokens)),
                h('td', { className: 'num' },
                  provider.family === 'deepseek'
                    ? `${formatCny(provider.peakCost)} / ${formatCny(provider.offpeakCost)}`
                    : `${formatTokens(provider.peakTokens)} / ${formatTokens(provider.offpeakTokens)}`,
                ),
                h('td', { className: 'num' }, formatCostOrCredits(provider, t)),
              ))),
            ),
          ),
        h('p', { className: 'dsh-usage-provider-note' }, t('misc.keyLimit')),
      );
    }

    function PricingCard({ pricing, t }) {
      const flash = pricing && pricing.table ? pricing.table['deepseek-flash'] : null;
      const glm = pricing && pricing.glm ? pricing.glm : null;
      const rows = flash ? [
        { key: 'hit', label: t('chart.legendHit'), value: `¥${flash.hit.offpeak}–${flash.hit.peak} / 1M` },
        { key: 'miss', label: t('chart.legendMiss'), value: `¥${flash.miss.offpeak}–${flash.miss.peak} / 1M` },
        { key: 'output', label: t('chart.legendOutput'), value: `¥${flash.output.offpeak}–${flash.output.peak} / 1M` },
      ] : [];
      return h('section', { className: 'dsh-usage-pricing' },
        h('h2', { className: 'dsh-usage-card-title' }, t('section.pricing')),
        h('div', { className: 'dsh-usage-pricing-grid' }, rows.map((row) => h('div', { className: 'dsh-usage-price-cell', key: row.key },
          h('span', null, row.label),
          h('strong', null, row.value),
        ))),
        h('div', { className: 'dsh-usage-pricing-foot' },
          h('span', null, t('misc.pricingNote')),
          h('a', { href: 'https://api-docs.deepseek.com/zh-cn/quick_start/pricing/', target: '_blank', rel: 'noreferrer' }, t('misc.pricingLink')),
        ),
        glm ? h('div', { className: 'dsh-usage-pricing-glm' },
          h('div', null,
            h('strong', null, t('misc.glmPlan'), ' · ', t('misc.glmNotPriced')),
            h('span', null, t('misc.creditsNote')),
          ),
          h('a', { href: glm.source || 'https://docs.bigmodel.cn/cn/coding-plan/overview', target: '_blank', rel: 'noreferrer' }, t('misc.glmSource')),
        ) : null,
      );
    }

    function UsageIcon(props = {}) {
      const size = props.size || 20;
      const useSessions = typeof props.useSessions === 'function' ? props.useSessions : () => null;
      const currentId = useSessions((state) => {
        if (!state || !state.byId) return null;
        const current = Object.values(state.byId).find((session) => (session.retainedBy && session.retainedBy.mainView ? session.retainedBy.mainView : 0) > 0);
        return current ? current.id : null;
      });
      if (currentId) lastActiveSessionId = currentId;
      return h('svg', {
        viewBox: '0 0 24 24',
        width: size,
        height: size,
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 1.8,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': true,
        style: { display: 'block' },
      },
        h('path', { d: 'M4 20h16' }),
        h('path', { d: 'M6.5 17V11' }),
        h('path', { d: 'M12 17V6.5' }),
        h('path', { d: 'M17.5 17v-4' }),
        h('path', { d: 'M5 9.5 10 5l4 3 5-5' }),
      );
    }

    function Style() {
      return h('style', { dangerouslySetInnerHTML: { __html: CSS } });
    }

    return {
      inject: ['slots', 'locale'],
      apply(ctx) {
        ctx.effect(() => ctx.locale.register(NS, 'zh', ZH));
        ctx.effect(() => ctx.locale.register(NS, 'en', EN));

        const t = ctx.locale.bind(NS);
        const subscribeLocale = (callback) => ctx.locale.subscribe(callback);
        const getLocaleSnapshot = () => ctx.locale.getSnapshot();

        function UsagePanel(props = {}) {
          const localeSnapshot = useSyncExternalStore(subscribeLocale, getLocaleSnapshot, getLocaleSnapshot);
          const activeLocale = localeSnapshot && localeSnapshot.active ? localeSnapshot.active : undefined;
          const useSessions = typeof props.useSessions === 'function' ? props.useSessions : () => null;
          const liveSessionId = useSessions((state) => {
            if (!state || !state.byId) return null;
            const current = Object.values(state.byId).find((session) => (session.retainedBy && session.retainedBy.mainView ? session.retainedBy.mainView : 0) > 0);
            return current ? current.id : null;
          });
          const currentSessionId = liveSessionId || lastActiveSessionId;
          const [state, setState] = useState({ status: 'loading', data: null, error: null });
          const [refreshing, setRefreshing] = useState(false);

          const load = useCallback(async (force) => {
            if (force) setRefreshing(true);
            else setState((current) => current.data ? current : { status: 'loading', data: null, error: null });
            try {
              const response = await fetch(`/usage-insights.json${force ? '?refresh=1' : ''}`, {
                cache: 'no-store',
                headers: { accept: 'application/json' },
              });
              if (!response.ok) throw new Error(`HTTP ${response.status}`);
              const payload = await response.json();
              if (payload && payload.error) throw new Error(payload.error);
              setState({ status: 'ready', data: payload, error: null });
            } catch (error) {
              setState((current) => ({
                status: current.data ? 'ready' : 'error',
                data: current.data,
                error: error instanceof Error ? error.message : String(error),
              }));
            } finally {
              setRefreshing(false);
            }
          }, []);

          useEffect(() => {
            load(false);
          }, [load]);

          if (!state.data) {
            return h('div', { className: 'dsh-usage-page' },
              h(Style),
              h('div', { className: 'dsh-usage-inner' },
                h('div', { className: 'dsh-usage-status', 'aria-live': 'polite' },
                  state.status === 'error'
                    ? h(React.Fragment, null,
                      h('h2', null, t('page.error')),
                      h('p', null, state.error || ''),
                      h('button', { className: 'dsh-usage-refresh', type: 'button', onClick: () => load(false) }, t('page.retry')),
                    )
                    : h(React.Fragment, null,
                      h('div', { className: 'dsh-usage-spinner', 'aria-hidden': 'true' }),
                      h('p', null, t('page.loading')),
                    ),
                ),
              ),
            );
          }

          const data = state.data;
          const periods = data.periods || {};
          const daily = Array.isArray(data.daily) ? data.daily : [];
          const models = Array.isArray(data.models) ? data.models : [];
          const providers = Array.isArray(data.providers) ? data.providers : [];
          const sessions = Array.isArray(data.sessions) ? data.sessions : [];
          const currentSession = currentSessionId
            ? sessions.find((session) => session.id === currentSessionId) || null
            : null;
          const last30 = periods.last30 || {};
          const totalCalls = data.meta && data.meta.calls ? data.meta.calls : 0;
          const sameWindow = last30.calls > 0
            && periods.last7 && periods.today
            && periods.last7.calls === periods.today.calls
            && last30.calls === periods.today.calls
            && periods.month && periods.month.calls === periods.today.calls
            && periods.all && periods.all.calls === periods.today.calls;
          const updated = new Intl.DateTimeFormat(activeLocale || undefined, {
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
          }).format(new Date(data.generatedAt || Date.now()));

          return h('div', { className: 'dsh-usage-page' },
            h(Style),
            h('div', { className: 'dsh-usage-inner' },
              h('header', { className: 'dsh-usage-header' },
                h('div', null,
                  h('h1', { className: 'dsh-usage-title' }, t('page.title')),
                  h('p', { className: 'dsh-usage-subtitle' }, t('page.subtitle')),
                ),
                h('div', { className: 'dsh-usage-header-side' },
                  h('span', { className: 'dsh-usage-updated' }, `${t('page.updated')} ${updated} · ${totalCalls} ${t('stats.calls')}`),
                  h('button', {
                    className: 'dsh-usage-refresh',
                    type: 'button',
                    disabled: refreshing,
                    onClick: () => load(true),
                  }, refreshing ? t('page.refreshing') : t('page.refresh')),
                ),
              ),

              totalCalls === 0
                ? h('div', { className: 'dsh-usage-status' },
                  h('h2', null, t('page.emptyTitle')),
                  h('p', null, t('page.emptyBody')),
                )
                : h(React.Fragment, null,
                  currentSession ? h(CurrentSessionStrip, { session: currentSession, t }) : null,
                  h('div', { className: 'dsh-usage-kpis' },
                    h(StatCard, { label: t('period.today'), stats: periods.today || {}, t }),
                    h(StatCard, { label: t('period.last7'), stats: periods.last7 || {}, t }),
                    h(StatCard, { label: t('period.last30'), stats: last30, t }),
                    h(StatCard, { label: t('period.month'), stats: periods.month || {}, t }),
                    h(StatCard, { label: t('period.all'), stats: periods.all || {}, t }),
                  ),
                  sameWindow ? h('div', { className: 'dsh-usage-window-hint' }, t('misc.sameWindow')) : null,
                  h(TokenChart, { data: daily, t }),
                  h(CostChart, { data: daily, t }),
                  h('div', { className: 'dsh-usage-two-col' },
                    h(PeakCard, { stats: last30.deepseek, t }),
                    h(CacheCard, { stats: last30, t }),
                  ),
                  h(GlmCard, { stats: last30.glm, periods, t }),
                  h(ProvidersCard, { providers, t }),
                  h(ModelsCard, { models, t }),
                  h(SessionsCard, { sessions, t, locale: activeLocale }),
                  h(PricingCard, { pricing: data.pricing, t }),
                ),

              state.error
                ? h('p', { className: 'dsh-usage-updated', style: { marginTop: '12px' } }, state.error)
                : null,
            ),
          );
        }

        ctx.slots.inject('main', () => ctx.slots.register({
          name: 'main',
          key: 'usage-insights',
        }, UsagePanel));

        ctx.slots.inject('sidebar.panellist', () => ctx.slots.register({
          name: 'sidebar.panellist',
          id: 'usage-insights',
          order: 20,
          label: () => t('panel.title'),
        }, UsageIcon));
      },
    };
  },
});
