# focus ring 等画在组件外部的指示色不要用 `currentColor`

> **ID** `11` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

它跟随文字色（如 filled 按钮白字 → 白圈），画在浅色页面上完全不可见；应使用与页面背景有对比的 M3 角色（如 `on-surface`），深浅色主题下都成立

---

[← 返回踩坑索引](../README.md)
