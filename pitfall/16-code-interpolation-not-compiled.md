# `<code>` 标签内的 `{{...}}` 插值不会被 ofa 编译

> **ID** `16` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

（现象：字面显示 `{{demoValue}}`，其余绑定正常、无任何报错；原因：ofa 模板编译器对 `code` 元素有特殊处理，跳过其文本绑定；正确写法：用 `<span class="code">` + `font-family: ui-monospace` 模拟等宽样式）

---

[← 返回踩坑索引](../README.md)
