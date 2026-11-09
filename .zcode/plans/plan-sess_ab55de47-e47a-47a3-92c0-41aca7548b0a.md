# 新增 st-chip / st-avatar / st-skeleton 三组件

## Context

组件库对照 MUI 清单缺高频小件。用户确认范围：st-chip 做 M3 全三态（assist / filter 可选中 / input 可删除），st-skeleton 做 shape + pulse（不做多行 lines）。三个组件均按既有范式：四件套目录、皮肤 token 回退、`color` 语义色属性、a11y、验收页七项清单、Playwright 测试、技能文档同步。

## 新增文件（每个组件四件套）

### 1. `packages/chip/`（chip.html / README.md / index.html / page.html）

- **st-chip**：`variant`（assist 默认 / filter / input）、`selected`（filter 态选中，data 运行时状态，watch 反射宿主属性 + MutationObserver 反向兼容，参照 dialog open 范式，支持 `sync:selected`）、`removable`（input 态显示 ✕，内部 `st-icon-button` 或自绘清除区，点击派发 `remove` 事件且不触发 chip click）、`disabled`、`color` 属性（**button/switch 的 `--st-accent` 模式**：`applyColor()` 设 `--st-accent` / `--st-on-accent`，CSS 消费 `var(--st-accent, var(--md-sys-color-primary))`，让皮肤可改写 accent 呈现）
- 交互语义：filter/assist 可点击时宿主承载 role="button"/tabindex（参照 card 的 interactive 键盘处理：宿主 keydown Enter/Space → click，排除来自内部清除按钮的按键）；elevated/outlined 视觉差异走 variant 属性选择器
- 勾选位：filter 选中显示对勾（svg，弹性入场参照 checkbox）
- 皮肤 token：`--st-chip-radius`（回退 `--st-radius-*`）、`--st-chip-height`、`--st-chip-border`（回退 `--st-outlined-border`）、`--st-chip-selected-bg`、`--st-chip-state-hover/press`（回退 `--st-state-hover/press`）、`--st-chip-shadow`（回退 `--st-shadow-1`）、focus ring / disabled opacity / motion 通用 token；`prefers-reduced-motion` 降级；`part="chip"`（可选，内部元素少，视实现定）
- 尺寸默认值全 em；颜色只消费 `--md-sys-color-*`

### 2. `packages/avatar/`（avatar.html / README.md / index.html / page.html）

- 纯展示：默认插槽（文字缩写，自动 `text-transform` + 居中）+ `image` 插槽（img/icon）/ `src` 属性二选一；`size` 不做属性——默认 `2.286em`（32px@14px），使用者改 `font-size` 或 `width/height`
- `color` 属性（badges 直写模式即可，或统一 `--st-accent` 模式——采用 **badges 的 applyState 直写模式**，avatar 无状态切换，更简单）
- token：`--st-avatar-radius`（回退 50%）、`--st-avatar-font-size`；无交互 → 无 focus/state layer
- a11y：纯装饰时 `aria-hidden` 由使用者决定，README 写明配 `aria-label` 的用法

### 3. `packages/skeleton/`（skeleton.html / README.md / index.html / page.html）

- `shape` 属性：`text`（默认，圆角行，`width` 默认 100%、height 1em 左右）/ `circle`（正圆，等宽高）/ `rect`（块，小圆角）；宽高一律原生 CSS 属性覆盖
- pulse 呼吸动画：opacity 或表面色振荡，duration/easing 消费 `--st-motion-duration-*` / easing token，`@media (prefers-reduced-motion: reduce)` 与皮肤 token 归零时自动静止
- token：`--st-skeleton-radius`（按 shape 回退不同）、`--st-skeleton-color`（回退 `--md-sys-color-surface-container-highest`）、`--st-skeleton-highlight`（动画亮部）、`--st-skeleton-duration`
- 无交互、无 color 属性（颜色语义不适用）

### 每个组件公共要求

- script 顶部 `import "../color/st-color-init.js"`；`l-m { display:none; }`
- `st-chip` 需要波纹：内嵌 `<l-m src="../ripple/ripple.html">` + `<st-ripple>`（参照 card.html:84-87，仅可点击态显示）
- README 按 badges README 结构：依赖引入 / 语义属性表 / 示例 / 默认值清单 / **注意事项与使用技巧**（状态建模：`selected` 是 data + `sync:selected`；已知限制；与其他组件配合）/ 验证页面

## 验收页（page.html，七项清单全覆盖）

参照 `packages/switch/page.html` 的完整度：
1. 属性全展示（chip 三个 variant × 默认/选中/禁用/禁用+选中 × 五个 color；avatar 文字/图标/五 color/缩放；skeleton 三 shape/自定义宽高）
2. CSS 覆盖 + font-size 等比缩放示例
3. 事件监听（chip click/change/remove 计数器）
4. 数据绑定（`sync:selected`、`:shape`）
5. JS 主动操作（setAttribute / el.selected 读写回显）
6. 聚焦与键盘（chip Tab + Enter/Space 提示）
7. 静态渲染 vs 按钮触发按性质区分
**加皮肤展示区**：至少一套非 M3 皮肤（`data-skin="apple"` 等）下的三组件样例（skin README 要求）

index.html：ofa.js CDN + `st-boot.js` + 各组件 `<l-m>`（含用到的 st-button / st-icon-button / ripple 等）

## 登记（按 AGENTS.md 新增组件流程）

1. `CONTEXT.md` 组件清单表加三行（chip 可能登记为 `st-chip` 单标签）
2. `packages/skin/README.md`：补三个组件的 token 行 + part 行
3. 五套皮肤 CSS（`m3/apple/windows/shadcn/cyberpunk.css`）：各补 chip/avatar/skeleton 的材质 token（只声明 `[data-skin=...]` 作用域 token，不用 @layer、不写元素选择器；复合 token 不引用 `--st-accent`，坑 #59a）
4. `.agents/skills/senti-ui/` 同步（**当次必做**）：`references/components/{chip,avatar,skeleton}.md`（README 内容 + 路径改写为 jsdelivr 完整 URL）、`references/components.md` 速查表各加一节/一行；自查无 `/packages/...` 相对路径残留。SKILL.md 的 version 不动（跟随下次 `npm run bump` 发版）

## 测试

新增 `tests/chip.spec.js`、`tests/avatar.spec.js`、`tests/skeleton.spec.js` + `tests/fixtures/chip.html` / `avatar.html` / `skeleton.html`：
- chip：variant 渲染、selected 切换与 change 事件（composed）、removable 点击派发 remove 且不触发 click、disabled 阻断、color 属性换 accent、Tab 聚焦 + Enter/Space 激活
- avatar：src/插槽渲染、color 生效
- skeleton：三 shape 尺寸/圆角、reduced-motion 静止

## 验证

1. `npm test` 全量回归（含既有用例不破坏）
2. `npm run dev` 起服务，浏览器打开三个验收页 `/packages/chip/`、`/packages/avatar/`、`/packages/skeleton/`：核对七项清单、换肤（apple/shadcn/cyberpunk）、深浅色、等比缩放
3. 官网 `site/docs/` 与首页卡片不在本次范围（历史上新组件也只登记包内文档 + CONTEXT + 技能；如需官网文档页可后续补，会在完成后向你确认）