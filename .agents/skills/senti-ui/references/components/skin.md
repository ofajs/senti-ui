# 皮肤系统 st-skin（材质层）

组件只负责语义与行为，**材质**由皮肤决定：圆角、密度、边框、阴影、毛玻璃、焦点环、动效、波纹。
**颜色不参与换肤**：所有皮肤消费同一套 M3 角色变量（`--md-sys-color-*`），种子色 / error / success / 深浅色主题永远一致。

已接入皮肤：全部交互与表面组件（button/input/textarea/select/card/dialog/menu/list/checkbox/switch/radio/slider/progress/tabs/nav/tooltip/snackbar/badges）。未加载皮肤时所有 token 回退到组件原默认值。

## 使用

方式 A：静态指定（首帧即目标皮肤，无闪切）：

```html
<html data-skin="apple">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/skin/apple.css">
```

方式 B：运行时切换（持久化 + 跨窗口同步）：

```html
<script type="module">
  import { setSkin } from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/skin/st-skin.js";
  setSkin("shadcn"); // "m3" | "apple" | "shadcn" | 自定义注册的皮肤
</script>
```

内置皮肤：`m3`（默认）、`apple`（毛玻璃）、`shadcn`（扁平细描边）。

## API（https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/skin/st-skin.js）

| 导出 | 说明 |
|------|------|
| `setSkin(name)` | 切换并持久化（localStorage 键 `st-skin`），返回最终皮肤名 |
| `getSkin()` | 当前皮肤名（localStorage → `<html data-skin>` → `m3`） |
| `applySkin(name)` | 只应用、不持久化 |
| `registerSkin(name, href)` | 注册自定义皮肤 CSS（相对当前页或绝对地址），已选中时立即生效 |

## 皮肤写法

皮肤文件**只声明 CSS 变量**，不写 `st-button { ... }` 宿主选择器：

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

原因：组件常位于 `o-page` / `o-app` 的 shadow 内，**文档树选择器与 `::part()` 都跨不进去**，
CSS 变量可以继承穿透。所有规则写在 `[data-skin="名称"]` 下，多套皮肤可同时加载、互不污染。

## Token 一览

### 尺寸与字体
| Token | 默认 | 说明 |
|-------|------|------|
| `--st-height` | `2.857em` | 控件高度（随 font-size 缩放） |
| `--st-font-size` | `14px` | 字号 |
| `--st-font` | `inherit` | 字体栈 |
| `--st-letter-spacing` | `normal` | 字距 |
| `--st-control-radius` | `1.429em` | 按钮类圆角 |
| `--st-field-radius` | `0.5em` | 输入类圆角 |
| `--st-control-padding` | `0 1.429em` | 按钮类内边距 |
| `--st-field-padding` | `0 1em` | 输入类内边距 |
| `--st-border-width` | `1px` | 描边宽度 |

### 表面
| Token | 默认 | 说明 |
|-------|------|------|
| `--st-outlined-bg` | `transparent` | outlined 按钮背景 |
| `--st-outlined-border` | `outline` 角色 | outlined 按钮描边 |
| `--st-field-bg` | `transparent` | 输入框背景 |
| `--st-field-filled-bg` | `surface-container-highest` | filled 输入框背景 |
| `--st-field-border` | `outline` 角色 | 输入框描边 |
| `--st-field-underline` | `on-surface-variant` | filled 输入框底边线 |
| `--st-fill-alpha` | `100%` | filled 按钮语义色不透明度 |

### 材质
| Token | 默认 | 说明 |
|-------|------|------|
| `--st-shadow` | `none` | 按钮投影 |
| `--st-field-shadow` | `none` | 输入框投影 |
| `--st-backdrop-filter` | `none` | 毛玻璃滤镜 |
| `--st-sheen` | `none` | 表面高光（background-image） |

### 焦点、状态与动效
| Token | 默认 | 说明 |
|-------|------|------|
| `--st-focus-ring-width` | `2px` | 按钮焦点环宽度 |
| `--st-focus-ring-offset` | `2px` | 按钮焦点环偏移 |
| `--st-focus-ring-color` | `on-surface` | 按钮焦点环颜色 |
| `--st-field-focus-ring-opacity` | `1` | 输入框内嵌焦点环透明度（0 = 用外侧光圈） |
| `--st-field-focus-shadow` | 回退 `--st-field-shadow` | 输入框聚焦外侧光圈 |
| `--st-field-underline-color` | 回退语义色 | filled 输入框聚焦底线（transparent = 关闭） |
| `--st-state-hover` | `0.08` | hover state layer |
| `--st-state-press` | `0.12` | active state layer |
| `--st-disabled-opacity` | `0.38` | disabled 透明度 |
| `--st-ripple-opacity` | `0.28` | 波纹透明度（0 = 关闭） |
| `--st-motion-duration` | `150ms` | 过渡时长 |

### 全组件材质 token（新增）

- 形状：`--st-radius-xs/sm/md/lg/xl/pill`
- 阴影：`--st-shadow-1/2/3/4`、`--st-shadow-overlay`、`--st-shadow-thumb`
- 浮层：`--st-dialog-bg/border/shadow/backdrop-filter/scrim`、`--st-menu-bg/border/shadow/backdrop-filter`、`--st-card-bg/border/shadow/shadow-hover`、`--st-select-popup-bg/border/backdrop-filter`、`--st-snackbar-surface/on-surface`、`--st-tooltip-bg`、`--st-nav-bar-bg`
- 密度：`--st-dialog-padding/gap`、`--st-card-padding`、`--st-menu-padding/menu-item-padding`、`--st-list-item-height/padding`、`--st-snackbar-padding`、`--st-tooltip-padding`、`--st-textarea-padding`、`--st-tab-height`、`--st-nav-item-padding`
- 动效：`--st-motion-duration-fast/base/slow`、`--st-motion-easing`、`--st-overlay-enter/exit-duration`、`--st-dialog-enter/exit-duration`、`--st-tooltip-duration`、`--st-ripple-duration`
- 组件形状：`--st-icon-radius`、`--st-checkbox-radius`、`--st-switch-radius`、`--st-radio-radius`、`--st-slider-track/thumb/tip-radius`、`--st-progress-size/thickness/radius`、`--st-tabs-indicator-*`、`--st-nav-pill-radius`、`--st-badge-radius`

### 颜色（组件写入，皮肤不要覆盖）
`--st-accent` / `--st-on-accent`：`color` 属性在宿主上内联写为对应 M3 角色，皮肤只消费。

## 暴露的 part（仅 light DOM 可用）

| 组件 | part |
|------|------|
| `st-button` | `state-layer` / `loader` / `control` |
| `st-input` | `focus-ring` / `underline` / `control` |

组件位于 `o-page` / `o-app` shadow 内时 part 不可达，跨 shadow 请用 token。

## 注意事项

- 颜色是身份，材质是衣服：皮肤不得引入第二套配色；`color="error"` / `success` / 自定义变量在所有皮肤下保持语义
- 皮肤规则**不要用 `@layer`**（会输给 shadow 内未分层的 `:host`，宿主级覆盖静默失效）
- 祖先声明 `--a: var(--b)` 不会跟随子元素的内联覆盖（自定义属性在声明处解析），需要跟随语义色时用数值 token 或组件端组合
- 切换皮肤是异步的：`setSkin()` 后 CSS 还要加载；已知固定皮肤用静态 `<link>` + `data-skin` 避免闪切
- 皮肤不改变结构与交互范式（浮动标签、指示器布局等归组件/variant 管）
