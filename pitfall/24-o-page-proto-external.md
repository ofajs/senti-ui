# 外部脚本无法直接调用 o-page 页面模块的 proto 方法

> **ID** `24` · **分类** 测试 / 验证 · **来源** 原 CONTEXT.md「测试/验证类坑」

`document.querySelector('o-page').setRole(...)` 报 `not a function`（proto 方法挂在 ofa 实例上，宿主原生元素不可见）；自动化验证时改用真实交互触发（如 Playwright 对 `input[type=color]` fill 色值、直接 click 按钮），ofa 的 `on:input` / `on:click` 处理器正常响应

---

[← 返回踩坑索引](../README.md)
