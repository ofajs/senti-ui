# st-dialog 对话框组件（含命令式工具 alert / confirm / prompt）

基于 ofa.js 的模态对话框组件 `st-dialog`，以及基于它构建的三个命令式工具（`alert.js` / `confirm.js` / `prompt.js`），同目录存放。语义由属性表达（`open` 控制显示，`auto-close` 控制交互关闭），视觉默认值全用 em，面板外观用原生 CSS `::part(panel)` 选择器直接定制。

组件结构与输入类组件不同：**宿主元素是全屏遮罩层**（fixed 铺满视口、内容居中），面板渲染在 shadow 内部（`part="panel"`）——遮罩必须铺满屏幕，无法把面板视觉放在 `:host` 上，这是对话框类组件的必要例外。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/dialog/dialog.html"></l-m>
```

命令式工具无需预引入组件——工具内部按需注入 `<l-m>`（dialog / button / input）并等待就绪：

```html
<script type="module">
  import alert from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/dialog/alert.js";
  import confirm from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/dialog/confirm.js";
  import prompt from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/dialog/prompt.js";
</script>
```

组件内部已 `import "../color/st-color-init.js"`，加载时自动注入 `--md-sys-color-*` 颜色体系（多次 import 不冲突）；若你的部署不含 color 包，则需自行定义这些变量。

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `open` | —（data，非标签属性） | `false` | 运行时显示状态。**推荐 `sync:open="xxx"` 双向绑定**：内部交互关闭（auto-close）会自动回写上层数据；也兼容标签裸属性 / `setAttribute` / `removeAttribute`（组件内部同步） |
| `auto-close` | boolean | 无 | 允许交互关闭：点击遮罩或按 Escape 时关闭（改 data `open`，`sync:open` 自动回写）并派发 `close` 事件；未设置时只能由外部代码关闭 |

JS 中请用 attribute 方式（直接改 property 不触发更新）：

```html
<!-- 推荐：sync:open 双向绑定，auto-close 关闭后 xxx 自动变回 false -->
<st-dialog sync:open="dlgOpen" auto-close> ... </st-dialog>
```

```js
// 兼容写法（非 ofa 页面 / 自动化测试）
$("st-dialog").attr("open", "");   // 打开
$("st-dialog").attr("open", null);  // 关闭（不派发 close 事件）
```

## 插槽

| 插槽 | 说明 | 区块表现 |
|------|------|----------|
| `headline` | 标题（建议放 `h2` 等标题元素） | 16px / 500 字重；空则区块隐藏 |
| 默认插槽 | 正文内容 | 超高时区块内部滚动（headline / actions 固定） |
| `actions` | 操作区（建议放 `st-button`） | 右对齐横排；空则区块隐藏 |

```html
<st-dialog open auto-close>
  <h2 slot="headline">删除确认</h2>
  <p>删除后不可恢复，确定要继续吗？</p>
  <div slot="actions">
    <st-button variant="text">取消</st-button>
    <st-button color="error" id="confirm">删除</st-button>
  </div>
</st-dialog>
```

## 事件

- `close`：**交互关闭**（点击遮罩 / Escape，且设置了 `auto-close`）时派发，`bubbles` + `composed`，直接在 `<st-dialog>` 上监听。外部代码 `$("st-dialog").attr("open", null)` 关闭**不**派发：

```js
$("st-dialog").on("close", () => {
  console.log("用户主动关闭了对话框");
});
```

## 内建行为

- **M3 emphasized 动效**：打开时遮罩淡入（250ms）+ 面板 `scale(0.9)` 上移入场（300ms，M3 emphasized 曲线）；关闭时反向退出（200ms），动画播完后才彻底隐藏。系统开启"减少动态效果"（`prefers-reduced-motion`）时动画时长自动趋零
- 打开时焦点自动移入面板容器（`tabindex="-1"`），键盘用户可直接 Tab 到内部控件；面板本身不画 focus ring（由内部交互元素各自承载）
- Escape / 遮罩点击仅在 `auto-close` 存在时生效；多个对话框同时打开时各管各的
- 关闭后组件仍留在 DOM（`display: none`）；快速关闭再打开会立即取消退出动画重新入场
- 内部交互关闭改的是 data `open`（`this.open = false`），`sync:open` 绑定的上层数据自动同步；close 事件同时派发
- 组件从 DOM 移除时自动清理 document 级键盘监听与关闭动画定时器

## 外观定制：原生 CSS `::part(panel)`

面板在 shadow 内，宽高/圆角/底色/阴影用标准 `::part()` 选择器覆盖（这是浏览器原生 CSS 能力，不是自定义变量）：

```css
st-dialog::part(panel) {
  width: 360px;
  border-radius: 16px;
  background: var(--md-sys-color-surface-container-low);
}
```

字号类属性（`font-size` / 文字颜色等可继承属性）直接写在宿主上即可，面板自动继承：

```html
<st-dialog open style="font-size: 12px;"> ... </st-dialog>
```

### 默认值（::part(panel) 上，直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| `width` | `min(34.29em, 100%)`（= 480px @ 14px 字号，M3 最大宽度） |
| `max-height` | `100%`（宿主有 1.43em 内边距，超高时正文区内部滚动） |
| `padding` | `1.43em`（= 20px） |
| `border-radius` | `1.714em`（= 24px，M3 extra-large 圆角） |
| `background` | `surface-container-high` |
| `color`（正文） | `on-surface-variant`（headline 为 `on-surface`，随面板继承） |
| `box-shadow` | M3 elevation level 3（规范常量） |
| 区块间距 `gap` | `1.14em`（= 16px） |
| `font-size` | `14px`（写在宿主上，全面板等比缩放） |

### 宿主（遮罩层）默认值

| 属性 | 默认值 |
|------|--------|
| `z-index` | `1000` |
| `padding` | `1.43em`（面板与视口的留白） |
| 遮罩 | 轻磨砂玻璃：rgba(0,0,0,0.28) + `backdrop-filter: blur(0.357em)`（= 5px，M3 scrim 规范基色的变体，不随配色变化） |

## 主题

`st-color-init.js` 注入的颜色体系默认跟随系统深浅色；强制指定：`<html class="st-light">` 或 `<html class="st-dark">`。

## 命令式工具：alert / confirm / prompt

`window.alert/confirm/prompt` 的异步替代品，基于 st-dialog（M3 风格、带入场/退出动画、遮罩/Escape 可关），**命令式调用、用完即毁**（关闭动画播完自动移除 DOM）。参数支持字符串简写或对象：

```js
// alert：确认 → true；遮罩/Escape → null
const ok = await alert("操作成功");
await alert({ title: "提示", message: "密码已重置", ok: "知道了" });

