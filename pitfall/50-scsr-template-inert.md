# SCSR 的 `template[page]` 在脚本执行前是惰性的，“无 JS 可见/首屏 SSR”不成立

> **ID** `50` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

实测禁用 JavaScript 打开 SCSR 页面时正文为空（template 内容不渲染），scsr 只在 JS 执行后把它收编进 o-page shadow；“服务端投递完整 HTML”只保证源码里有全文。需要真正的无 JS 首屏/SEO 时，要在服务端把内容预渲染到 `o-app` 之外（或改用真 SSR/SSG），不要只依赖 template；至少给一个 `<noscript>` 兜底。官网 `site/` 已按此加兜底。

---

[← 返回踩坑索引](../README.md)
