# shadow 内的 `<l-m>` 加载占位是 flex item，会参与 gap 布局

> **ID** `14` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

组件模板里用 `<l-m>` 引入子组件时必须同时写 `l-m { display: none; }`，否则它会在内容一侧多占一个 gap，造成左右间距不对称

---

[← 返回踩坑索引](../README.md)
