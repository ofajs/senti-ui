# 组件内布局定位不要用 `getBoundingClientRect`，用 `offsetLeft/Top/Width/Height` 系

> **ID** `41` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

rect 是视口几何，含所有祖先的 transform：导航/指示类组件放在 st-dialog 等带入场动画（scale/translate）的容器里时，初始定位会量到动画中间态（实测：药丸高度被 scale(1,0.5) 压成一半、位置偏移），且**祖先动画结束不会触发自身的 ResizeObserver**，错位就此定格；display:none 祖先下 rect 还全是 0。offset 系是纯布局值，对祖先 transform 与隐藏免疫（隐藏时为 0，正好用来跳过定位、等可见时 ResizeObserver 再触发）。相对定位：element.offsetLeft 相对其 offsetParent（最近 positioned 祖先）的 padding 边缘，与 absolute 子元素在同一 containing block 里的定位基准一致，跨一层 shadow 时逐层相加即可（如 pill 相对 item + item 相对 bar）

---

[← 返回踩坑索引](../README.md)
