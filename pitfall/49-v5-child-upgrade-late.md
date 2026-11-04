# ofa.js v5 下子组件可能晚于父组件升级（ready 时子元素 shadowRoot 仍为 null）

> **ID** `49` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

官网首页用 v5 时 `st-nav-bar` 的 `updateActive()` 在 ready 阶段读 `st-nav-item.shadowRoot.querySelector(".pill")` 直接抛错（两个 nav-bar 两条 pageerror），药丸指示条也不出现。正确写法：测量/定位前守卫子项 `shadowRoot`，缺失时用短定时器重试（nav-bar 已加，最多 20 次 × 50ms）；不要假设父组件 ready 时子组件一定已升级。

---

[← 返回踩坑索引](../README.md)
