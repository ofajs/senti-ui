# Color 颜色体系（M3 生成器 + st-color-init.js 初始化模块）

Senti-UI 全库**唯一颜色来源**：从种子色按 Material Design 3（HCT 色彩空间）规则生成完整的浅色/深色两套 token（`--md-sys-color-*` CSS 变量），动态注入 `<style>`。组件内禁止写死颜色，一律消费这些变量。

本包不是组件，是工具包：`st-color-init.js`（页面初始化模块）+ `m3-theme.js`（核心 API）+ `index.html`（可视化生成器）。

## 依赖引入（使用前必须）

**普通页面**：组件内部已自动 `import "../color/st-color-init.js"`，无需手动引入。需要独立使用或消除刷新闪色时，在 `<head>` 内尽早引入一行即可（boot 会自动加载 st-color-init.js）：

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/boot/st-boot.js"></script>
```

`st-color-init.js` 读取 localStorage 中 color 工具保存的配置（key 为 `st-color-config`：`{ seed, overrides, customs }`），无配置时用默认种子色 `#0061A4`。**同域所有引入它的页面共享配置**——工具里调好配色，全站自动跟随（一键换色）。

### 刷新闪色的治理（st-boot.js 同步引导）

颜色由 JS 动态生成，模块加载前页面无色会闪一下。`st-boot.js` 是**经典同步脚本（非 module）**，首帧渲染前完成：

- **刷新（有缓存）**：`st-color-init.js` 每次生成后把主题 CSS 缓存到 localStorage（key `st-theme-css`），`st-boot.js` 同步读缓存注入 `<style>`——零网络、零计算、零闪
- **首次访问（无缓存）**：同步 `<link>` 引入静态兜底 `st-default.css`（默认种子色主题，`themeToCss` 生成的产物）——首帧即有默认色，`st-color-init.js` 随后按真实配置覆盖并写缓存
- `st-boot.js` 位于 `packages/boot/`（项目级同步引导，非 color 包私有），从自身 `<script src>` 推导相对路径引用 `../color/st-default.css` 与 `../color/st-color-init.js`，放在任何路径下都可用；它注入完首帧样式后自动动态加载 `st-color-init.js`，页面无需再写第二个标签

依赖说明：`m3-theme.js` 已改为引入**本地 vendored** 的 `./vendor/material-color-utilities.js`（单文件自包含 bundle，源自 jsdelivr），不再依赖外部 CDN。

## 可用颜色 token 完整清单

每套主题 32 个 token，浅色/深色同名自动换值。**变量名规则**：camelCase → kebab-case，如 `onPrimary` → `--md-sys-color-on-primary`。

### 角色色（每个角色 4 个配对 token）

| 角色 | 角色色（底/前景） | 上面放文字 | 容器色（浅底） | 容器上文字 |
|------|------|------|------|------|
| primary 主色 | `--md-sys-color-primary` | `on-primary` | `primary-container` | `on-primary-container` |
| secondary 次色 | `secondary` | `on-secondary` | `secondary-container` | `on-secondary-container` |
| tertiary 三级色 | `tertiary` | `on-tertiary` | `tertiary-container` | `on-tertiary-container` |
| error 错误 | `error` | `on-error` | `error-container` | `on-error-container` |
| success 成功（内置扩展角色，默认绿 `#006E1C`，不随种子色变化，可覆盖） | `success` | `on-success` | `success-container` | `on-success-container` |

（表中省略 `--md-sys-color-` 前缀；`on-primary` 完整名即 `--md-sys-color-on-primary`。）

### 中性色（surface 系，页面与容器底色）

| token | 用途 |
|------|------|
| `surface` / `on-surface` | 页面底色 / 页面正文文字（最常用的一对） |
| `surface-variant` / `on-surface-variant` | 次级容器底（如输入框 outlined 底）/ 次级文字、placeholder、图标 |
| `surface-container-lowest` → `surface-container-low` → `surface-container` → `surface-container-high` → `surface-container-highest` | 容器底色五层梯度（白 → 深逐级加深，深色模式反向），卡片/弹层按层级选用 |
| `outline` / `outline-variant` | 边框线（粗）/ 分隔线（细） |
| `inverse-surface` / `inverse-on-surface` / `inverse-primary` | 反色（tooltip 气泡底 / 其上文字 / 深浅反转的 primary） |

## 文字与背景如何搭配（核心规则）

