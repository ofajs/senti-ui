# st-drawer 侧边抽屉组件

基于 ofa.js 的模态侧边抽屉 `st-drawer`。语义由属性表达（`open` 控制显示、`auto-close` 控制交互关闭、`side` 控制左/右方向），视觉默认值全用 em，面板外观用原生 CSS `::part(panel)` 直接定制。

由 `st-dialog` 的同一套模态基础实现（焦点陷阱、滚动锁、Escape 栈、关闭后焦点归还），区别是面板贴在视口左侧或右侧、占满高度，适合移动端导航、筛选面板、详情侧栏。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/drawer/drawer.html"></l-m>
```

组件内部已 `import "../color/st-color-init.js"`，加载时自动注入 `--md-sys-color-*` 颜色体系（多次 import 不冲突）；若你的部署不含 color 包，则需自行定义这些变量。

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `open` | —（data，非标签属性） | `false` | 运行时显示状态。**推荐 `sync:open="xxx"` 双向绑定**：内部交互关闭（auto-close）会自动回写上层数据；也兼容标签裸属性 / `setAttribute` / `removeAttribute`（组件内部同步） |
| `auto-close` | boolean | 无 | 允许交互关闭：点击遮罩或按 Escape 时关闭（改 data `open`，`sync:open` 自动回写）并派发 `close` 事件；未设置时只能由外部代码关闭 |
| `side` | `left` / `right` | `left` | 面板贴哪一侧。`left` 从左侧滑入，`right` 从右侧滑入；运行时改属性会立即换边 |

```html
<!-- 推荐：sync:open 双向绑定，auto-close 关闭后 drawerOpen 自动变回 false -->
<st-drawer sync:open="drawerOpen" auto-close side="left">
  <h2 slot="headline">导航</h2>
  <p>抽屉正文</p>
  <div slot="actions">
    <st-button variant="text">关闭</st-button>
  </div>
</st-drawer>
```

```js
// 兼容写法（非 ofa 页面 / 自动化测试）
drawer.setAttribute("open", ""); // 打开
drawer.removeAttribute("open");  // 关闭（不派发 close 事件）
```

## 插槽

| 插槽 | 说明 | 区块表现 |
|------|------|----------|
| `headline` | 标题（建议放 `h2` 等标题元素，也可放品牌/关闭按钮） | 16px / 500 字重；空则区块隐藏 |
| 默认插槽 | 正文 / 导航内容 | 占满剩余高度，超高时内部滚动（headline / actions 固定） |
| `actions` | 底部操作区（建议放 `st-button`） | 横排、可换行；空则区块隐藏 |

## 事件

- `close`：**交互关闭**（点击遮罩 / Escape，且设置了 `auto-close`）时派发，`bubbles` + `composed`，直接在 `<st-drawer>` 上监听。外部代码 `removeAttribute("open")` 关闭**不**派发：

```js
document.querySelector("st-drawer").addEventListener("close", () => {
  console.log("用户主动关闭了抽屉");
});
```

## 内建行为

- **滑入 / 滑出**：打开时遮罩淡入、面板从对应方向滑入（默认 280ms）；关闭时反向滑出（200ms）后才隐藏。系统开启“减少动态效果”（`prefers-reduced-motion`）时动画时长自动趋零
- **模态语义**：宿主自动获得 `role="dialog"`、`aria-modal="true"`，用 headline 文本作为 `aria-label`（headline 文本变化会自动跟随；也可自行传 `aria-label` / `aria-labelledby` 覆盖）
- 打开时把模态宿主分支之外的内容设为 `inert`（移出 Tab 与无障碍树），关闭后恢复；与 dialog 共用模态栈
- 打开时焦点自动移入面板容器（`tabindex="-1"`），Tab / Shift+Tab 在抽屉内循环（焦点陷阱）；关闭后焦点归还打开它的元素；打开期间锁定背景滚动（与 dialog 共用引用计数）
- Escape / 遮罩点击仅在 `auto-close` 存在时生效；与 `st-dialog` 共用模态栈，叠加时 Escape 只关最上层
- 关闭后组件仍留在 DOM（`visibility: hidden`），不参与 Tab 顺序；快速关闭再打开会立即反向滑入
- 内部交互关闭改的是 data `open`（`this.open = false`），`sync:open` 绑定的上层数据自动同步；close 事件同时派发
- 组件从 DOM 移除时自动清理 document 级键盘 / 焦点监听，并从模态栈移除

## 外观定制：原生 CSS `::part()`

面板、遮罩、三个插槽容器都暴露了 part：

| part | 说明 |
|------|------|
| `panel` | 抽屉面板（宽度、圆角、底色、阴影等） |
| `scrim` | 遮罩层 |
| `headline` | 标题容器 |
| `body` | 正文滚动容器 |
| `actions` | 底部操作容器 |

```css
st-drawer::part(panel) {
  width: 360px;
  background: var(--md-sys-color-surface-container);
}

