# st-select 单选下拉框组件

基于 ofa.js 的单选下拉框组件。语义由属性表达，外观直接用**原生 CSS 属性**定制（没有 size 类预设，也不需要自定义 CSS 变量）。

组件的视觉样式全部定义在宿主元素（`:host`）上。选项写在 light DOM 的原生 `<option>` 元素里（只作数据源，不参与渲染），组件读取后自绘 M3 风格下拉列表。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/select/select.html"></l-m>
```

组件内部已 `import "../color/st-color-init.js"`，加载时自动注入 `--md-sys-color-*` 颜色体系（多次 import 不冲突）；若你的部署不含 color 包，则需自行定义这些变量。

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `"outlined" \| "filled"` | `"outlined"` | M3 规范的两种类型（outlined 有全边框；filled 容器底色 + 底边线） |
| `default-value` | string | 无 | 初始选中项的 value（标签属性，attached 时读取一次写入运行时 value） |
| `value` | —（非属性） | — | 运行时选中值：JS 读写用 `el.value`（DOM property）；不是标签属性，`setAttribute("value")` 无效 |
| `placeholder` | string | 无 | 未选中时显示的占位文本 |
| `color` | M3 角色名 / 自定义变量名 | 无 | 语义色：控制 focus 描边/底线色（如 `color="error"` 用于校验错误态） |
| `disabled` | boolean | 无 | 禁用：0.38 透明度、阻断交互、关闭弹层 |

选项写法（`value` 缺省时取文本）：

```html
<st-select placeholder="请选择">
  <option value="apple">苹果</option>
  <option value="banana">香蕉</option>
  <option value="cherry">樱桃</option>
</st-select>
```

**富内容选项**：`<option>` 内可以嵌套自定义元素/HTML，子节点会被克隆渲染到下拉项中（闭合状态显示 option 的纯文本）：

```html
<st-select placeholder="选择水果">
  <option value="apple"><span style="margin-right:8px;">🍎</span><b>苹果</b> Apple</option>
  <option value="banana"><span style="margin-right:8px;">🍌</span><b>香蕉</b> Banana</option>
</st-select>
```

**动态选项**：三种方式任选——`el.options = [...]`、`:options` 数据绑定，或 **o-fill 嵌套**（组件会深入容器内部收集渲染出的 `<option>`，并用 MutationObserver 跟随数据重渲染自动更新列表）：

```html
<!-- 方式一：:options 数据绑定（数组 [{ value, label }]，ofa 页面内） -->
<st-select :options="cities" placeholder="请选择城市"></st-select>

<!-- 方式二：o-fill 嵌套（数据变化自动跟随） -->
<st-select placeholder="请选择城市">
  <o-fill :value="cityOpts">
    <option attr:value="$data.value">{{$data.label}}</option>
  </o-fill>
</st-select>
```

```js
// 方式三：纯 JS
sel.options = [{ value: "bj", label: "北京" }, { value: "sh", label: "上海" }];
```

JS 中修改状态请用 attribute（布尔）与 property（值）方式：

```js
sel.value = "banana"; // 运行时改选中值（不派发 change）
sel.setAttribute("disabled", "");
```

## 事件

- `change`：选中项变化（用户交互）时派发，`bubbles` + `composed`，直接在 `<st-select>` 上监听，`el.value` 已更新：

```js
document.querySelector("st-select").addEventListener("change", (e) => {
  console.log(e.target.value);
});
```

## 方法

- `el.focus()` / `el.blur()`：聚焦/失焦

## 键盘交互

| 按键 | 行为 |
|------|------|
| `Enter` / `Space` | 打开列表；再按选中键盘激活项 |
| `↑` / `↓` | 打开列表并循环移动激活项（自动滚动到可见） |
| `Home` / `End` | 跳到第一项 / 最后一项 |
| `Escape` / `Tab` | 关闭列表 |
| 鼠标 | 点击选项直接选中；点击组件外部关闭 |

## color 属性（与 color 模块联动）

`color` 接受 **M3 角色名**（`primary` / `error` / `success` 等）或 **color 工具里定义的自定义变量名**，控制 focus 描边/底线颜色。典型用法是校验错误态：

```html
<st-select color="error" placeholder="必选项"></st-select>
```

未定义的名称回退到 primary。不设 `color` 时 focus 描边/底线为 primary。

## 外观定制：直接写原生 CSS 属性

**没有预设，也不需要变量**。尺寸、圆角、字体、配色全部用标准 CSS 属性表达。尺寸类默认值全部用 em——**改 `font-size` 即可整体等比缩放**：

```html
<st-select style="font-size: 12px;">...</st-select>

<!-- 宽度：min-width 默认 13.571em，用 width 覆盖 -->
<st-select style="width: 240px;">...</st-select>
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
| `color`（文字） | `on-surface`；placeholder: `on-surface-variant`；下拉项选中: `on-secondary-container` |
| `gap`（文字与箭头间距） | `0.571em`（= 8px） |

### 内建行为（不需要写、也覆盖不掉的）

- focus 动画（绝对定位浮层，不挤占布局）：
  - outlined：1px 边框外侧叠加 2px primary 描边浮层，150ms 淡入，失焦淡出
  - filled：底边框上叠加 2px 线，从左到右展开（200ms，M3 emphasized 曲线）
  - `color` 属性时描边/底线换为对应角色色
- 下拉箭头：CSS chevron，展开时旋转 180°（200ms）
- **弹层方向自适应**：打开时按视口剩余空间判定——下方放不下且上方更宽裕时自动向上弹（drop-up）
- **开合动画**（同 st-menu）：缩放淡入 0.2s（M3 emphasized），关闭先播 150ms 退出过渡再隐藏
- 弹层：`surface-container` 底色 + 阴影 + 圆角，选中项 `secondary-container` 底色 + 对勾，键盘激活项 `surface-container-high` 高亮；最高 `15em` 内滚动
- disabled：0.38 透明度、`not-allowed` 光标、阻断聚焦与展开

**注意**：下拉弹层渲染在组件 shadow 内（绝对定位于宿主下方），若组件被 `overflow: hidden` 的祖先裁剪，弹层会被截断——该场景请确保祖先可溢出或调整布局。

## 主题

`st-color-init.js` 注入的颜色体系默认跟随系统深浅色；强制指定：`<html class="st-light">` 或 `<html class="st-dark">`。

## 注意事项与使用技巧

- `value` 是运行时状态：`el.value = "x"` 改选中（不派发 change）；初始选中用 `default-value`
- 下拉弹层渲染在组件 shadow 内（绝对定位），被 `overflow: hidden` 祖先裁剪时会截断——该场景调整布局
- 动态选项三种方式：`el.options = [...]`、`:options` 绑定、o-fill 嵌套（组件会深入容器收集渲染出的 option）
- 键盘全支持：Enter/Space 打开、↑↓ 循环移动、Home/End、Escape/Tab 关闭
- 判断"点击组件外部"必须用 `e.composedPath().includes(ele)`（composed 事件 target 在 document 层已被重定向）
- 弹层仍挂在 shadow 内（absolute 定位），被 overflow 祖先裁剪时会截断；翻转只解决上下方向，不解决裁剪
## 验证页面

`index.html` 为打开即看的完整示例，可作视觉验收用（直接访问 `/packages/select/`）。