// confirm：确认 → true；取消 → false；遮罩/Escape → null。color 用于危险操作
const ok = await confirm({ title: "确认删除", message: "不可撤销", yes: "删除", cancel: "取消", color: "error" });

// prompt：确认 → 输入值(string)；取消/遮罩/Escape → null（对齐原生行为）。
// 自动聚焦并全选默认值，Enter 提交
const val = await prompt({ title: "重置密码", message: "至少 4 位", placeholder: "新密码", value: "预填" });
```

对象参数：`title` / `message`（或 `content`）/ `ok`（或 `yes`）/ `cancel` / `placeholder` / `value` / `color`。

实现说明：核心工厂在 `util.js` 的 `createDialog`（escapeHtml + 组件按需加载 + Promise 结果映射）；文本均经 HTML 转义防注入；prompt 的输入框聚焦特意排在对话框自身聚焦之后（避免焦点被抢回）。

## 注意事项与使用技巧

- **`open` 是运行时状态（data，非标签属性）**：会被内部交互修改的状态放 data 而非 attrs——attrs 属性内部只能 setAttribute/removeAttribute，无法回写上层的 `sync:` 绑定。**ofa 页面里用 `sync:open="xxx"`**，auto-close 关闭后 xxx 自动变回 false
- 兼容路径：标签裸属性 `open`、`setAttribute` / `removeAttribute` 也有效（内部 MutationObserver 同步进 data），但 ofa 绑定场景仍推荐 `sync:open`
- `close` 事件只在**交互关闭**（auto-close）时派发；外部关闭不派发——若需统一感知，监听后自行维护状态
- 面板定制用原生 `::part(panel)` 选择器（不是自定义变量）；字号类直接写宿主 style（可继承）
- 多个对话框同时打开时 Escape 各管各的（都设 auto-close 时都会关）
- **不要把 st-dialog 放在已设置 `transform`（及 `filter`/`perspective`/`will-change`）的祖先元素内**——这些属性会创建新的包含块，宿主的 `position: fixed` 遮罩与面板会改为相对该祖先定位，遮罩铺不满视口、出现"穿透"（下方内容可点、遮罩错位）。常见触发场景：做过入场动画（transform 未清除）的容器、开启了 translate 的布局包装。对话框请挂在 `document.body` 或无 transform 的顶层容器下（命令式工具 alert/confirm/prompt 已自动挂 body，不受影响）
`index.html` 为打开即看的完整示例，可作视觉验收用（直接访问 `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/dialog/`）。
### 命令式工具注意事项

- 返回值语义：alert 确认 `true` / 关闭 `null`；confirm 确认 `true` / 取消 `false` / 关闭 `null`；prompt 确认为输入值 / 其余 `null`
- 工具会话结束后自动移除 DOM（350ms 动画后），不要持有实例跨会话复用
- 无需预引入 st-dialog/st-button/st-input——工具内部按需注入 `<l-m>`；但 ofa.js 本身必须已加载
- 消息文本自动 HTML 转义；如需富文本请直接用 `st-dialog` 标签
