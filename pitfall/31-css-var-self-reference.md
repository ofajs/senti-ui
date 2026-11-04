# CSS 变量不能同名自引用累加

> **ID** `31` · **分类** 测试 / 验证 · **来源** 原 CONTEXT.md「测试/验证类坑」

`--x: calc(var(--x, 0px) + 1em)` 在同一元素上声明时 var 指向自身，按规范构成 guaranteed-invalid 循环，整条声明静默失效（computed value 为空，无任何报错），"沿嵌套层级累加缩进"这类需求 CSS 变量链做不到（Punch-UI 用两个变量名交替也只能固定层数）；正确写法：由父组件**自顶向下传播**——在 sublist 插槽的 slotchange 里把"深度+1"推给已分配的子 st-list 并递归通知子项（st-list-item 的嵌套缩进即此方案，每层 `calc(depth * var(--st-list-step, 1em))`），并加 rAF/setTimeout 重推兜底。**注意**：ofa 页面模块（o-page）可能重排甚至复制嵌套组件的 light DOM（parentElement 链断裂、出现同文本的残留副本），自动化验证时不要用 `textContent.includes` 匹配元素（会命中祖先或副本），要用 id 或精确匹配

---

[← 返回踩坑索引](../README.md)
