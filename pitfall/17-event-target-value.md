# 自定义组件的事件处理器里读 `e.target.value` 是 undefined

> **ID** `17` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

ofa 的 attr 数据不在宿主原生 property 上，事件冒泡到宿主时 target 已被重定向；正确写法：组件在 ready 里用 `Object.defineProperty(ele, "value", { get/set })` 把 value 反射到宿主 DOM property（getter 读内部 input、setter 写 input 并 setAttribute），这样 `e.target.value` 与外部 `el.value` 读写都直接可用

---

[← 返回踩坑索引](../README.md)
