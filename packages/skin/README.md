# st-skin — 皮肤系统（材质层）

Senti-UI 的组件只负责**语义与行为**（标签、属性、事件、键盘、运行时状态），
视觉中的“材质”部分由皮肤决定：圆角、密度、边框、阴影、毛玻璃、焦点环、动效、波纹。

**颜色不参与换肤**：所有皮肤都消费同一套 M3 角色变量（`--md-sys-color-*`），
种子色、error、success、深浅色主题永远保持一致。皮肤改的是“同样颜色被呈现成什么材质”，
不是“换成另一套配色”。

已接入皮肤：`st-button`、`st-input`。其余组件暂未 token 化，皮肤下保持 M3 外观。

## 依赖引入

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/button/button.html"></l-m>

<!-- 方式 A：静态指定皮肤（首帧即目标皮肤，无闪切） -->
<html data-skin="apple">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/skin/apple.css">

<!-- 方式 B：运行时切换（持久化 + 跨窗口同步） -->
<script type="module">
  import { setSkin, getSkin, registerSkin } from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/skin/st-skin.js";
  setSkin("shadcn");
</script>
```

内置皮肤：`m3`（默认）、`apple`（毛玻璃）、`shadcn`（扁平细描边）。

## API

| 导出 | 说明 |
|------|------|
| `setSkin(name)` | 切换皮肤并写入 localStorage（键 `st-skin`），返回最终皮肤名；同源其他窗口经 `storage` 事件自动跟随 |
| `getSkin()` | 当前皮肤名（localStorage → `<html data-skin>` → `m3`） |
| `applySkin(name)` | 只应用、不持久化 |
| `registerSkin(name, href)` | 注册自定义皮肤 CSS 地址（相对当前页或绝对地址）；已选中该皮肤时立即生效 |

`st-skin.js` 会在加载时自动应用已保存的皮肤（`applySkin(stored || data-skin || "m3")`），
并向 `<head>` 注入 `<link id="st-skin-css">`。切换皮肤时只改 `<html data-skin>` 和该 link 的 href。

## 皮肤规则

皮肤文件**只声明 CSS 变量**，不写 `st-button { ... }` 这类宿主选择器：

```css
[data-skin="my-skin"] {
  --st-height: 2.571em;
  --st-control-radius: 0.429em;
  --st-field-radius: 0.429em;
  --st-outlined-border: var(--md-sys-color-outline-variant);
  --st-shadow: 0 1px 2px rgb(0 0 0 / 0.05);
  --st-backdrop-filter: none;
  --st-ripple-opacity: 0;
}
```

原因：组件经常位于 `o-page` / `o-app` 的 shadow 内，**文档树的选择器跨不进 shadow**，
而 CSS 变量可以正常继承穿透。`::part()` 同样只能作用于同一棵树内的元素，
因此只作为 light DOM 场景的可选能力保留，换肤本身不依赖它。

所有规则都要写在 `[data-skin="名称"]` 作用域下：多套皮肤 CSS 可以同时加载、互不污染，
切换时只需要改 `<html data-skin>`。

## Token 一览（组件已消费）

### 尺寸与字体

| Token | M3 默认 | 说明 |
|-------|---------|------|
| `--st-height` | `2.857em` | 控件高度（em 随 `font-size` 缩放） |
| `--st-font-size` | `14px` | 字号；配合 em 尺寸整体缩放 |
| `--st-font` | `inherit` | 字体栈 |
| `--st-letter-spacing` | `normal` | 字距 |
| `--st-control-radius` | `1.429em` | 按钮类圆角 |
| `--st-field-radius` | `0.5em` | 输入类圆角 |
| `--st-control-padding` | `0 1.429em` | 按钮类内边距 |
| `--st-field-padding` | `0 1em` | 输入类内边距 |
| `--st-border-width` | `1px` | 描边宽度 |

### 表面

| Token | M3 默认 | 说明 |
|-------|---------|------|
| `--st-outlined-bg` | `transparent` | outlined 按钮背景 |
| `--st-outlined-border` | `var(--md-sys-color-outline)` | outlined 按钮描边 |
| `--st-field-bg` | `transparent` | 输入框背景 |
| `--st-field-filled-bg` | `var(--md-sys-color-surface-container-highest)` | filled 输入框背景 |
| `--st-field-border` | `var(--md-sys-color-outline)` | 输入框描边 |
| `--st-field-underline` | `var(--md-sys-color-on-surface-variant)` | filled 输入框底边线 |
| `--st-fill-alpha` | `100%` | filled 按钮语义色的不透明度（配合 `color-mix` 组合毛玻璃） |

### 材质

| Token | M3 默认 | 说明 |
|-------|---------|------|
| `--st-shadow` | `none` | 按钮投影 |
| `--st-field-shadow` | `none` | 输入框投影 |
| `--st-backdrop-filter` | `none` | 毛玻璃滤镜（如 `blur(18px) saturate(180%)`） |
| `--st-sheen` | `none` | 表面高光（`background-image`，如渐变） |

### 焦点、状态与动效

| Token | M3 默认 | 说明 |
|-------|---------|------|
| `--st-focus-ring-width` | `2px` | 按钮焦点环宽度 |
| `--st-focus-ring-offset` | `2px` | 按钮焦点环偏移 |
| `--st-focus-ring-color` | `var(--md-sys-color-on-surface)` | 按钮焦点环颜色 |
| `--st-field-focus-ring-opacity` | `1` | 输入框内嵌焦点环透明度（设为 `0` 可改用外侧光圈） |
| `--st-field-focus-shadow` | 回退到 `--st-field-shadow` | 输入框聚焦时的外侧光圈 |
| `--st-field-underline-color` | 回退到语义色 | filled 输入框聚焦底线颜色（设为 `transparent` 可关闭） |
| `--st-state-hover` | `0.08` | hover state layer 透明度 |
| `--st-state-press` | `0.12` | active state layer 透明度 |
| `--st-disabled-opacity` | `0.38` | disabled 透明度 |
| `--st-ripple-opacity` | `0.28` | 波纹透明度（`0` = 关闭波纹） |
| `--st-motion-duration` | `150ms` | 焦点/材质过渡时长 |

### 颜色（由组件写入，皮肤不要覆盖）

| Token | 说明 |
|-------|------|
| `--st-accent` | 语义主色。`color="error"` 时组件在宿主上内联写为 M3 error 角色，皮肤只消费不改写 |
| `--st-on-accent` | 语义主色上的前景色 |

组件源码里所有 token 都带旧默认值回退（如 `var(--st-height, 2.857em)`），
因此**不加载任何皮肤时，组件外观与 token 化之前完全一致**。

## 暴露的 part（可选）

| 组件 | part | 说明 |
|------|------|------|
| `st-button` | `state-layer` / `loader` / `control` | hover 叠层 / loading spinner / 内部原生 button |
| `st-input` | `focus-ring` / `underline` / `control` | 内嵌焦点环 / filled 底线 / 内部原生 input |

仅当组件位于 light DOM（不在 `o-page` 等 shadow 内）时，`::part()` 才可达；
跨 shadow 场景请使用 token。

## 自定义皮肤

1. 复制 `m3.css`，把作用域改成 `[data-skin="my-skin"]`。
2. 只写 token，颜色一律用 `--md-sys-color-*`（阴影/透明度可用黑色 alpha，属于材质）。
3. 注册并使用：

```js
import { registerSkin, setSkin } from "/packages/skin/st-skin.js";
registerSkin("my-skin", "/my-skin.css");
setSkin("my-skin");
```

4. 深浅色无需单独写：M3 角色变量本身已随主题切换；半透明表面用
   `color-mix(in srgb, var(--md-sys-color-surface) 58%, transparent)` 即可自动适配。

## 注意事项与使用技巧

- **颜色是身份，材质是衣服**：皮肤不得引入第二套配色。`color="error"` / `success` /
  自定义变量（`color="brand"`）在所有皮肤下都必须保持同一语义。
- **不要用 `@layer` 包皮肤规则**：实测分层声明会输给 shadow 内未分层的 `:host` 规则，
  宿主级覆盖（焦点环、阴影）会静默失效。皮肤只写 token 时不受此影响。
- **祖先声明 `--a: var(--b)` 不会跟随子元素覆盖**：自定义属性在声明元素处解析后继承，
  所以 `--st-fill: var(--st-accent)` 写在 `<html>` 上时，子元素内联 `--st-accent` 不会改变它。
  需要跟随语义色的组合请用数值 token（如 `--st-fill-alpha`）或在组件端组合。
- **切换皮肤是异步的**：`setSkin()` 改完 `data-skin` 后浏览器还要加载对应 CSS；
  已知固定皮肤时用静态 `<link>` + `<html data-skin>` 可避免首帧闪切。
- **新增组件接入皮肤**：视觉属性写成 `var(--st-xxx, 旧默认值)`；颜色仍走
  `--md-sys-color-*`；`color` 属性通过 `--st-accent` 传递；需要外部定制的内部元素加 `part`；
  在本文档补 token/part 行，并在验收页加皮肤下的展示。
- **皮肤不改变结构**：浮动标签、指示器布局等属于交互范式，归组件/variant 管，不归皮肤。
