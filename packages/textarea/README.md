# st-textarea 多行输入框组件

基于 ofa.js 的多行输入框组件。语义由属性表达，外观直接用**原生 CSS 属性**定制（没有 size 类预设，也不需要自定义 CSS 变量）。

内部有一个透明的原生 `<textarea>` 负责语义（输入/键盘/焦点/rows）。拖拽手柄默认关闭，高度由 `rows` / 内容（`autosize`）/ `style="height: ..."` 决定。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="/packages/textarea/textarea.html"></l-m>
```

组件内部已 `import "../color/st-init.js"`，加载时自动注入 `--md-sys-color-*` 颜色体系（多次 import 不冲突）；若你的部署不含 color 包，则需自行定义这些变量。

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `"outlined" \| "filled"` | `"outlined"` | M3 规范的两种类型（outlined 有全边框；filled 容器底色 + 底边线） |
| `rows` | number | `"3"` | 可见行数，转发给内部 textarea（行高 1.7em）；autosize 模式下作为最小高度 |
| `autosize` | boolean | 无 | 高度根据内容自动撑开（rows 为最小高度），隐藏拖拽手柄；输入/程序改值/外部改字号均自动重算 |
| `default-value` | string | 无 | 初始值（标签属性，attached 时读取一次写入运行时 value） |
| `value` | —（非属性） | — | 运行时输入值：JS 读写用 `el.value`（DOM property，已反射到内部 textarea）；不是标签属性，`setAttribute("value")` 无效 |
| `placeholder` | string | 无 | 占位文本，转发给内部 textarea |
| `color` | M3 角色名 / 自定义变量名 | 无 | 语义色：控制 caret 颜色与 focus 描边/底线色（如 `color="error"` 用于校验错误态） |
| `disabled` | boolean | 无 | 禁用：0.38 透明度、阻断交互、无 focus 态 |
| `readonly` | boolean | 无 | 只读：可聚焦、不可修改 |

设置/取消布尔属性示例：`<st-textarea disabled>`；JS 中请用 attribute 方式（直接改 property 不触发更新）：

```js
ta.setAttribute("disabled", "");
ta.removeAttribute("disabled");
```

## 事件

`input` / `change` 事件天然穿透 shadow DOM，直接在 `<st-textarea>` 上监听，`el.value` 已同步为最新值：

```js
document.querySelector("st-textarea").addEventListener("input", (e) => {
  console.log(e.target.value);
});
```

## 方法

- `el.focus()` / `el.blur()`：聚焦/失焦内部 textarea

## color 属性（与 color 模块联动）

`color` 接受 **M3 角色名**（`primary` / `error` / `success` 等）或 **color 工具里定义的自定义变量名**，控制 caret 与 focus 描边/底线颜色。典型用法是校验错误态：

```html
<st-textarea color="error" placeholder="请输入内容"></st-textarea>
```

未定义的名称回退到 primary。不设 `color` 时 focus 描边/底线/caret 为 primary。

## 外观定制：直接写原生 CSS 属性

**没有预设，也不需要变量**。尺寸、圆角、字体、配色全部用标准 CSS 属性表达。尺寸类默认值全部用 em——**改 `font-size` 即可整体等比缩放**：

```html
<st-textarea style="font-size: 12px;" placeholder="Scale 12px"></st-textarea>

<!-- 宽度：min-width 默认 16.429em，用 width 覆盖 -->
<st-textarea style="width: 100%;"></st-textarea>

<!-- 行数：rows 属性 -->
<st-textarea rows="6"></st-textarea>

<!-- 根据内容自动撑开高度（rows 为最小高度） -->
<st-textarea autosize rows="2" placeholder="输入换行试试"></st-textarea>
```

### 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| `min-width` | `16.429em`（= 230px @ 14px 字号） |
| `padding` | `0.857em 1em`（= 12px 14px） |
| `border-radius` | `0.5em`（= 7px；filled 变体仅上两角 `0.5em 0.5em 0 0`） |
| `font-size` | `14px`；行高 `1.7` |
| `border` | outlined: `1px solid outline` / filled: 透明 + 底边 `1px solid on-surface-variant` |
| `background` | outlined: 透明 / filled: `surface-container-highest` |
| `color`（文字） | `on-surface`；placeholder: `on-surface-variant` |

### 内建行为（不需要写、也覆盖不掉的）

- focus 动画（绝对定位浮层呈现，不挤占布局）：
  - outlined：1px 边框外侧叠加 2px primary 描边浮层，150ms 淡入，失焦淡出（视觉 = 边框加粗到 2px，但不引起内容位移）
  - filled：底边框上叠加 2px 线，从左到右展开（200ms，M3 emphasized 曲线），失焦缩回
  - `color` 属性时描边/底线/caret 换为对应角色色
- 高度：由 `rows`、`autosize`（内容撑开）或直接 `style="height: ..."` 决定；拖拽手柄默认关闭（`resize: none`）
- disabled：0.38 透明度、`not-allowed` 光标、阻断聚焦、无 focus 动画

## 主题

`st-init.js` 注入的颜色体系默认跟随系统深浅色；强制指定：`<html class="st-light">` 或 `<html class="st-dark">`。

## 验证页面

`index.html` 为打开即看的完整示例，可作视觉验收用（直接访问 `/packages/textarea/`）。
