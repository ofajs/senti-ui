# DSH Usage Insights

A DeepSeek Harness Web plugin that adds a **Usage & cost** entry to the left
sidebar and a central dashboard for the local profile.

## What it shows

- **Today (current)**, **last 7 days**, **last 30 days**, **this month**, and
  **all time** totals.
- A **current session** strip for the conversation you opened most recently
  (the sidebar icon remembers the active Session before the panel opens).
- Input tokens split into **cache hits** and **cache misses**, plus output
  tokens.
- Costs split into **peak** and **off-peak** periods using DeepSeek's public
  per-million-token prices.
- 30-day stacked bar charts for token composition and DeepSeek daily cost.
- Peak/off-peak share, cache hit-rate donut, cache savings, model distribution,
  and a per-session cost ranking.
- **GLM Coding Plan** usage without a CNY price: token totals, peak/off-peak
  windows, and estimated plan credits.
- **Provider / key** breakdown. The session log stores the provider route but
  not the API key, so each key configured as a separate provider gets its own
  row; `providerLabels` can give those rows friendly names.

Prices currently cover:

| Model | Cache hit (off-peak / peak) | Cache miss (off-peak / peak) | Output (off-peak / peak) |
|---|---|---|---|
| `deepseek-flash` | ¥0.02 / ¥0.04 | ¥1 / ¥2 | ¥4 / ¥8 |
| `deepseek-v4-pro` | ¥0.15 / ¥0.30 | ¥4.5 / ¥9 | ¥13.5 / ¥27 |

Peak hours are **Monday–Friday 09:00–12:00 and 14:00–18:00 Asia/Shanghai**
on ordinary weekdays. **Saturdays, Sundays, and Chinese statutory holidays are
off-peak all day**; every other time is off-peak too. The source is the
[official pricing page](https://api-docs.deepseek.com/zh-cn/quick_start/pricing/).

GLM Coding Plan calls are detected from a `glm` / `zhipu` / `bigmodel` / `z.ai`
provider or model name. They use GLM's own peak window (**Monday–Friday
14:00–18:00**) and a **50% off-peak credit multiplier**. Credits are estimated
from the official coefficients (input 6.9 / cached 1.7 / output 24 for
GLM-5.3; 2.3 / 0.56 / 8 for GLM-5.3-Flash), excluding MCP tool calls. See the
[GLM Coding Plan overview](https://docs.bigmodel.cn/cn/coding-plan/overview).

## How it reads data

The Host half uses `ctx.sessionQuery` to read every persisted or live session,
folds `assistant/message` usage records, and deduplicates them by assistant
message id so forked sessions do not double-count inherited messages. The
aggregate is served at `/usage-insights.json`; the Client half renders it with
the host theme tokens.

## Install

The package is already installed in the Desktop profile from this checkout. To
install it in another profile:

```sh
dsh --profile <name>
```

Then use the plugin manager's `install_bundle` action with the absolute path to
this directory, or from the Harness UI choose the local bundle.

## Configuration

The patch row accepts:

```yaml
- id: usage-insights
  name: '@local/dsh-usage-insights'
  config:
    cacheTtlMs: 20000   # aggregate cache; the UI refresh button bypasses it
    holidays: []        # extra YYYY-MM-DD dates treated as off-peak
    providerLabels:     # display names for provider/key rows
      deepseek-official: DeepSeek 主 Key
      zhipu: GLM Coding Plan
```

The built-in holiday list covers 2025 and 2026. Other years fall back to the
weekday rule until dates are added.

## Key separation

The session log records the **provider route** (`message.source.provider`) but
not the API key. If two keys share one provider id they cannot be separated by
this dashboard. Configure each key as its own provider (then optionally name it
with `providerLabels`) and the provider table will show one row per key.
