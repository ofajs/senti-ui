# ofa `:` 属性绑定写不对 camelCase 的原生属性

> **ID** `19` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

（如内部 input 的 `readOnly`）——绑定小写化后落到不存在的属性上；正确写法：声明对应 attr 并在 watch/ready 里用 JS `input.readOnly = this.readonly !== null` 同步

---

[← 返回踩坑索引](../README.md)
