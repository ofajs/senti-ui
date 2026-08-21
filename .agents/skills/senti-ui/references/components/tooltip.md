# st-tooltip 提示组件

> **写法优先级**：ofa 页面（`<o-page>` / `<o-app>`）中优先用模板绑定语法：数据绑定 `{{xxx}}`、属性绑定 `attr:xxx="expr"`（布尔属性必须 `attr:`，不能 `:prop`）、双向绑定 `sync:value` / `sync:open`、事件 `on:click` / `on:input`（根级直接写方法名）。纯 JS 场景用 ofa 实例 API：`$("sel").attr(name, value)`（布尔属性 true 添加 / false 移除）、`$("sel").on("event", fn)`。不要写 `setAttribute` / `document.querySelector(...).addEventListener(...)` 等原生 DOM API。详见 [../usage-patterns.md](../usage-patterns.md)。

基于 ofa.js 的悬停/聚焦提示。默认插槽放触发元素，气泡 fixed 定位自动翻转避让视口。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/tooltip/tooltip.html"></l-m>
```

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `content` | string | 无 | 提示文本（textContent 渲染，天然防注入；换行用 `\n` 不支持，长文本自动折行） |
| `disabled` | boolean | 无 | 禁用提示 |

## 运行时状态

- `open`：**data（非标签属性）**，`sync:open="xxx"` 双向绑定；悬停/聚焦宿主自动开合也走此状态；纯 JS 用 `$("st-tooltip").attr("open", true / false)`

## 行为

- 悬停（pointerenter/leave）或聚焦（focusin/out，触发器需可聚焦，如 st-button）显示/隐藏
- `Escape` 关闭；气泡 `pointer-events: none` 不挡交互
- 定位：触发器上方居中，上方放不下自动翻到下方；水平方向夹在视口内

## 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| 气泡 | `inverse-surface` 底 / `inverse-on-surface` 字，圆角 `0.286em` |
| padding / 字号 | `0.357em 0.643em` / `0.857em`（12px） |
| max-width | `20em`（超出折行） |
| 间距 | 触发器与气泡 7px |
| 入场 | 0.15s 淡入 + 轻微位移（方向感知） |

## 注意事项与使用技巧

- `content` 是纯文本渲染（防注入）；需要富文本请自行扩展
- `open` 为运行时状态：ofa 页面用 `sync:open`，JS 用 setAttribute 兼容路径
- 提示不要承载关键信息（触屏设备无悬停）

`index.html`（直接访问 `https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/tooltip/`）。
