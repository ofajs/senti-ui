# shadow 内 button 的 `type=submit/reset` 不会提交外层 form

> **ID** `57` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

原生 button 在 shadow 内没有 `form` 关联，`button.form === null`。正确写法：组件监听内部 button 的 click，用 `closest("form")`（或 `form=""` 引用）找到表单后手动 `requestSubmit()` / `reset()`；同理 form 控件要自己同步 reset 回填。

---

[← 返回踩坑索引](../README.md)
