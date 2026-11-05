# st-code 代码展示组件

基于 ofa.js 的轻量代码块：语法高亮、自动格式化。支持 HTML / JS / TS / CSS / Less / Sass，内置高亮器，不依赖 highlight.js 或任何外部 CDN。

**默认只有代码本身**：无边框、无阴影、无底色、无顶栏。需要浏览器窗口式的包裹（圆点 / 文件名 / 复制按钮）时加 `frame`。

**安全模型**：组件只把源码当字符串读取，再逐字符转义后渲染到 shadow DOM。`<template>` 内的 `<script>` 不会执行；`code` 属性/属性绑定也只当纯文本。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/code/code.html"></l-m>
```

组件内部已 `import "../color/st-color-init.js"`，加载时自动注入 `--md-sys-color-*` 颜色体系。

自托管时请把整个 `packages/code/` 一起部署（组件会静态 import `vendor/beautifier.mjs`；CDN 路径已包含该文件）。

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `lang` | `"html" \| "js" \| "ts" \| "css" \| "less" \| "sass"` | `"html"` | 高亮语言；兼容 `htm/xml/svg/javascript/typescript/scss` 别名 |
| `title` | string | 无 | 顶栏文件名 / 标题；缺省显示语言名（HTML / JS / CSS…） |
| `code` | string | 无 | 代码字符串（属性或 `attr:code` 绑定）；设置后优先于 `<template>` |
| `format` | `"auto" \| "off"` | `"auto"` | 自动格式化开关；Sass 始终只做去公共缩进 |
| `frame` | boolean | 无 | 加浏览器外壳：底色 / 边框 / 圆点 / 标题 / 复制按钮 |

## 写法一：`<template>`（推荐，声明式）

`<template>` 的内容天然惰性，里面的 `<script>` 不会执行。组件读取后重新转义渲染，所以可以安全地展示 HTML / JS 源码。

```html
<!-- 默认：只有高亮后的代码 -->
<st-code lang="html">
  <template>
    <div class="card">Hello</div>
    <script>alert("不会执行")</script>
  </template>
</st-code>

<!-- 加 frame：浏览器窗口外壳 + 文件名 + 复制 -->
<st-code lang="html" frame title="index.html">
  <template>
    <div class="card">Hello</div>
    <script>alert("不会执行")</script>
  </template>
</st-code>
```

- 带标签的 HTML 代码：组件读取 `template.innerHTML`，保留标签原样展示
- 纯文本代码（JS / TS / CSS）：读取 `template.textContent`
- 两种路径都只读字符串，不把代码插入页面

## 自动格式化

默认 `format="auto"`：组件会先去掉公共缩进，再用随组件 vendored 的 [js-beautify](https://github.com/beautifier/js-beautify)（MIT）按语言格式化 HTML / JS / TS / CSS / Less，最后做高亮。

- 写代码时不需要手动对齐空格、换行；例如一行 `const f=()=>{return 1}` 会被整理成多行缩进
- `format="off"` 关闭格式化，只做去公共缩进
- **Sass** 是缩进语法，交给格式化器会压平层级，所以只做去公共缩进，保留你写的缩进
- TypeScript 用 js-beautify 的 JS 规则格式化，类型声明可能不会像 Prettier 那样逐行展开，但缩进 / 空格会统一
- 格式化发生在渲染时，复制到剪贴板的是格式化后的代码

```html
<st-code lang="js" format="off" title="exact.js"> ... </st-code>
```

## 写法二：`code` 属性（动态字符串，无需 template）

```html
<st-code lang="css" title="theme.css" attr:code="cssText"></st-code>
```

```js
const cssText = `.card { color: var(--md-sys-color-primary); }`;
$("st-code").attr("code", cssText);
```

`code` 属性的值始终被当作文本，不会解析成 HTML，适合从接口 / 编辑器 / 数据绑定拿到的代码。

## 不要这样做

```html
<!-- 危险：直接放在 light DOM 的 <script> 会被浏览器执行 -->
<st-code lang="html">
  <script>alert("会执行")</script>
</st-code>
```

组件没有设置 `<slot>`，所以这些 light DOM 内容不会显示；但脚本在组件升级前就已经执行了。展示源码请用 `<template>` 或 `code` 属性。

## 事件

- `copy`：`frame` 模式下点击复制按钮并写入剪贴板后派发（`bubbles` + `composed`）

## 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| 默认外观 | 透明背景、无边框 / 阴影 / 顶栏 / 内边距 |
| 字号 / 行高 | `0.857em`（12px @14px）/ `1.65` |
| 字体 | `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` |
| 最大高度 | 无限制；滚动发生在代码区内 |
| `frame` 外壳 | `surface-container-highest` 底、`surface-container-high` 顶栏、`--st-radius-md` 圆角、`--st-shadow-1` 阴影、`1em` 内边距、三个圆点 + 标题 + 复制 |

## 皮肤 token 与 part

| token | 默认回退 |
|------|----------|
| `--st-code-bg` | `surface-container-highest` |
| `--st-code-header-bg` | `surface-container-high` |
| `--st-code-border` | `transparent` |
| `--st-code-radius` | `var(--st-radius-md)` |
| `--st-code-shadow` | `var(--st-shadow-1)` |
| `--st-code-padding` | `1em` |
| `--st-code-font` / `--st-code-font-size` / `--st-code-line-height` | 等宽字体 / `0.857em` / `1.65` |
| `--st-code-backdrop-filter` | `none` |
| `--st-code-max-height` | `none` |

part：`shell` / `header` / `title` / `copy` / `body` / `pre` / `code`。`header` / `title` / `copy` 只在 `frame` 模式下显示。

```css
st-code::part(copy) {
  color: var(--md-sys-color-error);
}
```

## 注意事项与使用技巧

- **优先用 `<template>`**：声明式写源码最方便；动态字符串用 `code` 属性 / `attr:code`
- **不要用直接子节点**：没有 `<template>` 包裹的 `<script>` 会在升级前执行，组件无法拦截
- `lang` 只影响高亮，不做语法校验；未知语言按 HTML 展示
- 代码块横向滚动，不自动换行；需要换行时用原生 `st-code::part(pre) { white-space: pre-wrap; }`
- 高亮颜色全部来自 M3 角色，深浅色 / 皮肤切换自动跟随；不提供自定义颜色变量
- 默认模式不画边框 / 阴影 / 底色；需要浏览器外壳时加 `frame`
- `title` / 复制按钮只在 `frame` 模式下显示
- 格式化器随组件 vendored（`packages/code/vendor/beautifier.mjs`，MIT，见同目录 LICENSE），不请求外部 CDN
- 复制按钮用 `navigator.clipboard`，失败时回退到 `execCommand("copy")`；复制成功派发 `copy` 事件
- `prefers-reduced-motion` 下复制按钮的过渡会压到近零

## 验证页面

`index.html`（直接访问 `/packages/code/`）。
