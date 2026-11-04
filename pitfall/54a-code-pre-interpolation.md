# `{{...}}` 在 `<pre>` / `<code>` 内不会被解析（ofa 为代码示例保留字面量）

> **ID** `54a` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

官网颜色实验室的 `o-fill` 自定义颜色行用 `<code>{{$data.name}}</code>` 显示 token，实际渲染出字面量 `{{$data.name}}`；同一行的 `<span>{{$data.hex}}</span>` 与 `<st-button>{{$data.name}}</st-button>` 都正常。正确写法：需要动态文本的 `<code>` 元素改用 `:text` 指令（如 `<code :text="'--' + $data.name"></code>`），不要把模板表达式写在 code/pre 的文本节点里。

---

[← 返回踩坑索引](../README.md)
