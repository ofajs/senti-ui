# SCSR 的 `::slotted(*) { height:100% }` 来自外层，会盖过页面 `:host` 的尺寸；内部滚动必须多包一层 shell

> **ID** `53` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

官网把 `body` 设为 `overflow:hidden` 并希望整站只在内部容器滚动时，`o-page :host { height:100dvh; display:flex }` 不生效：scsr 在 o-app 的 shadow 里给 slotted 页面写 `display:block;width:100%;height:100%`（外层规则优先于 `:host`），宿主高度继续被内容撑到几千 px，内部容器没有可滚动高度。正确写法：布局内部再包一层 `.shell { height:100dvh; display:flex; overflow:hidden }`，`.site-scroll { flex:1; min-height:0; overflow-y:auto; overscroll-behavior-y:none }`；滚动进度/回到顶部/路由复位都改读这个容器。另：页面入场动画若用 `animation-fill-mode:both` 留下 `transform: matrix(1,0,0,1,0,0)`，该 identity transform 也会成为 `position:fixed` 的包含块，内部滚动后对话框会相对页面对齐错位；移除 fill-mode、动画结束回到 `transform:none`。

---

[← 返回踩坑索引](../README.md)
