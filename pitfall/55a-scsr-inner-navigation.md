# SCSR 站内跳转只解析目标页的 `template[page]`，目标页 body 里的 `<l-m>` 不会执行

> **ID** `55a` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

从手记/皮肤页切到文档时，文档页 body 明明有 `list/list.html` 与 `select/select.html` 的 l-m，但左侧目录只显示分组标题、`st-list-item` 全空（组件未升级）；从皮肤页切回首页时，首页只有 layout/皮肤页碰巧加载过的那几个组件能升级，按钮组、选择、开关等大量卡片空白。同样，**目标页 body 里的 module 脚本也不会执行**：从其他栏目切到皮肤页时 `window.__site` 还是上一页的对象，颜色 API / 预览主题缺失，五张卡会全部退回当前全局色。正确写法：① 页面自己的组件依赖放进该页 `<template page>` 内（首页、皮肤、手记与 21 个 docs 页已迁移）；② 全站命令式 API / 主题管理器在持久存在的 `layout.html` 里用 `initSiteApi()` 初始化一次并挂到 `window.__site` / `window.__siteTheme`，页面 body module 只做 `Object.assign` 兜底；③ 共享 layout 共用的依赖在父页模板里再声明一次。不要假设入口页加载过的组件或对象在另一栏目入口时仍然存在。

---

[← 返回踩坑索引](../README.md)
