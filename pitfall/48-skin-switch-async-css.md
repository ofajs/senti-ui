# 皮肤切换是异步的：`setSkin()` 只改 `data-skin`，对应 CSS 还要网络加载

> **ID** `48` · **分类** 测试 / 验证 · **来源** 原 CONTEXT.md「测试/验证类坑」

测试里同步读 `getComputedStyle` 会读到旧皮肤（或 M3 默认值），表现为随机失败。正确写法：断言前 `waitForFunction` 等到某个皮肤特征生效（如圆角 `< 7`、`backdropFilter !== "none"`）；本地开发同理，别在点击后立刻截图。

---

[← 返回踩坑索引](../README.md)
