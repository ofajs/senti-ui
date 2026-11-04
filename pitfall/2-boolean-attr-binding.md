# 布尔属性转发到内部原生元素用属性绑定 `:disabled="..."`

> **ID** `2` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

`attr:disabled` 会把 `false` 序列化成字符串，属性存在即生效，导致永远禁用

---

[← 返回踩坑索引](../README.md)
