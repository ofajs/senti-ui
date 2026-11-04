# Playwright 断言 `page.evaluate(...)` 返回值必须 `await`

> **ID** `26` · **分类** 测试 / 验证 · **来源** 原 CONTEXT.md「测试/验证类坑」

`expect(page.evaluate(...))` 收到的是 Promise 对象，断言必失败且报错信息晦涩（"Received: Promise {}"）；正确写法 `expect(await page.evaluate(...))`

---

[← 返回踩坑索引](../README.md)
