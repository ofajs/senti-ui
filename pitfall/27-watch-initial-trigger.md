# ofa 初始化时也会以初始值触发一次 watch

> **ID** `27` · **分类** 测试 / 验证 · **来源** 原 CONTEXT.md「测试/验证类坑」

组件 attach 后每个 attr 的 watch 都会被调用一次（即便值就是声明的默认值、从未改过）；watch 里若有"值变为 X 时执行副作用"的分支，初始触发会误执行（st-dialog 曾在加载瞬间被 close 分支加上 closing 属性、display 变 grid 闪一下）；正确写法：watch 分支加状态守卫（如 `_wasOpen` 标记，首次 null 触发直接跳过），不要假设 watch 只在真实变更时执行

---

[← 返回踩坑索引](../README.md)
