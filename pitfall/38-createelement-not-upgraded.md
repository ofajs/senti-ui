# ofa 组件 document.createElement 动态创建可能不升级

> **ID** `38` · **分类** 测试 / 验证 · **来源** 原 CONTEXT.md「测试/验证类坑」

`customElements.get(tag)` 已 defined 但 createElement + append 的实例可能迟迟没有 shadowRoot（初始化机制与 l-m 扫描相关）；自动化测试/工具里需要动态实例时优先用页面预置元素，或创建后轮询 shadowRoot 就绪

---

[← 返回踩坑索引](../README.md)
