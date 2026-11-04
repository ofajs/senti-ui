# ofa 页面模块（page.html）脚本内不能用相对路径 `import()`

> **ID** `6` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

模块代码经 eval 执行，相对路径解析失败；需要在 index.html 用 `<script type="module">` 预加载并挂到 `window`，页面工厂里等待就绪（注意 `o-page` 升级可能早于内联 module 执行，`__ready` Promise 可能尚不存在，须轮询 `window` 上的标记）

---

[← 返回踩坑索引](../README.md)
