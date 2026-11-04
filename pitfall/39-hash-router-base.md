# o-router 的 hash 路由以站点根（origin）解析，不相对当前页面目录

> **ID** `39` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

应用放在子目录（如 `docs/`）时，hash 必须带目录前缀：`#/docs/pages/xxx.html`（写 `#/pages/xxx.html` 会去请求 `/pages/xxx.html` 而 404）；`app-config.js` 的 `home` 是相对配置文件的路径不受影响。另：嵌套布局页（parent/slot 模式）里 `routerChange` 不保证触发，侧边栏高亮改用 `ready` + `window.addEventListener("hashchange", ...)` 主动刷新更可靠

---

[← 返回踩坑索引](../README.md)
