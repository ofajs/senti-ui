# 组件内同步 disabled 到内部原生元素用 `nativeEle.disabled = this.disabled !== null`

> **ID** `29` · **分类** 测试 / 验证 · **来源** 原 CONTEXT.md「测试/验证类坑」

原生 disabled 天然阻断 click/键盘/焦点，无需手动 stopPropagation；不要用 `:host([disabled]) .native { display:none }` 隐藏（隐藏后阻断逻辑整个消失，宿主级点击照常冒泡）

---

[← 返回踩坑索引](../README.md)
