# st-input 单行输入框组件

基于 ofa.js 的单行输入框组件。语义由属性表达，外观直接用**原生 CSS 属性**定制（没有 size 类预设，也不需要自定义 CSS 变量）。

组件的视觉样式全部定义在宿主元素（`:host`）上，`st-input` 本身就是一个普通的可样式化元素。内部有一个透明的原生 `<input>` 负责语义（输入/键盘/焦点/disabled/readonly）。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/input/input.html"></l-m>
```

组件内部已 `import "../color/st-color-init.js"`，加载时自动注入 `--md-sys-color-*` 颜色体系（多次 import 不冲突）；若你的部署不含 color 包，则需自行定义这些变量。

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `"outlined" \| "filled"` | `"outlined"` | M3 规范的两种输入框类型（outlined 有全边框；filled 容器底色 + 底边线） |
| `default-value` | string | 无 | 初始值（标签属性，attached 时读取一次写入运行时 value） |
| `value` | —（非属性） | — | 运行时输入值：JS 读写用 `el.value`（DOM property，已反射到内部 input）；不是标签属性，`setAttribute("value")` 无效 |
| `placeholder` | string | 无 | 占位文本，转发给内部 input |
| `type` | `"text" \| "password" \| ...` | `"text"` | 原生 input 类型 |
| `color` | M3 角色名 / 自定义变量名 | 无 | 语义色：控制 caret 颜色与 focus 边框色（如 `color="error"` 用于校验错误态） |
| `disabled` | boolean | 无 | 禁用：0.38 透明度、阻断交互、无 focus 态 |
| `readonly` | boolean | 无 | 只读：可聚焦、不可修改 |

设置/取消布尔属性示例：`<st-input disabled>`；JS 中请用 attribute 方式（直接改 property 不触发更新）。改值用 `el.value = "..."`：

```js
input.setAttribute("disabled", "");
input.removeAttribute("disabled");
input.value = "新的值"; // 运行时读写值
```

## 插槽

- `prefix` / `suffix`：前置/后置图标等内容（默认 `on-surface-variant` 色）

```html
<st-input placeholder="搜索">
  <span slot="prefix">🔍</span>
  <span slot="suffix">⏎</span>
</st-input>
```

## 事件

`input` / `change` 事件天然穿透 shadow DOM，直接在 `<st-input>` 上监听，`el.value` 已同步为最新值：

```js
document.querySelector("st-input").addEventListener("input", (e) => {
  console.log(e.target.value);
});
```

## 方法

- `el.focus()` / `el.blur()`：聚焦/失焦内部 input

## color 属性（与 color 模块联动）

`color` 接受 **M3 角色名**（`primary` / `error` / `success` 等）或 **color 工具里定义的自定义变量名**，控制 caret 与 focus 边框颜色。典型用法是校验错误态：

```html
<st-input color="error" value="非法输入"></st-input>
```

未定义的名称回退到 primary。不设 `color` 时 focus 边框/caret 为 primary。

## 外观定制：直接写原生 CSS 属性

**没有预设，也不需要变量**。尺寸、圆角、字体、配色全部用标准 CSS 属性表达。尺寸类默认值全部用 em——**改 `font-size` 即可整体等比缩放**：

```html
<st-input style="font-size: 12px;" placeholder="Scale 12px"></st-input>
<st-input style="font-size: 16px;" placeholder="Scale 16px"></st-input>

<!-- 宽度：min-width 默认 13.571em，用 width 覆盖 -->
<st-input style="width: 320px;"></st-input>

<!-- pill 圆角 -->
<st-input variant="filled" style="border-radius: 999px; border-bottom: 1px solid var(--md-sys-color-on-surface-variant);"></st-input>
```

### 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| `height` | `2.857em`（= 40px @ 14px 字号，M3 标准） |
| `min-width` | `13.571em`（= 190px，M3 最小填充宽度） |
| `padding` | `0 1em`（= 14px） |
| `border-radius` | `0.5em`（= 7px；filled 变体仅上两角 `0.5em 0.5em 0 0`） |
| `font-size` | `14px` |
| `border` | outlined: `1px solid outline` / filled: 透明 + 底边 `1px solid on-surface-variant` |
| `background` | outlined: 透明 / filled: `surface-container-highest` |
| `color`（文字） | `on-surface`；placeholder: `on-surface-variant` |
| `gap`（内容与前后缀间距） | `0.571em`（= 8px） |

### 内建行为（不需要写、也覆盖不掉的）

- focus 动画（绝对定位浮层呈现，不挤占布局）：
  - outlined：1px 边框外侧叠加 2px primary 描边浮层，150ms 淡入，失焦淡出（视觉 = 边框加粗到 2px，但不引起内容位移）
  - filled：底边框上叠加 2px 线，从左到右展开（200ms，M3 emphasized 曲线），失焦缩回
  - `color` 属性时描边/底线/caret 换为对应角色色
- disabled：0.38 透明度、`not-allowed` 光标、阻断聚焦、无 focus 动画

## 主题

`st-color-init.js` 注入的颜色体系默认跟随系统深浅色；强制指定：`<html class="st-light">` 或 `<html class="st-dark">`。

## 注意事项与使用技巧

- `value` 是运行时状态（ofa data）：JS 读写用 `el.value`，`setAttribute("value")` 无效；初始值用标签属性 `default-value`
- `input`/`change` 事件都可直接在宿主监听（change 由组件转发为 composed——原生 change 穿不出 shadow）
- 事件回调里读 `e.target.value` 安全（value 已反射到宿主 property）
- 布尔属性 readonly 的 watch 同步是异步的，setAttribute 后稍等再断言
- 宿主本身不可聚焦（无 tabindex），焦点在内部 `.native` input 上；自动化测试用真实点击聚焦
## 验证页面

`index.html` 为打开即看的完整示例，可作视觉验收用（直接访问 `/packages/input/`）。
