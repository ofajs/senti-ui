# st-snackbar 消息条组件

基于 ofa.js 的底部消息条组件。视觉在 `:host` 上（inverse-surface 深色底），可直接用原生 CSS 属性覆盖。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="/packages/snackbar/snackbar.html"></l-m>
```

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `open` | boolean | 无 | 显示（底部上滑入场 0.2s） |
| `duration` | number（毫秒） | 无 | 设置后打开 `duration` 毫秒自动关闭并派发 `close` |

```js
snackbar.setAttribute("open", "");
snackbar.setAttribute("duration", "4000");
snackbar.hide(); // JS 主动关闭（派发 close）
```

## 插槽

- 默认插槽：消息内容
- `action`：操作区（建议放 `st-button variant="text"`，颜色自动 inverse-primary）

## 事件

- `close`：`duration` 到时自动关闭或 `el.hide()` 时派发（`bubbles` + `composed`）。外部 `removeAttribute("open")` 不派发。

## 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| min-width / max-width | `14.286em` / `34.286em`（= 200/480px） |
| padding | `0.857em 1em` |
| 圆角 | `0.286em`（= 4px） |
| 底色 / 文字 | `inverse-surface` / `inverse-on-surface`（深浅主题均深色底） |
| 操作区颜色 | `inverse-primary` |
| 入场动画 | 上移淡入 0.2s（M3 emphasized） |
| `font-size` | `14px` |

定位由外部决定（通常 `position: fixed; bottom; left: 50%` 或用宿主 style 控制）。

## 验证页面

`index.html`（直接访问 `/packages/snackbar/`）。
