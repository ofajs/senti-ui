# fixed 定位的弹层组件不能放在有 transform 的祖先内

> **ID** `36` · **分类** 测试 / 验证 · **来源** 原 CONTEXT.md「测试/验证类坑」

CSS `transform`/`filter`/`perspective`/`will-change` 会创建新包含块，后代的 `position: fixed` 改为相对该祖先定位而非视口：st-dialog 的全屏遮罩会铺不满视口（下方内容"穿透"可点、遮罩错位）。常见触发：做过入场动画且 transform 未清除的容器。正确写法：弹层组件挂在 body 或无 transform 的顶层容器；命令式工具（alert/confirm/prompt）自动 append 到 body 天然规避

---

[← 返回踩坑索引](../README.md)
