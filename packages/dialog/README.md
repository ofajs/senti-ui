# st-dialog 对话框组件

基于 ofa.js 的模态对话框组件。语义由属性表达（`open` 控制显示，`auto-close` 控制交互关闭），视觉默认值全用 em，面板外观用原生 CSS `::part(panel)` 选择器直接定制。

组件结构与输入类组件不同：**宿主元素是全屏遮罩层**（fixed 铺满视口、内容居中），面板渲染在 shadow 内部（`part="panel"`）——遮罩必须铺满屏幕，无法把面板视觉放在 `:host` 上，这是对话框类组件的必要例外。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="/packages/dialog/dialog.html"></l-m>
```

组件内部已 `import "../color/st-init.js"`，加载时自动注入 `--md-sys-color-*` 颜色体系（多次 import 不冲突）；若你的部署不含 color 包，则需自行定义这些变量。

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `open` | boolean | 无 | 显示对话框（纯 CSS 控制显隐，`setAttribute` / `removeAttribute` 同步生效） |
| `auto-close` | boolean | 无 | 允许交互关闭：点击遮罩或按 Escape 时移除 `open` 并派发 `close` 事件；未设置时只能由外部代码关闭 |

JS 中请用 attribute 方式（直接改 property 不触发更新）：

```js
dialog.setAttribute("open", "");   // 打开
dialog.removeAttribute("open");    // 关闭（不派发 close 事件）
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

- `close`：**交互关闭**（点击遮罩 / Escape，且设置了 `auto-close`）时派发，`bubbles` + `composed`，直接在 `<st-dialog>` 上监听。外部代码 `removeAttribute("open")` 关闭**不**派发：

```js
document.querySelector("st-dialog").addEventListener("close", () => {
  console.log("用户主动关闭了对话框");
});
```

## 内建行为

- **M3 emphasized 动效**：打开时遮罩淡入（250ms）+ 面板 `scale(0.9)` 上移入场（300ms，M3 emphasized 曲线）；关闭时反向退出（200ms），动画播完后才彻底隐藏。系统开启"减少动态效果"（`prefers-reduced-motion`）时动画时长自动趋零
- 打开时焦点自动移入面板容器（`tabindex="-1"`），键盘用户可直接 Tab 到内部控件；面板本身不画 focus ring（由内部交互元素各自承载）
- Escape / 遮罩点击仅在 `auto-close` 存在时生效；多个对话框同时打开时各管各的
- 关闭后组件仍留在 DOM（`display: none`），状态由外部管理；快速关闭再打开会立即取消退出动画重新入场
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

`st-init.js` 注入的颜色体系默认跟随系统深浅色；强制指定：`<html class="st-light">` 或 `<html class="st-dark">`。

## 验证页面

`index.html` 为打开即看的完整示例，可作视觉验收用（直接访问 `/packages/dialog/`）。
