# Senti-UI

[**中文文档**](./README.zh-CN.md)

A **UI component library designed for AI**: built on [ofa.js](https://github.com/ofajs/ofa.js) (a Web Components framework), with a Google Material Design 3 (M3) color system. **No build step, purely static — load from CDN and use immediately.**

Repository: <https://github.com/ofajs/senti-ui>

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](./LICENSE)
[![GitHub Repo stars](https://img.shields.io/github/stars/ofajs/senti-ui?style=flat&logo=github)](https://github.com/ofajs/senti-ui/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/ofajs/senti-ui?style=flat&logo=github)](https://github.com/ofajs/senti-ui/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/ofajs/senti-ui?style=flat&logo=github)](https://github.com/ofajs/senti-ui/pulls)
[![jsDelivr](https://img.shields.io/jsdelivr/gh/hm/ofajs/senti-ui?style=flat&logo=jsdelivr)](https://www.jsdelivr.com/package/gh/ofajs/senti-ui)
[![GitHub last commit](https://img.shields.io/github/last-commit/ofajs/senti-ui?style=flat&logo=github)](https://github.com/ofajs/senti-ui/commits)
[![Made with ofa.js](https://img.shields.io/badge/made%20with-ofa.js-5f6ee7)](https://github.com/ofajs/ofa.js)
[![M3](https://img.shields.io/badge/color-Material%20Design%203-0061A4)](https://m3.material.io/styles/color/overview)
[![No Build](https://img.shields.io/badge/build-none-2ea44f?label=no%20build)](https://github.com/ofajs/senti-ui)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/ofajs/senti-ui/pulls)

## Design Philosophy (what makes it different from traditional libraries)

Traditional component libraries offer lots of "convenience presets" for humans (enums like `size="small"`). Senti-UI believes AI writes style/CSS directly with more precision and flexibility — presets are just an unnecessary memory burden. Therefore:

- **Attributes express semantics only** (`disabled` / `loading` / M3-spec `variant` / the `color` semantic reference) — no size presets, no `--st-*` style proxy variables
- **Appearance is customized with plain native CSS properties** — component visuals live entirely on `:host`, so `<st-button style="height:32px; border-radius:8px">` just works
- **Size defaults use em units** — change `font-size` to scale the whole component proportionally
- **Colors are never hard-coded** — always consume `--md-sys-color-*` M3 role variables, adapting to light/dark themes automatically
- **Material is swappable, color is not** — skins change shape/material (radius, density, borders, blur, motion) while all M3 roles stay intact; components never change their tags or attributes
- **The `color` attribute is a semantic reference**: its value is an M3 role name or a custom variable name defined in the color tool (e.g. `color="brand"` consumes `--brand/--on-brand`), enabling one-click re-theming via the color tool
- **Documentation written for AI**: self-contained, structured, facts only

## Quick Start

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
</head>
<body>
  <!-- Load components on demand (only what you use) -->
  <l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/button/button.html"></l-m>

  <st-button color="error" variant="outlined">Delete</st-button>
  <st-button>
    <span slot="prefix">🔍</span>Search
  </st-button>
</body>
</html>
```

- Components automatically import the color init module (`st-color-init.js`) to inject the `--md-sys-color-*` system — no extra setup needed
- Light/dark theme follows the system by default; force with `<html class="st-light">` / `<html class="st-dark">`
- For theming (seed color, custom colors) see the [M3 color generator](#theming): once configured, all pages on the same origin follow automatically

## Components

| Component | Tag | Import |
|------|------|------|
| Button | `st-button` | `<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/button/button.html"></l-m>` |
| Button group | `st-button-group` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/button/button-group.html` |
| Split button | `st-split-button` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/button/split-button.html` |
| Icon button | `st-icon-button` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/button/icon-button.html` |
| Input | `st-input` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/input/input.html` |
| Textarea | `st-textarea` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/textarea/textarea.html` |
| Select | `st-select` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/select/select.html` |
| Dialog | `st-dialog` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/dialog/dialog.html` |
| Dialog imperative utils | `alert/confirm/prompt` | `import alert from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/dialog/alert.js"` etc. |
| Checkbox | `st-checkbox` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/checkbox/checkbox.html` |
| Switch | `st-switch` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/switch/switch.html` |
| Radio | `st-radio` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/radio/radio.html` |
| Snackbar | `st-snackbar` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/snackbar/snackbar.html` |
| Toast imperative util | `toast` | `import toast from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/snackbar/toast.js"` |
| Slider | `st-slider` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/slider/slider.html` |
| Progress | `st-progress` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/progress/progress.html` |
| Tooltip | `st-tooltip` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/tooltip/tooltip.html` |
| Card | `st-card` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/card/card.html` |
| Badges | `st-badges` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/badges/badges.html` |
| Collapse | `st-collapse` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/collapse/collapse.html` |
| List | `st-list` / `st-list-item` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/list/list.html` |
| Menu | `st-menu` / `st-menu-item` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/menu/menu.html` |
| Tabs | `st-tab-bar` / `st-tab-item` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/tabs/tab-bar.html` |
| Navigation bar | `st-nav-bar` / `st-nav-item` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/navigation/nav-bar.html` |
| Ripple | `st-ripple` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/ripple/ripple.html` |

Full docs (attribute tables, slots, events, default value lists) live in each package's `README.md` (e.g. `.../packages/button/README.md`).

## Key Usage Patterns

- **Runtime state is not a tag attribute** — `value` on `st-input`/`st-select`/`st-slider`, `open` on `st-dialog`/`st-tooltip` etc. are runtime state: read/write via `el.value` / `el.open` in JS (`setAttribute("value")` has no effect; use the `default-value` tag attribute for initial values)
- **Boolean attributes must be toggled via attributes** (`$("el").attr("disabled", "")` to set, `attr("disabled", null)` to remove) — assigning properties directly does not trigger updates
- Imperative utils are promise-based and align with native semantics:

```html
<script type="module">
  import confirm from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/dialog/confirm.js";
  import toast from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/snackbar/toast.js";

  if (await confirm("Delete?")) {   // true / false / null (dismissed)
    toast("Deleted", { duration: 3000 }); // bottom-left toast, returns { close, el }
  }
</script>
```

## Theming

The [M3 color generator](https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/color/index.html) generates a full light/dark M3 system (`--md-sys-color-*`) from a seed color, with overrides for the core four roles + the extended `success` role, custom variables (auto-expanded into paired tokens like `--brand` / `--on-brand`), and a **contrast boost** (0–1, globally or per role) for neon/game themes. The configuration is stored in localStorage — once set in the tool, every page on the same origin that includes `st-color-init.js` follows automatically (one-click re-theming).

For manual control:

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/color/st-color-init.js"></script>
```

## Skins (material layer)

The same components can switch **material** without changing colors: `m3` (default), `apple` (glassmorphism), `windows` (Windows 11 / Fluent: Mica + Acrylic), `shadcn` (flat, hairline borders), `cyberpunk` (zero radius, monospace, neon edges and glow). Skins only affect radius, density, borders, shadows, backdrop blur, focus rings, motion and ripple — every skin consumes the same M3 role variables, so seed color, `error`, `success` and light/dark mode keep working.

```html
<html data-skin="apple">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/skin/apple.css">
<st-button color="error">Delete</st-button>
```

Switch at runtime with `setSkin("windows")` from `packages/skin/st-skin.js` (persists and syncs across same-origin windows). All interactive and surface components consume the skin tokens; the full token / `part` contract and how to author a custom skin are in [packages/skin/README.md](./packages/skin/README.md).

The website adds a **theme preset** layer on top (only in `site/theme-presets.js`, not part of the package API): each material ships with an official palette (M3 blue / Apple iOS blue / Windows blue / shadcn zinc / Cyberpunk neon lime) and, for Cyberpunk, a full contrast boost with `contrastTone: "bright"`, applied together on switch and remembered per material (color + light/dark mode). `setSkin()` itself still changes material only.

## Website

A single-page showcase lives in [`site/`](./site/index.html), built with **SCSR** (ofa.js v5 real-path documents): every component on one page, live skin + light/dark switching, four side-by-side material previews, and a dedicated skin page at [`site/skins.html`](./site/skins.html). Each URL is a real HTML document; scsr turns it into an o-app page after load. Component docs live under [`site/docs/`](./site/docs/index.html) — one real SCSR page per component, with 4–7 scenario-based live demos, attribute tables and slots/events. The docs sidebar lives in a second-level SCSR layout, so it survives component-to-component navigation.

```bash
npm run dev
# http://localhost:8642/site/
```

## AI Usage

This repo ships an Agent Skill (`.agents/skills/senti-ui/`). Once loaded by AI tools like Claude Code / ZCode, the AI can use every component correctly: attributes, slots, events, runtime-state read/write patterns, and common pitfalls. See [SKILL.md](./.agents/skills/senti-ui/SKILL.md).

### Installing the Skill

A skill is just a directory containing `SKILL.md`. Pick one of three ways:

**Option 1: copy from this repo (recommended)**

```bash
git clone https://github.com/ofajs/senti-ui.git
# user-level (available in all projects)
cp -r senti-ui/.agents/skills/senti-ui ~/.agents/skills/
# or symlink, then `git pull` to update
ln -s "$(pwd)/senti-ui/.agents/skills/senti-ui" ~/.agents/skills/senti-ui
```

For a single project, copy it into that project's `.agents/skills/` (or `.zcode/skills/`).

**Option 2: zip package**

```bash
# Download the pre-built zip directly (no clone needed)
curl -fsSL -o senti-ui-skill.zip https://raw.githubusercontent.com/ofajs/senti-ui/main/.agents/skills/senti-ui-skill.zip
unzip senti-ui-skill.zip -d ~/.agents/skills/

# Or pack it yourself from a cloned repo (output is .agents/skills/senti-ui-skill.zip, unzips to a senti-ui/ directory)
npm run pack-skill   # runs scripts/pack-skill.mjs (zero-dependency Node script)

unzip .agents/skills/senti-ui-skill.zip -d ~/.agents/skills/
```

**Option 3: use it inside a cloned repo**

When an AI works inside this repository, `.agents/skills/senti-ui/` is discovered automatically — nothing to do.

## Local Development

```bash
npm install
npm run dev    # http-server with cache disabled, port 8642
npm test       # Playwright e2e tests (run `npx playwright install chromium` first)
```

- Read [AGENTS.md](./AGENTS.md) (development rules) and [CONTEXT.md](./CONTEXT.md) (project overview + component index + known ofa.js pitfalls) before adding or modifying components
- Component docs site: `site/docs/` (nested SCSR layout), at `http://localhost:8642/site/docs/`

## License

See [LICENSE](./LICENSE).
