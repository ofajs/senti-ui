# `setAttribute` 触发组件 watch 是异步的

> **ID** `18` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

（MutationObserver 落到下一轮微任务/帧）——setAttribute 后**同步**读计算样式/ofa data 会得到旧值，极易误判为"改了没生效"；正确验证方式：setAttribute 后 `await` 一下（如 setTimeout 100ms）再断言

---

[← 返回踩坑索引](../README.md)
