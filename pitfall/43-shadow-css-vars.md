# 文档树的 CSS 选择器跨不进 `o-page` / `o-app` 的 shadow，CSS 变量可以

> **ID** `43` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

皮肤曾用 `[data-skin] st-input:focus-within { box-shadow: ... }` 在验收页（组件在 o-page shadow 内）静默失效，但 token 化圆角/背景全部正常。结论：跨 shadow 的换肤机制只能走 CSS 变量（token），宿主选择器与 `::part()` 只对 light DOM 内的组件有效；组件把可换肤的视觉全部写成 `var(--st-xxx, 旧默认值)`。

---

[← 返回踩坑索引](../README.md)
