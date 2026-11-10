# Senti-UI

[**English**](./README.md)

**面向 AI 的 UI 组件库**：行为统一，VI 自由。基于 [ofa.js](https://github.com/ofajs/ofa.js) v5（Web Components），颜色体系采用 Google Material Design 3（M3）。**无构建、纯静态，CDN 引入即用**。

官网：<https://senti.ofajs.com/site/>

仓库地址：<https://github.com/ofajs/senti-ui>

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

## 设计理念：行为统一，VI 自由

用框架省下组件开发时间，也常顺带接受它的设计语言。Senti-UI 把这两件事拆开：**交互契约固定，视觉交给页面**。组件可以长得不一样，行为必须一样——按钮怎么禁用、输入框怎么报错、菜单怎么关闭、弹窗打开后焦点怎么归还。视觉则通过原生 CSS 与皮肤暴露。

AI 让重新写一个组件变得便宜，但让所有组件保持同一种行为，仍然是贵的那部分。

- **行为是共用的**：标签、属性、插槽、事件、状态在所有项目里一致。键盘、焦点、禁用、事件穿透、表单提交与可访问名称属于组件契约，不交给每个页面即兴决定。
- **VI 是自己的**：属性只表达语义（`disabled` / `loading` / M3 规范内的 `variant` / `color` 语义引用），没有 size 类预设。外观直接写原生 CSS，组件视觉定义在 `:host` 上，`<st-button style="height:32px; border-radius:8px">` 直接生效。
- **`--st-*` 只属于皮肤作者**：使用者不拿尺寸代理变量。圆角、密度、描边、阴影、毛玻璃、焦点环与动效是皮肤声明的材质 token；颜色永远不放进这里。
- **尺寸默认值用 em**：改 `font-size` 即整体等比缩放；需要非等比尺寸时，仍可单独覆写任一 CSS 属性。
- **借 M3 的关系，不借全部 token**：只保留 34 个 `--md-sys-color-*`——5 个角色（primary / secondary / tertiary / error / success）各 4 个配对 token，共 20 个，加 14 个中性色；`success` 是 M3 核心规范之外的扩展角色。`background`、`surface-tint`、`scrim`、`shadow`、`surface-dim`、`surface-bright` 这些名字被有意去掉：现有角色已经承担，或本身就是固定值。`color` 属性的值是角色名或自定义变量名（如 `color="brand"` 消费 `--brand/--on-brand`）。
- **对比度属于配色，不属于皮肤**：`contrast` 范围 -1 ~ 1（可整体或按角色设置），保持色相重新取 tone；深色模式用 `contrastTone: "deep" | "bright"` 决定角色色向暗压还是向亮提。皮肤只改材质，换肤不改变颜色关系。
- **label 是页面排版**：`st-input` 有意不内置 M3 浮动标签。视觉 label 由页面组合；屏幕阅读器需要的名称通过 `aria-label` / `aria-labelledby` 交给内部原生 input。这样同一个字段才能放进 M3、Apple、Windows 11 与 shadcn 的不同表单排版。
- **文档写给 AI 读**：自包含、结构化、只含事实。

层与层保持分离：color 模块管角色关系，皮肤管材质，页面管排版与 label，组件管交互行为。

```html
<div class="field">
  <span class="field-label">邮箱</span>
  <st-input type="email" aria-label="邮箱" placeholder="you@example.com"></st-input>
</div>
```

更完整的取舍见手记 [《行为统一，VI 自由》](./site/notes/behavior-and-skin.html)。

## 快速开始

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
</head>
<body>
  <!-- 按需引入组件（用哪个引哪个） -->
  <l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/button/button.html"></l-m>

  <st-button color="error" variant="outlined">Delete</st-button>
  <st-button>
    <span slot="prefix">🔍</span>Search
  </st-button>
</body>
</html>
```

- 组件内部会自动 import 颜色初始化模块（`st-color-init.js`）注入 `--md-sys-color-*` 体系，无需额外配置
- 深浅色主题默认跟随系统；强制用 `<html class="st-light">` / `<html class="st-dark">`
- 主题定制（种子色、自定义色）用 [M3 颜色体系生成器](#主题定制)：调好配色后，同域所有页面自动跟随

## 组件清单

CDN 前缀统一为 `https://cdn.jsdelivr.net/gh/ofajs/senti-ui`，下表引入语句省略前缀（实际使用必须写全）。文档在各组件目录的 `README.md`（如 `.../packages/button/README.md`）。

| 组件 | 标签 | 引入 |
|------|------|------|
| Button 按钮 | `st-button` | `<l-m src=".../packages/button/button.html"></l-m>` |
| Button-group 按钮组 | `st-button-group` | `.../packages/button/button-group.html` |
| Split-button 分裂按钮 | `st-split-button` | `.../packages/button/split-button.html` |
| Icon-button 图标按钮 | `st-icon-button` | `.../packages/button/icon-button.html` |
| Input 单行输入框 | `st-input` | `.../packages/input/input.html` |
| Textarea 多行输入框 | `st-textarea` | `.../packages/textarea/textarea.html` |
| Select 单选下拉框 | `st-select` / `st-option` | `.../packages/select/select.html` |
| Dialog 对话框 | `st-dialog` | `.../packages/dialog/dialog.html` |
| Drawer 侧边抽屉 | `st-drawer` | `.../packages/drawer/drawer.html` |
| Dialog 命令式工具 | `alert/confirm/prompt` | `import alert from ".../packages/dialog/alert.js"` 等 |
| Checkbox 复选框 | `st-checkbox` | `.../packages/checkbox/checkbox.html` |
| Switch 开关 | `st-switch` | `.../packages/switch/switch.html` |
| Radio 单选按钮 | `st-radio` | `.../packages/radio/radio.html` |
| Snackbar 消息条 | `st-snackbar` | `.../packages/snackbar/snackbar.html` |
| Toast 命令式工具 | `toast` | `import toast from ".../packages/snackbar/toast.js"` |
| Slider 滑块 | `st-slider` | `.../packages/slider/slider.html` |
| Progress 进度 | `st-progress` | `.../packages/progress/progress.html` |
| Tooltip 提示 | `st-tooltip` | `.../packages/tooltip/tooltip.html` |
| Card 卡片 | `st-card` | `.../packages/card/card.html` |
| Badges 徽标 | `st-badges` | `.../packages/badges/badges.html` |
| Chip 筛选小片 | `st-chip` | `.../packages/chip/chip.html` |
| Avatar 头像 | `st-avatar` | `.../packages/avatar/avatar.html` |
| Skeleton 加载占位 | `st-skeleton` | `.../packages/skeleton/skeleton.html` |
| Collapse 折叠容器 | `st-collapse` | `.../packages/collapse/collapse.html` |
| List 列表 | `st-list` / `st-list-item` | `.../packages/list/list.html` |
| Menu 下拉菜单 | `st-menu` / `st-menu-item` | `.../packages/menu/menu.html` |
| Context-menu 命令式工具 | `contextMenu` | `import contextMenu from ".../packages/menu/context-menu.js"` |
| Tabs 标签栏 | `st-tab-bar` / `st-tab-item` | `.../packages/tabs/tab-bar.html` |
| Navigation 导航栏 / 布局 | `st-nav-bar` / `st-nav-item` / `st-nav-layout` | `.../packages/navigation/nav-bar.html` + `.../packages/navigation/nav-layout.html` |
| Ripple 波纹 | `st-ripple` | `.../packages/ripple/ripple.html` |
| Code 代码块 | `st-code` | `.../packages/code/code.html` |

## 关键使用模式

- **运行时状态不是标签属性**——`st-input`/`st-select`/`st-slider` 的 `value`，`st-dialog`/`st-drawer`/`st-tooltip` 的 `open` 等是运行时状态：JS 用 `el.value` / `el.open` 读写，`setAttribute("value")` 无效（初始值用 `default-value` 标签属性）
- **布尔属性的 JS 修改必须用 `setAttribute` / `removeAttribute`**——直接改 property 不触发更新
- 命令式工具即用即毁，返回 Promise，对齐原生语义：

```html
<script type="module">
  import confirm from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/dialog/confirm.js";
  import toast from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/snackbar/toast.js";

  if (await confirm("确认删除？")) {   // true / false / null（被关闭）
    toast("已删除", { duration: 3000 }); // 左下角 toast，返回 { close, el }
  }
</script>
```

## 主题定制

[M3 颜色体系生成器](https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/color/index.html) 从种子色生成完整浅色/深色 M3 体系（`--md-sys-color-*`），支持核心四角色 + 扩展角色 success 覆盖、自定义变量（自动展开 `--brand` / `--on-brand` 等配对 token），以及**对比度调整**（`contrast`，-1 ~ 1，可整体或按角色设置；正值用于霓虹 / 游戏类主题，负值用于可爱 / 柔和主题），深色模式还可用 `contrastTone: "deep" | "bright"` 决定提亮或压暗方向。对比度属于配色，不属于皮肤。配置存 localStorage——在工具里调好配色，同域所有引入 `st-color-init.js` 的页面自动跟随（一键换色）。

需要手动控制时：

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/color/st-color-init.js"></script>
```

## 皮肤（材质层）

同一批组件可以只换**材质**、不换颜色：`m3`（默认）/ `apple`（毛玻璃）/ `windows`（Windows 11 / Fluent：Mica + Acrylic）/ `shadcn`（扁平细描边）/ `cyberpunk`（零圆角、等宽字、霓虹描边与发光）。皮肤只影响圆角、密度、描边、阴影、毛玻璃、焦点环、动效与波纹；所有皮肤消费同一套 M3 角色变量，种子色、`error`、`success` 与深浅色主题继续生效。

```html
<html data-skin="apple">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/skin/apple.css">
<st-button color="error">删除</st-button>
```

运行时用 `packages/skin/st-skin.js` 的 `setSkin("windows")` 切换（持久化并跨同源窗口同步）。全部交互与表面组件都已接入；完整 token / `part` 契约与自定义皮肤写法见 [packages/skin/README.md](./packages/skin/README.md)。

官网另有一层**主题预设**（只存在于 `site/theme-presets.js`，不属于包 API）：每套材质配一套官方配色（M3 蓝 / Apple iOS 蓝 / Windows 蓝 / shadcn zinc / Cyberpunk 荧光绿，并带满档对比度 + 提亮方向），切换时一并套用，并按材质记住各自的颜色；深浅模式是全局设置，默认不随主题切换（Cyberpunk 深色优先：从浅色进入时切深色，之后保持深色）；`setSkin()` 本身仍然只换材质。

## 官网首页

线上地址：<https://senti.ofajs.com/site/> —— 组件文档：<https://senti.ofajs.com/site/docs/>。

单页聚合官网在 [`site/`](./site/index.html)：全部组件摆在一页，支持实时换肤、深浅色切换与三张平台预览卡并排对比；独立皮肤页在 [`site/skins.html`](./site/skins.html)，可选 M3 / Apple / Windows / shadcn / Cyberpunk 五套材质，顶部快捷菜单只保留三巨头材质。采用 **ofa.js v5 + scsr**（真实路径文档；加载后由 scsr 收编为 o-app 页面）。组件使用说明在 [`site/docs/`](./site/docs/index.html)：每个组件一个独立 SCSR 页，按场景拆成 4–7 组可交互示例，并附属性表、插槽 / 事件；左侧目录由二级 SCSR 父页共享，组件间切换不销毁。

```bash
npm run dev
# 本地：http://localhost:8642/site/
```

## AI 使用

本库附带 Agent Skill（`.agents/skills/senti-ui/`），Claude Code / ZCode 等 AI 工具加载后即可正确使用全部组件：组件属性、插槽、事件、运行时状态读写方式与常见坑。详见 [SKILL.md](./.agents/skills/senti-ui/SKILL.md)。

### 导入技能

技能就是一个包含 `SKILL.md` 的目录，三种方式任选：

**方式一：从本仓库复制（推荐）**

```bash
git clone https://github.com/ofajs/senti-ui.git
# 用户级（所有项目可用）
cp -r senti-ui/.agents/skills/senti-ui ~/.agents/skills/
# 或软链，git pull 即可更新
ln -s "$(pwd)/senti-ui/.agents/skills/senti-ui" ~/.agents/skills/senti-ui
```

放在项目里则复制到 `.agents/skills/`（或 `.zcode/skills/`）下。

**方式二：zip 包**

```bash
# 直接下载已打包好的 zip（无需克隆仓库）
curl -fsSL -o senti-ui-skill.zip https://raw.githubusercontent.com/ofajs/senti-ui/main/.agents/skills/senti-ui-skill.zip
unzip senti-ui-skill.zip -d ~/.agents/skills/

# 或在克隆的仓库内自行打包（产物为 .agents/skills/senti-ui-skill.zip，解压得到 senti-ui/ 目录）
npm run pack-skill   # 即 scripts/pack-skill.mjs（零依赖 Node 脚本）

unzip .agents/skills/senti-ui-skill.zip -d ~/.agents/skills/
```

**方式三：直接在克隆的仓库内使用**

AI 进入本仓库工作时，`.agents/skills/senti-ui/` 会被自动发现，无需额外操作。

## 本地开发

```bash
npm install
npm run dev    # http-server 禁缓存，端口 8642
npm test       # Playwright 端到端测试（须先 npx playwright install chromium）
```

- 新增/修改组件请先阅读 [AGENTS.md](./AGENTS.md)（开发规则）与 [CONTEXT.md](./CONTEXT.md)（项目全景 + 组件索引 + ofa.js 已知坑）
- 组件官网：`site/docs/` 二级 SCSR 布局 —— 线上 <https://senti.ofajs.com/site/docs/>，本地 `http://localhost:8642/site/docs/`

## License

见 [LICENSE](./LICENSE)。
