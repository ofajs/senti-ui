---
name: "senti-ui"
description: "Senti-UI component library knowledge base (ofa.js + Material Design 3, no build step). Invoke when the user asks about Senti-UI or st-* components, wants to build a web page/app UI with senti-ui, asks about st-button / st-input / st-dialog / stToast etc., theming with M3 color tokens, or developing new components based on senti-ui."
---

# Senti-UI 组件库使用指南

Senti-UI 是**面向 AI 设计**的 UI 组件库：基于 ofa.js（Web Components），颜色走 Google Material Design 3（M3）角色变量，**无构建、纯静态、CDN 引入即用**。

## 核心理念（先读，决定你怎么写代码）

传统组件库给人准备了大量枚举预设（`size="small"`、`color="primary"`）。Senti-UI 认为对 AI 这些是负担：

- **属性只表达语义**（`disabled` / `loading` / M3 规范内的 `variant` / `color` 语义色引用），**没有 size 类预设，也没有 `--st-*` 样式代理变量**
- **外观定制 = 直接写原生 CSS 属性**。组件视觉全部定义在 `:host` 上，`<st-button style="height:32px; border-radius:8px">` 直接生效
- **尺寸默认值全用 em**——只改 `font-size` 即整体等比缩放；需要非等比再单独覆写
- **颜色永不写死**，一律消费 `--md-sys-color-*` M3 角色变量（自动适配深浅色主题）
- `color` 属性的值是 **M3 角色名**（primary/secondary/tertiary/error/success…）或 **color 工具定义的自定义变量名**（如 `color="brand"` 消费 `--brand/--on-brand`），组件自动配对底色/文字色——这是语义引用，不是样式预设

所以：想改大小 → `style="font-size: 12px"`；想改颜色 → `color="error"` 或 `style="background: var(--md-sys-color-error)"`；**不要找 size/type 枚举，不要发明 CSS 变量**。

## 快速开始

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
</head>
<body>
  <!-- 按需引入组件（l-m 会异步加载并注册自定义元素） -->
  <l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/button/button.html"></l-m>

  <st-button color="error" variant="outlined">Delete</st-button>
</body>
</html>
```

- 每个 `l-m` 引入一个组件文件，用哪个引哪个；组件内部会自动 import 颜色初始化模块（`st-init.js`）注入 `--md-sys-color-*` 体系，无需额外配置
- 深浅色主题默认跟随系统；强制用 `<html class="st-light">` / `<html class="st-dark">`
- 主题定制（种子色、自定义色）见 [references/theming.md](./references/theming.md)

## 组件清单

CDN 前缀统一为 `https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main`，下表引入语句省略前缀（实际使用必须写全）。

| 组件 | 标签 | 引入（补全前缀） |
|------|------|------|
| 按钮 | `st-button` | `<l-m src=".../packages/button/button.html">` |
| 按钮组 | `st-button-group` | `.../packages/button/button-group.html` |
| 分裂按钮 | `st-split-button` | `.../packages/button/split-button.html` |
| 图标按钮 | `st-icon-button` | `.../packages/button/icon-button.html` |
| 单行输入框 | `st-input` | `.../packages/input/input.html` |
| 多行输入框 | `st-textarea` | `.../packages/textarea/textarea.html` |
| 单选下拉框 | `st-select` | `.../packages/select/select.html` |
| 对话框 | `st-dialog` | `.../packages/dialog/dialog.html` |
| 对话框命令式工具 | `stAlert/stConfirm/stPrompt` | `import stAlert from ".../packages/dialog/alert.js"` 等 |
| 复选框 | `st-checkbox` | `.../packages/checkbox/checkbox.html` |
| 开关 | `st-switch` | `.../packages/switch/switch.html` |
| 单选按钮 | `st-radio` | `.../packages/radio/radio.html` |
| 消息条 | `st-snackbar` | `.../packages/snackbar/snackbar.html` |
| Toast 命令式工具 | `stToast` | `import stToast from ".../packages/snackbar/toast.js"` |
| 滑块 | `st-slider` | `.../packages/slider/slider.html` |
| 进度 | `st-progress` | `.../packages/progress/progress.html` |
| 提示 | `st-tooltip` | `.../packages/tooltip/tooltip.html` |
| 卡片 | `st-card` | `.../packages/card/card.html` |
| 徽标 | `st-badges` | `.../packages/badges/badges.html` |
| 折叠容器 | `st-collapse` | `.../packages/collapse/collapse.html` |
| 列表 | `st-list` / `st-list-item` | `.../packages/list/list.html` |
| 下拉菜单 | `st-menu` / `st-menu-item` | `.../packages/menu/menu.html` |
| 标签栏 | `st-tab-bar` / `st-tab-item` | `.../packages/tabs/tab-bar.html` |
| 导航栏 | `st-nav-bar` / `st-nav-item` | `.../packages/navigation/nav-bar.html` |
| 波纹 | `st-ripple` | `.../packages/ripple/ripple.html` |

## 必读的关键使用模式

1. **运行时状态不是标签属性**——`st-input`/`st-textarea`/`st-select`/`st-slider` 的 `value`，`st-dialog`/`st-tooltip` 的 `open` 等是运行时状态：JS 用 `el.value` / `el.open` 读写，`setAttribute("value")` 无效（初始值用 `default-value` 标签属性）
2. **布尔属性的 JS 修改必须用 setAttribute/removeAttribute**——直接改 property 不触发更新
3. 每个组件的完整属性表、插槽、事件、默认值与特有坑，见 [references/components.md](./references/components.md)

深入阅读顺序建议：写页面前读 [references/usage-patterns.md](./references/usage-patterns.md)（ofa.js 数据绑定语法 + 消费方常见坑）；改主题读 [references/theming.md](./references/theming.md)；用具体组件前查 components.md 对应章节，需要更完整事实时按文内给出的 jsdelivr URL 拉取该组件的 README.md。
