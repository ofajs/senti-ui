# 祖先的 `backdrop-filter` 会成为后代弹层的 backdrop root，弹层毛玻璃“失效”

> **ID** `58` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

给容器（如官网 header）直接加 `backdrop-filter` 后，容器内打开的菜单/提示层即使自身写了 `backdrop-filter: blur(...)`，也只采样容器内部（通常是空的），底下的页面内容完全不糊，表现为“弹层是半透明但没玻璃”。正确写法：把容器自身的毛玻璃放到一个**不是弹层祖先**的层上，例如 `.top::before { position:absolute; inset:0; z-index:-1; backdrop-filter: blur(...) }`，容器本身只留透明背景；弹层保持自己的 `backdrop-filter`。同理，任何承载 `st-menu` / `st-tooltip` / `st-select` 弹层的卡片不要把 `backdrop-filter` 写在卡片自身上。

---

[← 返回踩坑索引](../README.md)
