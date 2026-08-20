# st-snackbar 消息条组件

基于 ofa.js 的底部消息条组件。视觉在 `:host` 上（默认主题次级色 `secondary` 底，`color` 属性可换任意 M3 角色），可直接用原生 CSS 属性覆盖。

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
| `color` | M3 角色名 / 自定义变量名 | 无 | 语义配色：底色为角色色、文字为 on-角色色（如 `color="error"`）；未设置时用默认反色底 |

```js
snackbar.setAttribute("open", "");
snackbar.setAttribute("duration", "4000");
snackbar.hide(); // JS 主动关闭（派发 close）
```

## 插槽

- 默认插槽：消息内容
- `action`：操作区（建议放 `st-button variant="text"`，颜色继承文字色自动配对）

## color 属性（与 color 模块联动）

接受 **M3 角色名**（`primary` / `secondary` / `tertiary` / `error` / `success`）或 **color 工具里定义的自定义变量名**，底色/文字自动配对：

```html
<st-snackbar open color="success">保存成功</st-snackbar>
<st-snackbar open color="error">操作失败，请重试</st-snackbar>
<!-- 自定义：先在 color 工具添加变量 brand（生成 --brand / --on-brand），同域页面即可用 -->
<st-snackbar open color="brand">品牌色消息</st-snackbar>
```

在 color 工具里改配色，全站 `color="brand"` 的消息条自动跟随（一键换色）。需要更自由的效果仍用原生 style。

## 事件

- `close`：`duration` 到时自动关闭或 `el.hide()` 时派发（`bubbles` + `composed`）。外部 `removeAttribute("open")` 不派发。

## 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| min-width / max-width | `14.286em` / `34.286em`（= 200/480px） |
| padding | `0.857em 1em` |
| 圆角 | `0.286em`（= 4px） |
| 底色 / 文字 | 默认 `secondary` / `on-secondary`（主题次级色）；`color` 属性时为 角色色 / on-角色色 |
| 操作区颜色 | `on-secondary`（默认底色下）；`color` 属性时跟随 on-角色色（继承文字色） |
| 入场动画 | 上移淡入 0.2s（M3 emphasized） |
| `font-size` | `14px` |

定位由外部决定（通常 `position: fixed; bottom; left: 50%` 或用宿主 style 控制）。

## 验证页面

`index.html`（直接访问 `/packages/snackbar/`）。
