# 依赖 light DOM 位置/结构的逻辑放 attached 而非 ready

> **ID** `33` · **分类** 测试 / 验证 · **来源** 原 CONTEXT.md「测试/验证类坑」

ready 时元素可能尚未真正进入文档/兄弟结构未稳定（ofa 渐进升级、重排 light DOM），按位置计算（如 button-group 的首尾圆角）会算错；正确写法：attached 里读取 `slot.assignedElements()` 计算并设置，slotchange 时重算。同理 ::slotted(:first-child) 等位置选择器也受此时序影响，位置相关样式改用 JS 设置内联值

---

[← 返回踩坑索引](../README.md)
