# 主题与颜色（Material Design 3）

## 颜色体系从哪来

`packages/color/st-init.js` 是全库唯一颜色来源：读取 color 工具保存在 localStorage 的配置（种子色/角色覆盖/自定义变量），动态生成完整 M3 体系并注入 `<style>`。所有 senti-ui 组件加载时会自动 import 它，正常使用**无需手动引入**。无保存配置时用默认种子色 `#0061A4`。

需要手动控制时：

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/color/st-init.js"></script>
```

## 主题切换

默认跟随系统。强制：

```html
<html class="st-light"> ... </html>
<html class="st-dark"> ... </html>
```

## 自定义配色

用 color 工具（在线地址：`https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/color/index.html`）：

- 改**种子色**：整套 `--md-sys-color-*` 按 M3 tone 规则重新推导
- 覆盖核心四角色（primary/secondary/tertiary/error）+ 扩展角色 success
- 添加**自定义变量**（如 `brand`）：自动展开 `--brand` / `--on-brand` / `--brand-container` / `--on-brand-container` 配对 token
- 配置存 localStorage——**同域**所有引入 st-init.js 的页面自动跟随（一键换色）

内置扩展角色 `success`：默认绿 `#006E1C`，不随种子色变化，token 由 st-init.js 自动注入，`color="success"` 直接可用。

## 组件里怎么用颜色

三种方式，按粒度选：

1. **`color` 属性（语义换色）**：值是 M3 角色名或自定义变量名，组件按自身 variant 规则配对底色/文字/描边（如 filled 用角色色底 + on-角色色字，outlined 用角色色前景与描边）。在 color 工具里改配置，全站跟随
2. **原生 style + M3 角色**：`style="background: var(--md-sys-color-error); color: var(--md-sys-color-on-error)"` —— 一次性定制，仍自动适配深浅色
3. **hover/active/disabled 不用管**：state layer 用 currentColor 半透明叠加（8%/12%），disabled 用 0.38 透明度，与任意配色自动协调

## 核心 JS API（m3-theme.js）

`packages/color/m3-theme.js` 提供：`generateM3Theme`（种子色 → M3 体系）、`themeToCss`（→ CSS 文本）、`applyTheme`（应用）、`expandCustoms`（自定义变量展开）。

## 常用 M3 角色

`primary/on-primary`、`secondary/on-secondary`、`tertiary/on-tertiary`、`error/on-error`、`success/on-success`（扩展）、`surface/on-surface`、`surface-container(-low/-high/-highest)`、`outline`、`outline-variant`、`inverse-surface/inverse-on-surface`。浅深两套同名 token，切换主题即整体换值。
