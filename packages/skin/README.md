# st-skin — 皮肤系统（材质层）

Senti-UI 的组件只负责**语义与行为**（标签、属性、事件、键盘、运行时状态），
视觉中的“材质”部分由皮肤决定：圆角、密度、边框、阴影、毛玻璃、焦点环、动效、波纹。

**颜色不参与换肤**：所有皮肤都消费同一套 M3 角色变量（`--md-sys-color-*`），
种子色、error、success、深浅色主题永远保持一致。皮肤改的是“同样颜色被呈现成什么材质”，
不是“换成另一套配色”。

已接入皮肤：全部交互与表面组件——`st-button` / `st-button-group` / `st-split-button` / `st-icon-button` / `st-input` / `st-textarea` / `st-select` / `st-card` / `st-dialog` / `st-menu` / `st-list` / `st-checkbox` / `st-switch` / `st-radio` / `st-slider` / `st-progress` / `st-tabs` / `st-navigation` / `st-tooltip` / `st-snackbar` / `st-badges`。未加载皮肤时每个 token 都回退到组件原有默认值。

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
  setSkin("windows");
</script>
```

内置皮肤：
- `m3`：Material Design 3 默认材质
- `apple`：半透明毛玻璃 + 连续圆角
- `windows`：Windows 11 / Fluent——4px 控件、8px 表面、Segoe UI、Mica 表面与 Acrylic 浮层
- `shadcn`：6px 扁平细描边
- `cyberpunk`：零圆角、等宽字、霓虹描边与外发光、方形开关/滑块拇指、CRT 扫描线；建议配深色主题和霓虹种子色

`windows` 的材质分工：常驻表面（卡片 / 对话框 / 输入框）用 Mica——高不透明度的着色底，不预先模糊正文；菜单 / 下拉 / 气泡等浮层用 Acrylic——半透明底 + `blur(30px)`。控件圆角 4px、表面圆角 8px，图标按钮是 4px 方形而不是圆形。

`cyberpunk` 的霓虹来自 M3 角色：描边与外发光全部用 `color-mix(primary …)` 组合，所以 `color="error"`、换种子色、深浅色切换都会跟着变。皮肤本身不提供“深色”或“洋红”，那属于配色和主题模式（`setThemeMode("dark")` + 种子色）。

官网的皮肤页把“材质”当成完整主题：每套材质带官方配色（M3 蓝 `#0061A4` / Apple iOS 蓝 `#007AFF` / Windows 蓝 `#0078D4` / shadcn zinc `#18181B` / Cyberpunk 洋红 `#FF2E97` + 青 `#00E5FF`），由页面层的 `site/theme-presets.js` 在切换时一起套用，并按材质把颜色与深浅模式存进 `st-theme-palettes`，切回来时恢复。卡片里的官方配色预览是局部 CSS 变量，不影响全站。包内的 `setSkin("cyberpunk")` 仍然只换材质。

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

**焦点材质不要在自己的复合 token 里引用 `--st-accent`**：`--st-accent` 是组件按 `color` 属性写在宿主上的，
而皮肤 token 在 `<html data-skin>` 上声明时就会解析 `var()`，拿到的永远是空值（见 CONTEXT 坑 #59）。
皮肤只提供上面这些几何 / 透明度 token，颜色由组件在 `:host` 规则里用 `var(--st-accent)` 组合，
这样 `color="error"` 在 M3 / Apple / Windows / shadcn 下都会变成对应语义色。

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

### 通用形状

| Token | M3 默认 | 说明 |
|-------|---------|------|
| `--st-radius-xs` | `0.286em` | 小圆角（徽标 / 选项 / 提示气泡） |
| `--st-radius-sm` | `0.5em` | 中圆角（列表项 / 字段） |
| `--st-radius-md` | `0.857em` | 表面圆角（卡片 / 菜单） |
| `--st-radius-lg` | `1.143em` | 大表面圆角 |
| `--st-radius-xl` | `1.714em` | 对话框圆角 |
| `--st-radius-pill` | `999px` | 胶囊 |

### 浮层与表面

