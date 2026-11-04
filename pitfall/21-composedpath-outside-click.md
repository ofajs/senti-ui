# document 层监听判断"点击组件外部"必须用 `e.composedPath().includes(ele)`，不能用 `ele.contains(e.target)`

> **ID** `21` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

composed 事件（pointerdown/click）冒泡到 document 时，target 已被沿途每层 shadow 边界重定向为最外层宿主（如 `o-page`），`contains` 必然误判为外部；st-select 曾因此弹层被提前关闭、选项 click 落空（表现为"选了没反应"）。另：合成验证（直接 `.click()` 选项）不触发 pointerdown，测不出此类问题，务必用真实点击回归

---

[← 返回踩坑索引](../README.md)
