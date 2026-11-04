# 内部原生控件的可访问名称不会自动来自 slot 文本

> **ID** `55b` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

`.native` 与 label 是兄弟节点，`aria-label` 必须显式同步；宿主上的 `aria-label`/`title` 也要转发给内部控件，否则无障碍树里是空名 button/checkbox。统一用 `packages/a11y/a11y.js` 的 `syncAccessibleName(host, control, { fromSlot })`，并在 detached 里清理 observer。

---

[← 返回踩坑索引](../README.md)
