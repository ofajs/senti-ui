# st-tooltip 提示组件

基于 ofa.js 的悬停/聚焦提示。默认插槽放触发元素，气泡 fixed 定位自动翻转避让视口。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/tooltip/tooltip.html"></l-m>
```

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `content` | string | 无 | 提示文本（textContent 渲染，天然防注入；换行用 `\n` 不支持，长文本自动折行） |
| `disabled` | boolean | 无 | 禁用提示 |

## 运行时状态

- `open`：**data（非标签属性）**，`sync:open="xxx"` 双向绑定；悬停/聚焦宿主自动开合也走此状态；兼容 `setAttribute("open","")` / `removeAttribute`

## 行为

- 悬停（pointerenter/leave）或聚焦（focusin/out，触发器需可聚焦，如 st-button）显示/隐藏
- 触屏：在触发元素上**长按 500ms** 打开，抬手后保留、且不会触发触发元素的 click；点触发元素外部关闭；按下后移动超过 10px / 抬起 / 取消会中止长按；长按打开时吞掉系统 contextmenu
- `Escape` 只关闭 tooltip（不会连带关闭外层 dialog）；气泡 `pointer-events: none` 不挡交互
- 定位：触发器上方居中，上方放不下自动翻到下方；水平方向夹在视口内；打开期间滚动/缩放会跟随触发器
- 气泡 `role="tooltip"`，`aria-hidden` 随开合切换；提示文本以 `aria-description` 挂到触发元素（组件触发器则挂内部原生控件）

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
- `open` 为运行时状态：ofa 页面用 `sync:open`，JS 用 `setAttribute("open","")` / `removeAttribute("open")`（组件内部同步并重新定位）
- 提示不要承载关键信息（触屏需长按，键盘用户走 focus 路径）

## 验证页面

`index.html`（直接访问 `/packages/tooltip/`）。
