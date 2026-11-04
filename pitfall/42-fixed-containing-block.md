# `position:fixed` 弹层的 containing block 不保证是视口——transform 祖先会接管它

> **ID** `42` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

（实测：st-menu 放进 st-dialog，菜单整体向右下漂移一个对话框面板原点、冲出面板被裁）。原因：st-dialog 面板入场动画 `fill: forwards` 结束后 `::part(panel)` 的 computed transform 保持 `matrix(1,0,0,1,0,0)` ≠ `none`（动画遗产序列化成单位矩阵），按规范它成为所有 fixed 后代的 containing block，组件按视口坐标写的 `left/top` 被重新解释为相对对话框面板 → 双重偏移。排查技巧：光 DOM `parentElement` 链查不到肇事者（slot 内容的布局祖先是宿主 shadow 内部元素），必须沿 `assignedSlot || parentElement` 的 flattened tree 上溯查 computed transform。正确写法（组件侧免疫，任何容器通用）：定位前把弹层摆到 `0,0` 读 `getBoundingClientRect()` 得 containing block 的视口原点，把算好的视口坐标减去该原点再写入——containing block 是视口时差值为 0、行为不变。注意探测时机：同步于 `display:block` 之后、入场动画首帧之前执行才干净（强制布局会把自家动画 from 态 transform 算进探测读数，实测差 `translateY(-0.429em)+scale(0.98)` ≈ 6px/2.6px）；稳妥做法是探测期间 `animation:none`、定位完恢复让动画从头播（st-menu updatePosition 即此实现）。与坑 [#41](./41-offset-not-boundingrect.md) 同族：[#41](./41-offset-not-boundingrect.md) 是量测用 offset 系躲祖先 transform，本条是 fixed 定位坐标系数换算——两者根源都是「transform 祖先改变几何基准」

---

[← 返回踩坑索引](../README.md)
