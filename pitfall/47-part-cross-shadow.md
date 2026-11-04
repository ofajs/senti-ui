# `::part()` 不能跨 shadow 边界

> **ID** `47` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

`o-page` 里的 `st-input::part(focus-ring)` 从文档树选不中（part 只能由同一棵树的规则命中）；part 仅作为 light DOM 场景的可选能力保留，换肤机制不要依赖它。

---

[← 返回踩坑索引](../README.md)
