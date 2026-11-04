# 自定义属性 `--a: var(--b)` 在声明元素处解析后再继承，祖先 token 不会跟随子元素的内联覆盖

> **ID** `45` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

设计皮肤时若在 `:root` 写 `--st-fill: var(--st-accent)`，子元素 `style="--st-accent: error"` 不会改变 `--st-fill`（它已在 root 处解析成 primary）。需要“跟随语义色”的组合要么用数值 token（`--st-fill-alpha`）在组件端用 `color-mix` 组合，要么把变量声明在组件宿主上。

---

[← 返回踩坑索引](../README.md)
