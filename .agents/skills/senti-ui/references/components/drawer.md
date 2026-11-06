# st-drawer 侧边抽屉

基于 ofa.js 的模态侧边抽屉。默认从左侧滑入，`side="right"` 改为右侧；与 `st-dialog` 共用焦点陷阱、滚动锁、Escape 栈与关闭后焦点归还。

## 引入

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/drawer/drawer.html"></l-m>
```

组件内部自动引入颜色初始化模块，无需额外引入 `st-color-init.js`。

## 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `open` | —（data，非标签属性） | `false` | 运行时显示状态。ofa 页面用 `sync:open="xxx"` 双向绑定；纯 JS 用 `$("st-drawer").attr("open", "") / attr("open", null)` |
| `auto-close` | boolean | 无 | 允许点击遮罩 / Escape 关闭并派发 `close`；未设置时只能由外部关闭 |
| `side` | `left` / `right` | `left` | 面板贴左或贴右，从对应方向滑入 |

## 插槽

| 插槽 | 说明 |
|------|------|
| `headline` | 标题 / 品牌 / 关闭按钮；空则隐藏 |
| 默认插槽 | 正文 / 导航；占剩余高度，超高内部滚动 |
| `actions` | 底部操作区；横排可换行，空则隐藏 |

## 事件

- `close`：交互关闭（点击遮罩 / Escape，且设置了 `auto-close`）时派发，`bubbles` + `composed`。外部修改 `open` 不派发。

## 示例

```html
<st-button on:click="drawerOpen = true">打开导航</st-button>

<st-drawer sync:open="drawerOpen" auto-close side="left">
  <h2 slot="headline">导航</h2>
  <nav>
    <st-button variant="text" on:click="drawerOpen = false">首页</st-button>
    <st-button variant="text" on:click="drawerOpen = false">文档</st-button>
  </nav>
  <div slot="actions">
    <st-button variant="text" on:click="drawerOpen = false">关闭</st-button>
  </div>
</st-drawer>
```

右侧抽屉：

```html
<st-drawer sync:open="filterOpen" auto-close side="right">
  <h2 slot="headline">筛选</h2>
  <p>筛选项…</p>
  <div slot="actions">
    <st-button on:click="filterOpen = false">应用</st-button>
  </div>
</st-drawer>
```

## 内建行为

- 滑入 / 滑出（默认 280ms / 200ms），关闭动画播完才隐藏；`prefers-reduced-motion` 下动画趋零
- 自动 `role="dialog"` + `aria-modal="true"`，用 headline 文本作为名称（文本变化自动跟随；可显式传 `aria-label` 覆盖）
- 打开时把宿主分支之外的内容设为 `inert`，关闭后恢复（与 dialog 共用模态栈）
- 打开时焦点移入面板，Tab / Shift+Tab 在抽屉内循环；关闭后焦点归还打开它的元素
- 打开期间锁背景滚动；与 `st-dialog` 共用模态栈，叠加时 Escape 只关最上层
- `open` 兼容裸属性 / `setAttribute` / `removeAttribute`；内部交互关闭写 data `open`，`sync:open` 自动回写

## 定制

`::part`：`panel` / `scrim` / `headline` / `body` / `actions`

```css
st-drawer::part(panel) {
  width: 360px;
  background: var(--md-sys-color-surface-container);
}
```

字号类属性直接写在宿主上，面板等比缩放：

```html
<st-drawer open style="font-size: 12px;"> ... </st-drawer>
```

默认值（`::part(panel)`）：宽度 `min(22.86em, 88vw)`（320px @14px）、内边距 `1.43em`、区块间距 `1.14em`、内侧圆角 `1.143em`、底色 `surface-container-low`、内边描边 `outline-variant`、阴影 `--st-shadow-2`。

皮肤 token（均有回退）：`--st-drawer-bg` / `--st-drawer-radius` / `--st-drawer-border` / `--st-drawer-shadow` / `--st-drawer-padding` / `--st-drawer-gap` / `--st-drawer-backdrop-filter` / `--st-drawer-scrim` / `--st-drawer-scrim-filter` / `--st-drawer-enter-duration` / `--st-drawer-exit-duration`。

## 注意

- 不要放在有 `transform` / `filter` / `perspective` / `will-change` 的祖先内：宿主的 `position: fixed` 会改为相对该祖先定位（遮罩铺不满、出现穿透）
- `close` 只在交互关闭时派发；外部关闭不派发
- 面板定制用原生 `::part(panel)`，不要发明使用方变量
