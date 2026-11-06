# st-code 代码块组件

基于 ofa.js 的轻量代码块：语法高亮、自动格式化。支持 HTML / JS / TS / CSS / Less / Sass；高亮器与格式化器都随组件提供，不请求外部 CDN。

默认只有代码本身：无边框、无阴影、无底色、无顶栏；加 `frame` 才有浏览器窗口式外壳（圆点 / 文件名 / 复制）。

**安全**：组件只把源码当字符串读取，再转义渲染到 shadow DOM；`<template>` / `<textarea hidden>` / `code` 属性都不会执行 `<script>`。直接子节点无法安全展示（浏览器解析时脚本已执行）。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/code/code.html"></l-m>
```

组件内部自动引入颜色初始化模块；无需额外 CSS。自托管时需连同 `packages/code/vendor/beautifier.mjs` 一起部署（CDN 路径已包含）。

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `lang` | `"html" \| "js" \| "ts" \| "css" \| "less" \| "sass"` | `"html"` | 高亮语言；兼容 htm/xml/svg/javascript/typescript/scss |
| `title` | string | 无 | 顶栏文件名 / 标题；缺省显示语言名 |
| `code` | 运行时状态（ofa data） | `null` | 代码字符串；用 `:code` / `$("st-code").ele.code` 写入，不是标签属性；优先于 textarea / template |
| `format` | `"auto" \| "off"` | `"auto"` | 自动格式化；Sass 只做去公共缩进 |
| `frame` | boolean | 无 | 浏览器外壳：底色 / 边框 / 圆点 / 标题 / 复制按钮 |

## 用法

### textarea hidden（无需 template，推荐）

```html
<st-code lang="html">
  <textarea hidden>
    <div>1111</div>
    <script>alert("不会执行")</script>
  </textarea>
</st-code>
```

textarea 是 RCDATA，标签原样保留、不需要转义 `<` / `>`；只有字面量 `</textarea>` 要写成 `&lt;/textarea&gt;`，HTML 实体会被解码（要显示 `&lt;` 写 `&amp;lt;`）。

### template（会序列化 HTML）

```html
<!-- 默认：只有代码 -->
<st-code lang="html">
  <template>
    <div class="card">Hello</div>
    <script>alert("不会执行")</script>
  </template>
</st-code>

<!-- 加 frame：浏览器外壳 + 标题 + 复制 -->
<st-code lang="html" frame title="index.html">
  <template>
    <div class="card">Hello</div>
    <script>alert("不会执行")</script>
  </template>
</st-code>
```

带标签的 HTML 用 `template.innerHTML` 保留标签；纯文本（JS/CSS）用 `template.textContent`。两者都只读字符串，不插入 DOM。

### code 数据（动态字符串）

```html
<st-code lang="css" title="theme.css" :code="cssText"></st-code>
```

```js
$("st-code").ele.code = cssText;
```

### 不要用直接子节点

没有 `<template>` / `<textarea>` 包裹的 `<script>` 会在组件升级前执行，组件无法拦截。源码请放 textarea / template 或 `:code`。

## 自动格式化

- 默认 `format="auto"`：dedent → js-beautify（HTML / JS / TS / CSS / Less）→ 高亮
- 写代码不用手动对齐空格 / 换行
- Sass 是缩进语法，不格式化，只去公共缩进
- `format="off"` 关闭格式化
- 复制到剪贴板的是格式化后的代码

## 事件

- `copy`：`frame` 模式下复制成功后派发（`bubbles` + `composed`）

## 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| 默认外观 | 透明底、无边框 / 阴影 / 顶栏 / padding |
| `frame` 底色 / 顶栏 | `surface-container-highest` / `surface-container-high` |
| `frame` 圆角 / 阴影 | `--st-radius-md` / `--st-shadow-1` |
| 字号 | `0.857em` |
| 字体 | 等宽系统字体栈 |
| 最大高度 | 无限制（内部滚动） |

## 皮肤 token 与 part

`frame` 模式 token：`--st-code-bg` / `--st-code-header-bg` / `--st-code-border` / `--st-code-radius` / `--st-code-shadow` / `--st-code-padding` / `--st-code-font` / `--st-code-font-size` / `--st-code-line-height` / `--st-code-backdrop-filter` / `--st-code-max-height`。

part：`shell` / `header` / `title` / `copy` / `body` / `pre` / `code`；`header` / `title` / `copy` 只在 `frame` 模式显示。

## 注意事项

- 静态源码优先 textarea hidden；动态代码用 `:code` 绑定 / `$("st-code").ele.code`
- `setAttribute("code", ...)` 无效；`code` 是 ofa data
- 默认无浏览器外壳；需要标题 / 复制时加 `frame`
- 代码块横向滚动，不自动换行；需要换行用 `st-code::part(pre) { white-space: pre-wrap; }`
- 高亮颜色全部来自 M3 角色，自动跟随深浅色 / 皮肤
- 复制使用 `navigator.clipboard`，失败时回退 `execCommand`
- `prefers-reduced-motion` 下复制按钮过渡压到近零
