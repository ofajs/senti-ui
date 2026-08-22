# st-snackbar 消息条组件（含命令式工具 toast）

基于 ofa.js 的底部消息条组件 `st-snackbar`，以及基于它构建的命令式 toast 工具（`toast.js`），同目录存放。视觉在 `:host` 上（默认主题次级色 `secondary` 底，`color` 属性可换任意 M3 角色），可直接用原生 CSS 属性覆盖。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/snackbar/snackbar.html"></l-m>
```

toast 工具无需预引入组件——内部按需注入 `<l-m>`（snackbar / button）并等待就绪：

```html
<script type="module">
  import toast from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/snackbar/toast.js";
</script>
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
| padding | 无按钮 `0.571em 1em`（8px 14px，舒适）；有操作按钮时自动收紧为 `0.286em` 上下（4px，40px 按钮撑出 M3 48dp）——由 action 插槽有无内容动态分档（`has-action` 属性，slotchange 探测）；高度纯内容决定，无 min-height |
| 圆角 | `0.286em`（= 4px） |
| 底色 / 文字 | 默认 `secondary` / `on-secondary`（主题次级色）；`color` 属性时为 角色色 / on-角色色 |
| 操作区颜色 | `on-secondary`（默认底色下）；`color` 属性时跟随 on-角色色（继承文字色） |
| 显隐 | `open` 属性即时切换（display none ↔ inline-flex），**组件不自带开合动画**；需要动画由外部包装提供（toast 工具自带滑入/滑出） |
| `font-size` | `14px` |

定位由外部决定（通常 `position: fixed; bottom; left: 50%` 或用宿主 style 控制）。

## 命令式工具：toast

`toast()` 式即用消息提示：固定在视口左下角、多条堆叠、入场/退场动画、自动或手动关闭。

```js
// 字符串简写，默认 3s 消失
const t = await toast("已保存");
// 对象参数：message / duration（毫秒，0 = 不自动消失）/ color（M3 角色名）
const t = await toast({ message: "同步完成", color: "success", duration: 4000 });
const t = await toast({ message: "点 ✕ 关闭", duration: 0 });
t.close(); // 手动关闭（返回 { close, el }）
```

实现说明：消息条复用 st-snackbar（✕ 关闭用**小号 st-icon-button**，`font-size: 10px` 等比缩小到约 28px 不撑高消息条；按钮色走 `color` 属性——默认反色底上 `inverse-primary`、彩色底上 `on-角色色`）；消息文本走 `textContent` 天然防注入；容器 `pointer-events: none` 不挡页面交互。

## 注意事项与使用技巧

- **action 按钮必须用 st-button 的 `color` 属性着色**（如默认反色底上 `color="inverse-primary"`、红底上 `color="on-error"`）——给 st-button 写内联 style color 会被其配色逻辑覆盖
- `duration` 是毫秒数属性，仅与 `open` 同时存在时生效；`el.hide()`（宿主 property）手动关闭并派发 close
- 外部 `removeAttribute("open")` 关闭不派发 close
- 显隐即时切换，无内建动画；`hide()`（宿主 property）关闭并派发 close
- toast 工具自带滑入/滑出动画（0.3s，斜向渐移），播完才移除元素：常用 `position: fixed; bottom; left: 50%; transform: translateX(-50%)`
- 纯展示场景直接加 `open` 属性静态渲染即可
## 验证页面

`index.html`（直接访问 `/packages/snackbar/`）。
### toast 注意事项

- 返回 `{ close, el }`（非 Promise 结果值本身），`close()` 幂等
- 多条 toast 在左下角堆叠（后出的在下），各自独立计时关闭
- `duration: 0` 不自动消失，只能点 ✕ 或 `close()` 关闭
- 容器固定在视口左下角（fixed），不要在有 transform 的祖先内调用（坑同 st-dialog #36）——工具自动挂 body，正常使用不受影响
