# 本地验证必须用 `npm run dev`

> **ID** `8` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

（http-server `-c-1` 禁缓存，端口 8642）——用户通常会提前启动它，直接用 `http://localhost:8642/` 验证即可，不要另起 python http.server 等不禁缓存的服务，否则改完 `page.html` / `m3-theme.js` 浏览器继续用旧模块，表现为"改了没生效"或诡异报错，排查极耗时

---

[← 返回踩坑索引](../README.md)
