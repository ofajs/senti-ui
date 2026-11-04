# o-fill 把模板条目渲染在自身 light DOM（innerHTML），slot 的 assignedElements 只能看到 O-FILL 容器本身

> **ID** `23` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

宿主组件想消费其中的条目（如 st-select 消费 option），需在 collect 时深入容器查询：`el.querySelectorAll('option')`（light DOM）+ `el.shadowRoot?.querySelectorAll('option')` 双路收集并去重，且要用 MutationObserver 同时观察容器本体与 shadowRoot（childList+subtree）跟随重渲染；只观察 shadowRoot 会漏掉 o-fill 的实际渲染位置

---

[← 返回踩坑索引](../README.md)
