# SCSR 多级父页：`parent` 相对子页解析，slot 外层必须相对定位；父页 `routerChange` 才能拿到当前子页

> **ID** `51` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

`site/docs/` 的嵌套布局踩过三个点：a) 组件页 `parent = "./layout.html"`（同目录），docs layout 再 `parent = "../layout.html"`，写成 `../layout.html` 会让组件页跳过二级父页直接挂到站点 layout；b) 同父页组件互切时父页不销毁，侧栏高亮/移动端 picker 要在父页 `routerChange({ current })` 里用 `current.src` 更新（`ready` 时再按 `location.pathname` 兜一次），子页自身不会收到该回调；c) 离场页被路由设为 `position: absolute`，承载 `<slot>` 的容器（如 `.docs-body`）必须 `position: relative`，否则离场页相对视口定位，切换瞬间露出旧页内容，表现为“闪一下”。另外 `::slotted(o-page)` 的入场动画要写在实际发生替换的那层父页里（docs layout），不能只写站点 layout。**（2026-11 更新：切页动画已统一收进 `app-config.js` 的 `pageAnime`，父页不再写动画 CSS，见 [#59b](./59b-pageanime-transition.md)。）**

---

[← 返回踩坑索引](../README.md)
