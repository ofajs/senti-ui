# 自定义元素构造/ready 期间不能 setAttribute 宿主属性

> **ID** `54b` · **分类** ofa.js / 组件 · **来源** 原 CONTEXT.md「ofa.js 已知坑」

组件 factory 里的 `ready` 在 `document.createElement("st-xxx")` 时也可能执行；此时给宿主 `setAttribute`（role/aria/label 等）会抛 `NotSupportedError: The result must not have attributes`，命令式工具（alert 的 `createElement("st-dialog")`）直接挂掉。正确写法：宿主属性放到 `queueMicrotask` 里写，或移到 `attached`；内部 shadow 元素不受此限制。需要初始状态的组件（progress）用 `_a11yReady` 标志跳过构造期的属性写入，微任务里再统一应用。

---

[← 返回踩坑索引](../README.md)