| Token | M3 默认 | 说明 |
|-------|---------|------|
| `--st-dialog-bg` / `--st-dialog-border` | `surface-container-high` / `transparent` | 对话框面板 |
| `--st-dialog-shadow` | `var(--st-shadow-4)` | 对话框阴影 |
| `--st-dialog-backdrop-filter` / `--st-dialog-scrim` | `blur(2px)` / `rgb(0 0 0 / .28)` | 面板毛玻璃 / 遮罩 |
| `--st-menu-bg` / `--st-menu-border` | `surface-container` / `transparent` | 菜单与 split-button 面板 |
| `--st-menu-shadow` / `--st-menu-backdrop-filter` | `var(--st-shadow-3)` / `none` | 菜单材质 |
| `--st-card-bg` / `--st-card-border` | `surface-container-low` / `transparent` | 卡片（filled/outlined 另有 `--st-card-filled-bg` / `--st-card-outlined-bg`） |
| `--st-card-outline` | `outline-variant` | outlined 卡片描边 |
| `--st-card-shadow` / `--st-card-shadow-hover` | `var(--st-shadow-1/2)` | 卡片默认 / hover |
| `--st-select-popup-bg` / `--st-select-popup-border` | `surface-container` / `transparent` | 下拉弹层 |
| `--st-snackbar-surface` / `--st-snackbar-on-surface` | `secondary` / `on-secondary` | 消息条默认底/字（`color` 属性仍优先） |
| `--st-tooltip-bg` | `inverse-surface` | 提示气泡底 |
| `--st-nav-bar-bg` | `surface-container` | 导航栏底 |

### 阴影

| Token | M3 默认 | 说明 |
|-------|---------|------|
| `--st-shadow-1` | `0 0.107em 0.286em rgb(0 0 0 / .3)` | 卡片默认 / 轻浮层 |
| `--st-shadow-2` | `0 0.143em 0.5em rgb(0 0 0 / .25), …` | 卡片 hover |
| `--st-shadow-3` | `0 0.071em 0.143em rgb(0 0 0 / .3), …` | 菜单 / 下拉 |
| `--st-shadow-4` | `0 1em 2.857em -0.714em rgb(0 0 0 / .3)` | 对话框 |
| `--st-shadow-overlay` | `0 0.2em 0.8em rgb(0 0 0 / .2)` | 下拉弹层 |
| `--st-shadow-thumb` | `0 0.071em 0.214em rgb(0 0 0 / .25)` | 开关/滑块拇指 |

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
| `--st-field-focus-shadow` | `0 0 0 0 transparent` | 输入框聚焦时叠加的中性皮肤阴影（不要再把 `--st-accent` 写进这个 token，见下方说明） |
| `--st-field-focus-color` | `var(--md-sys-color-primary)` | 没有 `color` 属性时的默认焦点色（shadcn 用 `on-surface`；设置 `color` 后仍以语义角色色优先） |
| `--st-field-focus-gap` / `--st-field-focus-gap-color` | `0px` / `transparent` | 焦点色环与控件之间的间隙 |
| `--st-field-focus-glow-spread` / `--st-field-focus-glow-alpha` | `0px` / `0%` | 焦点外发光半径 / 透明度，颜色由组件消费 `--st-accent` |
| `--st-field-focus-underline-height` / `--st-field-focus-underline-alpha` | `0px` / `100%` | 焦点底线高度 / 透明度，颜色由组件消费 `--st-accent` |
| `--st-field-underline-color` | 回退到语义色 | filled 输入框聚焦底线颜色（设为 `transparent` 可关闭） |
| `--st-state-hover` | `0.08` | hover state layer 透明度 |
| `--st-state-press` | `0.12` | active state layer 透明度 |
| `--st-disabled-opacity` | `0.38` | disabled 透明度 |
| `--st-ripple-opacity` | `0.28` | 波纹透明度（`0` = 关闭波纹） |
| `--st-motion-duration` | `150ms` | 焦点/材质过渡时长 |
| `--st-motion-duration-fast` | `120ms` | 快速反馈 |
| `--st-motion-duration-base` | `200ms` | 常规过渡 |
| `--st-motion-duration-slow` | `300ms` | 指示器/折叠 |
| `--st-motion-easing` | `cubic-bezier(0.2,0,0,1)` | 标准缓动 |
| `--st-focus-ring-style` | `solid` | 焦点环线型 |
| `--st-overlay-enter-duration` / `--st-overlay-exit-duration` | `200ms` / `150ms` | 菜单/下拉开合 |
| `--st-dialog-enter-duration` / `--st-dialog-exit-duration` / `--st-dialog-scrim-duration` | `300ms` / `200ms` / `250ms` | 对话框与遮罩开合 |
| `--st-dialog-scrim-filter` | `blur(2px)` | 遮罩毛玻璃 |
| `--st-tooltip-duration` | `150ms` | 提示入场 |
| `--st-ripple-duration` | `350ms` | 波纹扩散 |

### 密度与组件材质

