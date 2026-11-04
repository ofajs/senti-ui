# 组件 JS 写自身声明的 attrs 属性会反馈进 ofa attr data，形成自引用死锁

> **ID** `37` · **分类** 测试 / 验证 · **来源** 原 CONTEXT.md「测试/验证类坑」

attrs 声明的属性，JS setAttribute/toggleAttribute 后 ofa 会同步进 attr data，watch 里再读 `this.xxx !== null` 判断"外部是否设置过"就永远为真/假锁死（st-progress 的 indeterminate 推导曾因此失效：一旦按推导挂上属性，自身读到的就是"用户设置了"）。正确写法：推导类状态不要落属性，直接以 JS 内联样式/内部字段表达；确需属性给 CSS 用时，读原始意图要用别的来源

---

[← 返回踩坑索引](../README.md)
