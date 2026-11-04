# 内部 `.native` 元素要盖住 position:relative 的兄弟元素必须加 z-index

> **ID** `28` · **分类** 测试 / 验证 · **来源** 原 CONTEXT.md「测试/验证类坑」

`.native`（absolute + inset:0）若后面的兄弟（.box/.track/.item）也是 positioned（relative/absolute），后者按 DOM 顺序画在上面，点击会落到兄弟元素上，交互语义失效、表现为"点了没反应"；正确写法：`.native { z-index: 2 }`。另注意 absolute 的包含块：**宿主必须 position:relative**，否则 `.native` 以最近的 positioned 祖先（如菜单面板）为包含块、inset:0 会铺满整个祖先（st-menu-item 曾因此用最后一个 item 的 native 盖住整个面板、所有点击都被它拦截）

---

[← 返回踩坑索引](../README.md)
