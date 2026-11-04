# 皮肤 token 在祖先层提前解析 `var(--st-accent)`，`color` 的语义色丢失

> **ID** `59a` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

Apple / Windows / shadcn 的输入框聚焦改用皮肤自己的光圈/底线后，`color="error"` 只改了隐藏的内嵌描边，实际焦点仍是主题主色：`--st-field-focus-shadow` 在 `[data-skin]`（html）上声明，其中的 `var(--st-accent)` 在**声明元素**解析，而 `--st-accent` 是组件按 `color` 写在宿主上的，祖先看不到它。正确写法：皮肤只提供几何/透明度 token（`--st-field-focus-gap` / `--st-field-focus-glow-spread` / `--st-field-focus-glow-alpha` / `--st-field-focus-underline-height` / `--st-field-focus-underline-alpha`），颜色在组件 `:host(:focus-within)` 的 `box-shadow` 里用 `var(--st-accent, …)` 现场组合。另注意 `box-shadow: …, none` 会让整条声明失效，中性阴影 token 要用 `0 0 0 0 transparent` 而不是 `none`。

---

[← 返回踩坑索引](../README.md)
