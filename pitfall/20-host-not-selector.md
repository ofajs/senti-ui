# shadow 样式里 `:host:not([attr])` 不生效

> **ID** `20` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

ofa 的样式作用域处理不支持 `:host(...)` 内嵌 `:not()`（静默失效，无报错）；正确写法：反向逻辑，元素默认隐藏（`display: none`），用 `:host([attr="x"])` 正向启用

---

[← 返回踩坑索引](../README.md)