st-drawer::part(scrim) {
  background: rgb(0 0 0 / 0.4);
}
```

字号类属性（`font-size` / 文字颜色等可继承属性）直接写在宿主上即可，面板自动继承：

```html
<st-drawer open style="font-size: 12px;"> ... </st-drawer>
```

### 默认值（`::part(panel)` 上，直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| `width` | `min(22.86em, 88vw)`（= 320px @ 14px 字号） |
| `height` | 视口高度（`inset: 0 auto 0 0` / 右侧镜像） |
| `padding` | `1.43em`（= 20px） |
| `border-radius` | 内侧两角 `1.143em`（= 16px），外侧贴边为 0 |
| `background` | `surface-container-low` |
| `color`（正文） | `on-surface-variant`（标题为 `on-surface`，随面板继承） |
| 区块间距 `gap` | `1.14em`（= 16px） |
| 内边描边 | `outline-variant`，1px |
| `box-shadow` | 皮肤阴影（默认 `--st-shadow-2`） |
| `font-size` | `14px`（写在宿主上，全面板等比缩放） |

### 宿主（遮罩层）默认值

| 属性 | 默认值 |
|------|--------|
| `z-index` | `1000`（与 st-dialog 同层，按打开顺序叠放） |
| 遮罩 | `--st-dialog-scrim`（黑 @ 28%）+ `backdrop-filter: blur(2px)` |

### 皮肤 token

组件消费以下 `--st-drawer-*` token（都有回退值，不加载皮肤时外观不变）：

| token | 默认回退 |
|------|------|
| `--st-drawer-bg` | `var(--md-sys-color-surface-container-low)` |
| `--st-drawer-radius` | `var(--st-radius-lg, 1.143em)` |
| `--st-drawer-border` | `var(--md-sys-color-outline-variant)` |
| `--st-drawer-shadow` | `var(--st-shadow-2, none)` |
| `--st-drawer-padding` | `1.43em` |
| `--st-drawer-gap` | `1.14em` |
| `--st-drawer-backdrop-filter` | `none` |
| `--st-drawer-scrim` | `var(--st-dialog-scrim)` |
| `--st-drawer-scrim-filter` | `var(--st-dialog-scrim-filter)` |
| `--st-drawer-enter-duration` | `0.28s` |
| `--st-drawer-exit-duration` | `0.2s` |

## 主题

`st-color-init.js` 注入的颜色体系默认跟随系统深浅色；强制指定：`<html class="st-light">` 或 `<html class="st-dark">`。

## 注意事项

- **`open` 是运行时状态（data，非标签属性）**：ofa 页面里用 `sync:open="xxx"`，auto-close 关闭后 xxx 自动变回 false；兼容裸属性 / `setAttribute`，但绑定场景推荐 `sync:`
- `close` 事件只在**交互关闭**（auto-close）时派发；外部关闭不派发
- 面板定制用原生 `::part(panel)` 选择器（不是自定义变量）；字号类直接写宿主 style（可继承）
- 与 `st-dialog` 可同时打开：后打开的在上层，Escape 只关最上层
- **不要把 st-drawer 放在已设置 `transform`（及 `filter`/`perspective`/`will-change`）的祖先元素内**——这些属性会创建新的包含块，宿主的 `position: fixed` 遮罩与面板会改为相对该祖先定位，遮罩铺不满视口、出现“穿透”（详见坑 #42）

## 验证页面

`index.html` 为打开即看的完整示例（直接访问 `/packages/drawer/`），左侧 / 右侧、受控关闭、`::part(panel)` 定制与非 M3 皮肤示例都在其中。
