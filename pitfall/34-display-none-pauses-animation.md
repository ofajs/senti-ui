# display:none 会暂停 CSS 动画，animationend 永不触发

> **ID** `34` · **分类** 测试 / 验证 · **来源** 原 CONTEXT.md「测试/验证类坑」

祖先被 display:none（如菜单面板关闭、对话框隐藏）时子树内的 CSS 动画冻结，animationend/transitionend 不会派发；靠 animationend 清理的元素（如 ripple 的波纹 span）会残留，面板再显示时动画从暂停处"续播"。正确写法：清理逻辑加 setTimeout 兜底（定时器不受 display 影响，先到先清）；同理监听 transitionend 的逻辑（如 collapse 的过渡时长复位）也要有超时兜底

---

[← 返回踩坑索引](../README.md)
