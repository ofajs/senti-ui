# 主题与颜色（Material Design 3）

Senti-UI 全库**唯一颜色来源**：从种子色按 M3（HCT 色彩空间）规则生成完整的浅色/深色两套 token（`--md-sys-color-*` CSS 变量），由 `st-color-init.js` 动态注入。**任何场景都不要写死颜色值**——消费这些变量，深浅色模式零成本自动适配。

CDN 前缀：`https://cdn.jsdelivr.net/gh/ofajs/senti-ui`（下称 `{cdn}`）。

## 颜色体系从哪来

`{cdn}/packages/color/st-color-init.js` 读取 localStorage 中 color 工具保存的配置（key 为 `st-color-config`：`{ seed, overrides, customs }`），无配置时用默认种子色 `#0061A4`。所有 senti-ui 组件加载时自动 import 它，**正常使用无需手动引入**；要消除刷新闪色或独立使用时，在 `<head>` 内尽早引入一行（boot 会自动加载 st-color-init.js）：

```html
<script src="{cdn}/packages/boot/st-boot.js"></script>
```

**刷新闪色治理**：颜色由 JS 动态生成，模块加载前会闪一下。`st-boot.js`（经典同步脚本）在首帧前完成——有缓存（`st-color-init.js` 生成后存入 localStorage key `st-theme-css`，每次加载都重写）同步注入 `<style>` 零闪；无缓存则同步 `<link>` 静态兜底 `st-default.css`（默认种子色主题），`st-color-init.js` 随后按真实配置覆盖并写缓存。缓存 CSS 与静态兜底均含 `@media (prefers-color-scheme: dark) { html:not(.st-light) { color-scheme: dark; … } }` 深色跟随块（三条生成路径输出同一结构），深色系统下首帧即为深色、原生控件跟随。

## 可用颜色 token 完整清单

每套主题 32 个 token，浅色/深色同名自动换值。**变量名规则**：camelCase → kebab-case（`onPrimary` → `--md-sys-color-on-primary`）。下表省略 `--md-sys-color-` 前缀。

### 角色色（每个角色 4 个配对 token）

| 角色 | 角色色（底/前景） | 上面放文字 | 容器色（浅底） | 容器上文字 |
|------|------|------|------|------|
| primary 主色 | `primary` | `on-primary` | `primary-container` | `on-primary-container` |
| secondary 次色 | `secondary` | `on-secondary` | `secondary-container` | `on-secondary-container` |
| tertiary 三级色 | `tertiary` | `on-tertiary` | `tertiary-container` | `on-tertiary-container` |
| error 错误 | `error` | `on-error` | `error-container` | `on-error-container` |
| success 成功（内置扩展角色，默认绿，不随种子色变化） | `success` | `on-success` | `success-container` | `on-success-container` |

### 中性色（surface 系，页面与容器底色）

| token | 用途 |
|------|------|
| `surface` / `on-surface` | 页面底色 / 页面正文文字（最常用的一对） |
| `surface-variant` / `on-surface-variant` | 次级容器底（如输入框 outlined 底）/ 次级文字、placeholder、图标 |
| `surface-container-lowest` / `-low` / `-`（默认）/ `-high` / `-highest` | 容器底色五层梯度（浅色模式白→深，深色模式反向），卡片/弹层按层级选用 |
| `outline` / `outline-variant` | 边框线（粗）/ 分隔线（细） |
| `inverse-surface` / `inverse-on-surface` / `inverse-primary` | 反色（tooltip 气泡底 / 其上文字 / 深浅反转的 primary） |

## 文字与背景如何搭配（核心规则）

M3 的 token 天生成对，**永远用配对 token，不要自己调透明度或写死色值**：

