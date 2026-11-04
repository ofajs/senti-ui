# `pageAnime` 的入场过渡会被“先写 next、rAF+5ms 再写 current”折成 0 时长——三态都不要写 `transition`

> **ID** `59b` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

给 `next` / `previous` 也带 `transition` 时，浏览器先为起点态起一个过渡（1→0 透明、0→8px 位移），约 5ms 后 `current` 把值改回来，反向合并后过渡时长为 0，页面直接跳到位（实测 `transform` 的 run/start/end 只相隔 1ms，透明度同样瞬间到 1，肉眼看不出淡入）。正确写法：`next` / `previous` 只写起始值（`opacity`、`transform`），`current` 只写目标值；过渡时长不用配——`cr()` 在 `current` 阶段注入 `transition: all .3s`、`lr()` 在离场阶段同样注入，入场/离场自然都是 0.3s。配套两点：`current.transform` 必须显式 `none`（ofa 用 `{...css, ...current}` 叠加，不会清掉 `next` 写的位移）；`prefers-reduced-motion` 若要降级，静态对象不会感知媒体偏好，必须用 getter 返回另一组态（位移关掉，时长缩到 0.01s 而不是 0s——0s 不触发 `transitionend`，离场会多等 350ms 兜底超时）。

---

[← 返回踩坑索引](../README.md)
