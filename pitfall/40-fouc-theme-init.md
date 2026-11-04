# JS 动态生成主题会有 FOUC（刷新闪色），治理 = 同步引导 + 双兜底

> **ID** `40` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

模块加载（及其 CDN 依赖）在首帧渲染之后完成，页面先无色再变色。方案：`st-color-init.js` 生成后把主题 CSS 缓存到 localStorage（`st-theme-css`），配套经典同步脚本 `st-boot.js`（head 内引入，页面唯一标签；boot 注入完首帧样式后自动动态加载 st-color-init）刷新时同步注入缓存；首次访问无缓存则同步 `<link>` 静态兜底 `st-default.css`（默认种子色）。要点：a) module 天生 defer，同步注入必须用经典 script（`document.currentScript.parentNode.insertBefore`）；b) st-boot 从自身 src 推导同目录路径，跨路径可用；c) 动态 `<style id="st-dynamic-theme">` 在 head 更靠后，同特异性自然覆盖 boot 注入的样式；d) 依赖库 vendored 到本地（`packages/color/vendor/`）后模块加载不再受外部 CDN 波动影响

---

[← 返回踩坑索引](../README.md)
