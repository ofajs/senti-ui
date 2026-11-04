# 高度过渡类组件（collapse）默认 transition 时长必须为 0s，仅用户切换时临时启用；且显隐高度要完全 JS 驱动

> **ID** `32` · **分类** 测试 / 验证 · **来源** 原 CONTEXT.md「测试/验证类坑」

三个连环坑（st-list 二级折叠"诡异缓慢"的完整链条）：

- a) 默认 `transition: height .3s` 会让 ResizeObserver 跟随内容高度的每次更新也被动画化，嵌套折叠时外层"追帧式"追赶内层动画（每帧重设目标、过渡不断重定向）；
- b) **transition shorthand 里第一个时间值是 duration、第二个是 delay**——`transition: height .3s <curve> 0s` 的 `0s` 是 delay，时长仍是 .3s，写成"时长在前来 0 结尾"毫无作用；正确写法 `transition: height 0s <curve>`；
- c) **不能用 `:host([hide]) { height: 0 !important }` 之类的 CSS 强制规则配合异步 watch 设过渡**——属性变化时高度随 CSS 同步瞬变，而 watch（异步，坑 [#18](./18-watch-async-after-setattr.md)）里才设置的 transitionDuration 来不及生效，动画整个跳过；正确写法：去掉 CSS 强制规则，watch hide（守卫初始化触发，坑 [#27](./27-watch-initial-trigger.md)）里先设 `transitionDuration=".3s"` 再由 JS 设高度（收起设 0 / 展开设内容高），超时后恢复 0s（Punch-UI 原版即此设计）

---

[← 返回踩坑索引](../README.md)
