# 带 CSS transition 的属性，poll 到一个中间阈值后立刻读终值仍会读到过渡帧

> **ID** `61` · **分类** 测试 / 验证 · **来源** 原 CONTEXT.md「测试/验证类坑」

官网环境光的 `.ambient` 有 `transition: opacity 0.35s`，测试先 poll `opacity > 0.6` 再同步读并断言 `> 0.95`，Apple 皮肤切换时读到 0.826 / 0.895（Playwright 默认 poll 间隔 100ms 起，跨过 0.6 后过渡还没走完）而随机失败。正确写法：**直接 poll 终值本身**（如 `expect.poll(...opacity).toBeGreaterThan(0.95)`），或等 `transitionend` 后再断言；不要用"先等一个宽松阈值、再读一次"的两段式。

---

[← 返回踩坑索引](../README.md)
