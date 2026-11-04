# 原生 `<input>`/`<textarea>` 的 `change` 事件不是 composed，穿不出 shadow DOM

> **ID** `25` · **分类** 测试 / 验证 · **来源** 原 CONTEXT.md「测试/验证类坑」

`input` 事件 composed:true 可直接在宿主监听，但 `change`（bubbles:true、composed:false）只到 shadow 边界为止，在宿主/页面监听不到（Playwright 实测确认）；正确写法：组件 ready 里转发 `input.addEventListener("change", () => ele.dispatchEvent(new Event("change", { bubbles: true, composed: true })))`。st-input / st-textarea 已加此转发

---

[← 返回踩坑索引](../README.md)
