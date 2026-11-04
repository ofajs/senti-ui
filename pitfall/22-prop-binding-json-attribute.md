# ofa 的 `:prop` 绑定到 attr 声明的键时会把对象 JSON 序列化写入 attribute

> **ID** `22` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

组件侧 watch 收到的是 JSON 字符串（或解析后的值），不能当作数组直接用；正确写法：组件内 watch 里 `JSON.parse` 后规范化存入内部字段（如 `_opts`），不要存回 ofa attr data（会再次序列化）。同理 `:prop` 绑定到未声明的键则完全不生效

---

[← 返回踩坑索引](../README.md)
