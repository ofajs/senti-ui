# 在 `o-page` shadow 里取 `getRootNode().host` 会拿到页面容器，不是视觉父元素

> **ID** `52` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

`st-ripple` 原实现 `root.host || parentElement`，直接写进页面 shadow 后所有并列波纹都绑到同一个 `o-page`，点任意示例会同时触发整页所有 ripple（组件验收页同样中招）。正确写法：在组件 shadow 内（host 是 `st-*`）监听 host；host 是 `O-PAGE` / `O-APP` 时改监听最近的 `parentElement`，再兜底 host。页面容器不是“组件宿主”，凡是 ready 里用 `getRootNode().host` 定位交互父级的组件都要防这个坑。

---

[← 返回踩坑索引](../README.md)
