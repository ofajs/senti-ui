# 组件内向自身插入动态节点必须 `this.ele.shadowRoot.appendChild(...)`

> **ID** `12` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

直接 `this.ele.appendChild(...)` 会落入 light DOM，无 slot 分发时完全不可见

---

[← 返回踩坑索引](../README.md)
