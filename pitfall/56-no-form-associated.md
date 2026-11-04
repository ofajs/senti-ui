# ofa.js 组件不能直接注册成 form-associated custom element

> **ID** `56` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

生成的类没有 `formAssociated` / `ElementInternals` 钩子，`static formAssociated = true` 加不进去。表单能力用 light DOM 里的原生“代理控件”实现（`packages/form/form-proxy.js`）：`slot="form-proxy"`（没有对应 slot，不会渲染）但仍是 form 后代，承担 name/value/required/pattern/checked。代价：代理会让 `:host(:empty)` 失效，checkbox/switch/radio 必须改用 `has-label` 属性判断标签是否为空；代理不可见，浏览器原生校验气泡不会锚定到组件，组件改为派发 `invalid` 并设置 `aria-invalid`。

---

[← 返回踩坑索引](../README.md)
