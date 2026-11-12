# st-markdown Markdown 渲染组件

基于 ofa.js 的 Markdown 渲染器，面向 AI 输出：支持增量填充、未闭合代码块 / 表格 / 行内标记的流式容错，自动渲染标题、列表、代码块、表格、引用等结构。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/markdown/markdown.html"></l-m>
```

## 最小示例

```html
<!-- 静态内容直接写在默认插槽 -->
<st-markdown>
  ## 标题

  - 第一项
  - 第二项

  `行内代码` 与 **加粗**
</st-markdown>

<!-- AI 输出：运行时填充 -->
<st-markdown id="answer" streaming></st-markdown>
```

```js
const md = $("st-markdown").ele; // 运行时状态在原生宿主上
md.value = "## 开始回答\n\n";
md.appendMarkdown("这是流式追加的 **Markdown**。");
```

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `default-value` | string | 无 | 初始源码；优先级高于 textarea / template / 默认插槽 |
| `streaming` | boolean | 无 | 流式输出：末尾光标 + `aria-busy="true"`；增量渲染本身不依赖它 |
| `breaks` | boolean | 无 | 段内单换行渲染为 `<br>`；默认按标准 Markdown 视为空格 |

## 运行时状态与方法

| API | 说明 |
|-----|------|
| `el.value` | 当前 Markdown 源码（运行时状态，非标签属性）；赋值后下一帧合并渲染 |
| `el.appendMarkdown(delta)` | 追加源码并合并渲染；适合 token 流。没有叫 `append`，避免覆盖 DOM 原生方法 |
| `el.value = ""` | 清空 |

初始源码优先级：运行时 `value`（升级前赋值）> `default-value` > `<textarea>` > `<template>` > 默认插槽文本。包含 `<` / 代码块的静态内容用 `<textarea hidden>`（RCDATA，原样保留）。

## 事件

| 事件 | 说明 |
|------|------|
| `copy` | 代码块复制成功，`detail: { code, lang }`，`bubbles` + `composed` |

## 支持语法

标题、段落、硬换行、有序/无序/嵌套列表、任务列表、引用、围栏代码块（语言标签 + 复制）、GFM 表格与对齐、分割线、行内代码、粗体/斜体/删除线、链接、图片、`<https://...>` 与裸 `https://...` 自动链接、转义字符。

原始 HTML 不解析；链接与图片地址经过协议白名单（http/https/mailto/tel/相对；图片额外允许 data:image/png|jpeg|gif|webp）。

## 流式渲染

- `value` 更新按 `requestAnimationFrame` 合并，连续 token 不会逐条重排
- 未闭合围栏代码块渲染到末尾；闭合后继续更新
- 未完成表格 / 链接 / 粗体先按字面文本显示，标记补齐后变成对应元素
- 父级 `st-chat` / `st-chat-message` 的滚动跟随照常工作
- 放在 `st-chat-message` 内时建议只给 message 设 `streaming`，避免两个光标

```html
<st-chat-message from="assistant" name="Senti" streaming>
  <st-markdown :value="answer"></st-markdown>
</st-chat-message>
```

Markdown 仍随 `answer` 增量渲染，光标由消息组件负责。

## 默认样式（直接覆盖）

| 项目 | 默认值 |
|------|--------|
| 字号 / 行高 | `14px` / `1.7`（改 `font-size` 整体缩放） |
| 块间距 | `0.857em` |
| 代码块 | `surface-container-high` 底、`surface-container-highest` 顶栏、`0.857em` 圆角、`0.857em 1em` 内边距 |
| 行内代码 | `surface-container-high` 底、`0.286em` 圆角 |
| 表格 | `outline-variant` 分隔线、表头 `surface-container-high` |
| 引用 | 主色 55% 与 outline-variant 混合的左边线；链接 `primary` 色下划线 |

## 皮肤 token 与 part

材质 token：`--st-markdown-line-height` / `--st-markdown-gap` / `--st-markdown-heading-gap` /
`--st-markdown-heading-bottom` / `--st-markdown-list-indent` / `--st-markdown-blockquote-width` /
`--st-markdown-blockquote-border` / `--st-markdown-blockquote-bg` / `--st-markdown-blockquote-radius` /
`--st-markdown-code-bg` / `--st-markdown-code-head-bg` / `--st-markdown-code-border` /
`--st-markdown-code-radius` / `--st-markdown-code-padding` / `--st-markdown-code-shadow` /
`--st-markdown-code-backdrop-filter` / `--st-markdown-code-font` / `--st-markdown-code-font-size` /
`--st-markdown-inline-code-bg` / `--st-markdown-inline-code-padding` / `--st-markdown-inline-code-radius` /
`--st-markdown-copy-radius` / `--st-markdown-table-border` / `--st-markdown-table-head-bg` /
`--st-markdown-table-radius` / `--st-markdown-table-padding` / `--st-markdown-table-font-size` /
`--st-markdown-image-radius` / `--st-markdown-caret-duration`。

part：`content` / `p` / `h1`–`h6` / `ul` / `ol` / `li` / `blockquote` / `hr` / `pre` / `code` /
`inline-code` / `code-block` / `code-head` / `code-lang` / `copy` / `table-wrap` / `table` / `thead` /
`tbody` / `tr` / `th` / `td` / `link` / `image` / `strong` / `em` / `del` / `br` / `task-box` /
`task-body` / `cursor`。

`::part()` 只在 light DOM 可达；跨 shadow 用 token。

## 注意事项与使用技巧

- **原始 HTML 不执行**：`<div>` / `<script>` 按文本显示，避免 AI 输出注入
- **不内置语法高亮**：代码块有语言标签、复制与等宽排版；需要高亮可换成 `st-code`
- **链接安全**：`javascript:` / `vbscript:` / 非图片 `data:` 会退化为普通文字
- **初始内容用 `<textarea hidden>`**：默认插槽里的 `<div>` 会被浏览器当 HTML 解析；textarea 是 RCDATA
- **流式用 `el.value` / `appendMarkdown()`**：不要每 token 重建组件节点
- **光标二选一**：`st-markdown` 与 `st-chat-message` 的 streaming 同时开会出两个光标
- **段内换行**：默认合并为空格；聊天场景需要保留单换行时加 `breaks`
- **复制**：依赖 `navigator.clipboard`，失败回退 `execCommand`；失败不派发 `copy`

## 验证页面

直接访问 `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/markdown/`。