M3 的 token 天生成对，**永远用配对 token，不要自己调透明度或写死色值**：

1. **实底用 on-角色色放字**：`background: var(--md-sys-color-primary)` + `color: var(--md-sys-color-on-primary)`——on- 色是按 HCT 对比度算法推导的，保证任何种子色下都达标
2. **浅容器底用 on-*-container 放字**：`primary-container` 底 + `on-primary-container` 字（tonal 风格，如 chip、选中态）
3. **中性底用 on-surface 系**：`surface` 底 + `on-surface` 字；`surface-container-*` 底 + `on-surface`（标题）/ `on-surface-variant`（次要文字）
4. **只用作前景时用角色色本身**：`color: var(--md-sys-color-error)` 放在 `surface` 底上（错误文字、描边）
5. **自定义变量同样四配对**：`--brand` / `--on-brand` / `--brand-container` / `--on-brand-container`，规则同上

组件的 `color` 属性已按上述规则自动配对（filled：角色色底 + on-角色色字；tonal：container 配对；outlined/text：角色色前景），无需手写。

## 深色 / 浅色模式

- **默认跟随系统**（`prefers-color-scheme`），两套 token 自动切换，同时设置 `color-scheme` 让原生控件（滚动条/表单）跟随
- **强制浅色**：`<html class="st-light">`；**强制深色**：`<html class="st-dark">`（优先级高于系统）
- 自定义 CSS 只要消费 `--md-sys-color-*`，深浅色**零成本自动适配**——这就是"颜色只走 M3 角色"的原因

## 自定义配色（三种方式）

### 1. color 可视化工具（推荐）

打开 `/packages/color/index.html`（[在线版](https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/color/index.html)）：改种子色、覆盖核心四角色 + success、添加自定义变量（自动展开四配对 token）。配置存 localStorage，同域页面全部跟随。

### 2. 直接写 localStorage（适合 JS 初始化）

```js
localStorage.setItem("st-color-config", JSON.stringify({
  seed: "#0061A4",              // 种子色
  overrides: { primary: "#B3261E" },  // 可选键：primary/secondary/tertiary/error/success
  customs: [                    // 自定义变量，name 自动 kebab-case
    { name: "brand", color: "#FF0000" },
  ],
}));
// 刷新页面后 st-color-init.js 读取生效（写入须在 st-color-init.js 执行前）
```

### 3. JS API（m3-theme.js，适合程序化主题）

```js
import { generateM3Theme, themeToCss, applyTheme, expandCustoms } from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/color/m3-theme.js";

applyTheme("#6750A4");                        // 生成并注入当前文档，即时生效
applyTheme("#6750A4", { primary: "#B3261E" }, { brand: "#FF0000" });
const css = themeToCss("#6750A4");            // 生成完整 CSS 文本（浅色+深色两块），可存为静态主题文件
const { light, dark } = generateM3Theme("#6750A4");  // 结构化数据 { light: {...}, dark: {...} }
const pair = expandCustoms({ brand: "#FF0000" });    // 只展开自定义变量的四配对 token
```

API 签名：

| API | 说明 |
|------|------|
| `generateM3Theme(seedHex, overrides?)` | 种子色 → `{ light, dark }` 两套 token 表 |
| `themeToCss(seedHex, overrides?, customs?)` | → CSS 文本（`:root` + `html.st-dark` 两个块，可保存为静态 CSS） |
| `applyTheme(seedHex, overrides?, customs?)` | 生成并动态注入当前文档（含媒体查询深色跟随） |
| `expandCustoms(customs)` | `{ brand: "#FF0000" }` → 四配对 token 的 `{ light, dark }` |

`overrides` 可选键：`primary` / `secondary` / `tertiary` / `error` / `success`。自定义变量按 M3 tone 规则推导：浅色 tone `[40, 100, 90, 10]`，深色 `[80, 20, 30, 90]`（角色/on/容器/on容器）。

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

## 注意事项与使用技巧

- 未定义的 `color` 名称（如没配置过 `brand` 就使用）回退到 primary
- `themeToCss` 的输出可作为静态 CSS 部署（不依赖 JS 生效，消除闪烁），但会失去 localStorage 一键换色能力
- `st-color-init.js` 同时导出 `themeConfig`（当前配置）与 `theme`（已应用的主题数据），可 import 使用
- 组件 hover/active 用 state layer（currentColor 8%/12% 叠加）、disabled 用 0.38 透明度——不需要额外 token，自动与任意配色协调
