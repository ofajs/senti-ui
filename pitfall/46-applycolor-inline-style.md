# `applyColor` 无条件清空内联样式会误伤页面定制

> **ID** `46` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

旧 st-button 的 `applyColor()` 在无 `color` 时执行 `style.background = ""` / `color = ""`，把验收页 `<st-button style="background: var(--md-sys-color-error)">` 一起清掉（表现为“内联样式不生效”）。正确写法：只 `removeProperty()` 自己写入的变量（`--st-accent` 等），不要清空整个 style 属性；本次 token 化顺带修复。

---

[← 返回踩坑索引](../README.md)
