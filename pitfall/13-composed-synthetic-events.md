# 测试时合成事件（`dispatchEvent(new PointerEvent/...)`）跨 shadow 边界冒泡必须带 `{ composed: true }`

> **ID** `13` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

否则监听在 shadow 宿主上的处理器收不到，会误判为组件不工作；真实用户点击天然 composed，无此问题

---

[← 返回踩坑索引](../README.md)
