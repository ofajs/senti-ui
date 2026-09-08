---
name: "senti-ui"
description: "Senti-UI component library knowledge base (ofa.js + Material Design 3, no build step). Invoke when the user asks about Senti-UI or st-* components, wants to build a web page/app UI with senti-ui, asks about st-button / st-input / st-dialog / toast etc., theming with M3 color tokens, or developing new components based on senti-ui."
version: "1.0.9"
---

# Senti-UI 组件库使用指南

Senti-UI 是**面向 AI 设计**的 UI 组件库：基于 ofa.js（Web Components），颜色走 Google Material Design 3（M3）角色变量，**无构建、纯静态、CDN 引入即用**。

## 核心理念（先读，决定你怎么写代码）

传统组件库给人准备了大量枚举预设（`size="small"`）。Senti-UI 认为对 AI 这些是负担：

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
  <l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/button/button.html"></l-m>

  <st-button color="error" variant="outlined">Delete</st-button>
</body>
</html>
```

- 每个 `l-m` 引入一个组件文件，用哪个引哪个；组件内部会自动 import 颜色初始化模块（`st-color-init.js`）注入 `--md-sys-color-*` 体系，无需额外配置
- 深浅色主题默认跟随系统；强制用 `<html class="st-light">` / `<html class="st-dark">`
- **写任何自定义颜色前先读 [references/theming.md](./references/theming.md)**：完整 token 清单（32 个 M3 角色）、文字/背景配对规则（如 `primary` 底配 `on-primary` 字）、深浅色自动适配原理、种子色与自定义变量（`--brand` 四配对）的三种配置方式

## 组件清单

引入地址均为完整 jsdelivr URL，可直接使用。

| 组件 | 标签 | 引入 |
|------|------|------|
| 按钮 | `st-button` | `<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/button/button.html">` |
| 按钮组 | `st-button-group` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/button/button-group.html` |
| 分裂按钮 | `st-split-button` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/button/split-button.html` |
| 图标按钮 | `st-icon-button` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/button/icon-button.html` |
| 单行输入框 | `st-input` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/input/input.html` |
| 多行输入框 | `st-textarea` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/textarea/textarea.html` |
| 单选下拉框 | `st-select` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/select/select.html` |
| 对话框 | `st-dialog` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/dialog/dialog.html` |
| 对话框命令式工具 | `alert/confirm/prompt` | `import alert from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/dialog/alert.js"` 等 |
| 复选框 | `st-checkbox` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/checkbox/checkbox.html` |
| 开关 | `st-switch` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/switch/switch.html` |
| 单选按钮 | `st-radio` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/radio/radio.html` |
| 消息条 | `st-snackbar` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/snackbar/snackbar.html` |
| Toast 命令式工具 | `toast` | `import toast from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/snackbar/toast.js"` |
| 滑块 | `st-slider` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/slider/slider.html` |
| 进度 | `st-progress` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/progress/progress.html` |
| 提示 | `st-tooltip` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/tooltip/tooltip.html` |
| 卡片 | `st-card` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/card/card.html` |
| 徽标 | `st-badges` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/badges/badges.html` |
| 折叠容器 | `st-collapse` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/collapse/collapse.html` |
| 列表 | `st-list` / `st-list-item` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/list/list.html` |
| 下拉菜单 | `st-menu` / `st-menu-item` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/menu/menu.html` |
| 标签栏 | `st-tab-bar` / `st-tab-item` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/tabs/tab-bar.html` |
| 导航栏 | `st-nav-bar` / `st-nav-item` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/navigation/nav-bar.html` |
| 波纹 | `st-ripple` | `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/ripple/ripple.html` |

## 必读：写法优先级（适用于所有组件文档）

组件文档（references/components/）中的示例统一遵守本规则，文档内不再重复：

- **ofa 页面（`<o-page>` / `<o-app>`）中优先用模板绑定语法**：数据绑定 `{{xxx}}`（只能用于文本节点）、属性绑定 `attr:xxx="expr"`（布尔属性必须 `attr:`，不能 `:prop`——`:disabled="false"` 会把 false 序列化成字符串属性导致永远禁用）、双向绑定 `sync:value` / `sync:open`、事件 `on:click` / `on:input`（根级直接写方法名）
- **纯 JS 场景用 ofa 实例 API**：
  - `$("sel").attr(name, 值)` 设置值；`attr(name, "")` 只设置这个 attr（裸属性）；`attr(name, null)` 去掉这个 attr
  - `$("sel").on("event", fn)` 监听事件
  - 运行时状态读写用 `$("sel").value` / `el.value`（DOM property，`attr("value", ...)` 无效）
- **不要写原生 DOM API**：`setAttribute` / `removeAttribute` / `el.disabled = true`（改 property 不触发更新）/ `document.querySelector(...).addEventListener(...)`

详见 [references/usage-patterns.md](./references/usage-patterns.md)。

## 其他关键模式

1. **运行时状态不是标签属性**——`st-input`/`st-textarea`/`st-select`/`st-slider` 的 `value`，`st-dialog`/`st-tooltip` 的 `open` 等是运行时状态：JS 用 `el.value` / `el.open` 读写，`setAttribute("value")` 无效（初始值用 `default-value` 标签属性）
2. 每个组件的完整属性表、插槽、事件、默认值与特有坑，见 [references/components.md](./references/components.md)

深入阅读顺序建议：写页面前读 [references/usage-patterns.md](./references/usage-patterns.md)（ofa.js 数据绑定语法 + 消费方常见坑）；改主题读 [references/theming.md](./references/theming.md)；用具体组件前查 [references/components.md](./references/components.md) 的对应章节速查，需要完整属性表、默认值清单与更多示例时再读 [references/components/](./references/components/) 下该组件的详细文档（如 button.md、dialog.md——button.md 同时覆盖 button-group / split-button / icon-button）。