1. **实底用 on-角色色放字**：`background: var(--md-sys-color-primary)` + `color: var(--md-sys-color-on-primary)`——on- 色按 HCT 对比度算法推导，任何种子色下对比度都达标
2. **浅容器底用 on-*-container 放字**：`primary-container` 底 + `on-primary-container` 字（tonal 风格：chip、选中态）
3. **中性底用 on-surface 系**：`surface` 底 + `on-surface` 字；`surface-container-*` 底配 `on-surface`（标题）/ `on-surface-variant`（次要文字）
4. **只用作前景时用角色色本身**：`color: var(--md-sys-color-error)` 放在 `surface` 底上（错误文字、描边）
5. **自定义变量同样四配对**：`--brand` / `--on-brand` / `--brand-container` / `--on-brand-container`，规则同上

组件的 `color` 属性已按上述规则自动配对（filled：角色色底 + on-角色色字；tonal：container 配对；outlined/text：角色色前景），优先用它而不是手写变量。

## 深色 / 浅色模式

- **默认跟随系统**（`prefers-color-scheme`），token 自动换值，同时 `color-scheme` 让原生控件跟随
- 强制：`<html class="st-light">` / `<html class="st-dark">`（优先级高于系统）
- 自定义 CSS 只要消费 `--md-sys-color-*`，深浅色自动适配——这就是"颜色只走 M3 角色"的原因

## 自定义配色（三种方式）

### 1. color 可视化工具（推荐）

打开 `{cdn}/packages/color/index.html`：改种子色、覆盖核心四角色 + success、添加自定义变量。配置存 localStorage，**同域**页面全部跟随（一键换色）。

### 2. 直接写 localStorage（JS 初始化，须在 st-color-init.js 执行前写入）

```js
localStorage.setItem("st-color-config", JSON.stringify({
  seed: "#0061A4",                    // 种子色
  overrides: { primary: "#B3261E" },  // 可选键：primary/secondary/tertiary/error/success
  customs: [{ name: "brand", color: "#FF0000" }],  // 自定义变量，name 自动 kebab-case
}));
```

### 3. JS API（`{cdn}/packages/color/m3-theme.js`，程序化主题）

```js
import { applyTheme, themeToCss, generateM3Theme, expandCustoms } from "{cdn}/packages/color/m3-theme.js";

applyTheme("#6750A4");                               // 生成并注入当前文档，即时生效
applyTheme("#6750A4", { primary: "#B3261E" }, { brand: "#FF0000" });
const css = themeToCss("#6750A4");                   // 完整 CSS 文本（浅色+深色两块），可存静态文件
const { light, dark } = generateM3Theme("#6750A4");  // 结构化数据
expandCustoms({ brand: "#FF0000" });                 // 只展开自定义变量的四配对 token
```

自定义变量按 M3 tone 规则推导四配对：浅色 tone `[40, 100, 90, 10]`（角色/on/容器/on容器），深色 `[80, 20, 30, 90]`。

## 在页面/组件中使用

```html
<!-- 页面级：中性底 + on 色文字 -->
<body style="background: var(--md-sys-color-surface); color: var(--md-sys-color-on-surface);">

<!-- 自定义强调块：用配对 token -->
<div style="background: var(--md-sys-color-error-container); color: var(--md-sys-color-on-error-container);">
  出错了
</div>

<!-- 组件语义换色（自动配对） -->
<st-button color="error">Delete</st-button>
<st-button color="brand">Brand 按钮</st-button>  <!-- 需先在 color 工具添加 brand 变量 -->
```

## 注意事项

- 未定义的 `color` 名称回退到 primary
- `themeToCss` 输出可作静态 CSS 部署（消除 JS 生效前的闪烁），但失去 localStorage 一键换色能力
- 未加 st-boot.js 的页面仍有极短未上色闪烁；`m3-theme.js` 使用本地 vendored 的 material-color-utilities（无外部 CDN 依赖）
- `st-color-init.js` 同时导出 `themeConfig`（当前配置）与 `theme`（已应用的主题数据）
- 组件 hover/active 用 state layer（currentColor 8%/12% 叠加）、disabled 用 0.38 透明度——无需额外 token，与任意配色自动协调