| Token | M3 默认 | 说明 |
|-------|---------|------|
| `--st-dialog-padding` / `--st-dialog-gap` | `1.43em` / `1.14em` | 对话框内边距/区块间距 |
| `--st-card-padding` | `1em` | 卡片内边距 |
| `--st-menu-padding` / `--st-menu-item-padding` | `0.286em` / `0.714em 0.857em` | 菜单/菜单项 |
| `--st-menu-item-radius` | `0.571em` | 菜单项圆角 |
| `--st-select-popup-radius` / `--st-select-option-radius` | `0.5em` / `0.357em` | 下拉/选项圆角 |
| `--st-snackbar-padding` / `--st-snackbar-radius` / `--st-snackbar-shadow` | `0.571em 1em` / `0.286em` / … | 消息条 |
| `--st-tooltip-padding` / `--st-tooltip-radius` / `--st-tooltip-shadow` | `0.357em 0.643em` / `0.286em` / `none` | 提示 |
| `--st-textarea-padding` | `0.857em 1em` | 多行输入内边距 |
| `--st-list-gap` / `--st-list-item-radius` / `--st-list-item-height` / `--st-list-item-padding` | `0.143em` / `0.5em` / `3em` / `0.5em 1em` | 列表 |
| `--st-checkbox-radius` / `--st-checkbox-border-width` | `0.286em` / `0.143em` | 复选框 |
| `--st-checkbox-fill-alpha` / `--st-checkbox-backdrop-filter` | `100%` / `none` | 选中态填充透明度 / 毛玻璃（Apple 下为半透明） |
| `--st-switch-radius` / `--st-switch-border-width` / `--st-switch-thumb-shadow` | `2.286em` / `0.143em` / … | 开关 |
| `--st-switch-fill-alpha` / `--st-switch-backdrop-filter` | `100%` / `none` | 选中轨道填充透明度 / 毛玻璃（Apple 下为半透明） |
| `--st-nav-gap` / `--st-nav-gap-vertical` / `--st-nav-padding-vertical` | `0.286em` / `0.143em` / `0.286em` | 导航间距 |
| `--st-radio-radius` / `--st-radio-border-width` | `50%` / `0.143em` | 单选 |
| `--st-radio-fill-alpha` / `--st-radio-backdrop-filter` | `100%` / `none` | 选中圆点填充透明度 / 毛玻璃 |
| `--st-icon-radius` | `50%` | 图标按钮 |
| `--st-split-min-width` / `--st-split-padding` | `9.5em` / `0 1.714em` | split-button 最小宽度 / 主区内边距 |
| `--st-slider-track-radius` / `--st-slider-thumb-radius` / `--st-slider-tip-radius` / `--st-slider-thumb-shadow` | `0.286em` / `50%` / `0.286em` / `none` | 滑块 |
| `--st-slider-fill-alpha` / `--st-slider-backdrop-filter` | `100%` / `none` | 激活轨道 / 拇指填充透明度与毛玻璃（气泡保持实色） |
| `--st-progress-size` / `--st-progress-thickness` / `--st-progress-radius` / `--st-progress-duration` | `2.857em` / `0.286em` / `0.286em` / `0.3s` | 进度 |
| `--st-tab-height` / `--st-tab-layer-radius` / `--st-tabs-indicator-height` / `--st-tabs-indicator-radius` / `--st-tabs-border` | `3.429em` / `0.571em` / `0.143em` / `0` / `outline-variant` | 标签栏 |
| `--st-nav-pill-radius` / `--st-nav-bar-bg` / `--st-nav-item-padding` / `--st-nav-gap` | `2em` / `surface-container` / `0.857em 1em` / `0.286em` | 导航栏 |
| `--st-badge-radius` / `--st-badge-font-size` / `--st-badge-shadow` | `1.429em` / `0.786em` / `none` | 徽标 |

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
| `st-dialog` | `panel` | 对话框面板 |

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

## 用“主题预设”打包材质与配色（含对比度）

皮肤文件只改材质；颜色配置（种子色 / 角色覆盖 / 自定义变量 / 对比度）属于主题。想让一套材质固定搭配一套“更冲”的配色时，不要写进皮肤 CSS，而是把两者一起作为**主题预设**切换：

```js
import { applyTheme } from "/packages/color/m3-theme.js";
import { setThemeMode } from "/packages/color/st-theme-mode.js";
import { setSkin } from "/packages/skin/st-skin.js";

setSkin("cyberpunk");
setThemeMode("dark");
applyTheme("#FF2E97", { tertiary: "#00E5FF" }, {}, {
  // 对比度 0–1：加深提纯角色色、压暗/提亮表面、拉开 on-* 与描边
  contrast: 1,
});
```

`contrast` 是颜色体系的能力（详见 [../color/README.md](../color/README.md)），不是皮肤 token：霓虹 / 游戏类材质靠它得到近黑表面、更纯的角色色与更亮的描边，而不必另造一套颜色变量。官网 `site/theme-presets.js` 的 Cyberpunk 就是“材质 + 配色 + 模式”的打包：Cyberpunk 默认 `contrast: 1`，其余材质默认 `0`；**切换材质时对比度回到该主题的默认值**，不跨材质记忆（种子色 / 角色覆盖仍按材质槽位记忆）。

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
