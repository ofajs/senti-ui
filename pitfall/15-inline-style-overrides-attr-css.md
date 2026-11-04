# JS 写的内联样式会压过 `:host([attr])` 的 CSS 规则

> **ID** `15` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

组件用 JS 应用语义色（如 `color` 属性）时，若无条件 `style.background = ...`，会把 outlined/text 等靠属性选择器实现的 variant 外观强制覆盖成填充样式；正确写法是先读当前 variant 再分派（filled：角色色底 + on-角色色字；outlined：透明底 + 角色色字与描边；text：透明底 + 角色色字），并在 variant 的 watch 里重新应用。后续做 icon-button / chip / fab 等带 color 属性的组件时同样适用

---

[← 返回踩坑索引](../README.md)
