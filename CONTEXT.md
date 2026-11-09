# CONTEXT.md — 项目上下文

> 新进本仓库的 AI 请先读完本文档，开发规则见 [AGENTS.md](./AGENTS.md)，具体组件用法见 `packages/{name}/README.md`。

## 项目是什么

Senti-UI 是一个**面向 AI 的 UI 组件库**，基于 **ofa.js**（Web Components 框架），颜色体系采用 **Google Material Design 3（M3）**。无构建、纯静态，CDN 引入即用。

## 核心理念（与传统组件库的本质区别）

传统组件库为人设计大量"便利预设"（`size="small"` 这类枚举）。对 AI 来说这些没有价值——AI 直接写 style/CSS 更精确灵活，预设只是多余的记忆负担。因此本库没有 size 类预设；

- **属性只表达语义**（disabled / loading / M3 规范内的 variant / `color` 语义色引用），**外观直接用原生 CSS 属性定制**——`color` 属性的值是 M3 角色名或 color 模块自定义变量名（如 `color="brand"` 消费 `--brand/--on-brand`），与 color 工具联动实现一键换色，它引用的是语义而非样式预设——组件视觉全部定义在 `:host` 上，`style="height:32px; border-radius:8px"` 直接生效；交互语义由内部透明原生元素（`.native` 模式）承载
- **材质与语义分离（皮肤系统）**：`--st-*` 变量只属于**皮肤作者 API**（`packages/skin/`），用于表达圆角/密度/边框/阴影/毛玻璃/焦点环/动效等材质；使用者仍然只写原生 CSS，不接触这些变量。**颜色不参与换肤**，所有皮肤消费同一套 `--md-sys-color-*`。禁止的只是“给使用者偷懒的组件尺寸预设”（如 `--st-btn-height`），不是皮肤 token 层
- **尺寸类默认值用 em**（height / padding / border-radius / gap 等，以组件默认 font-size 为基准换算，视觉不变）——AI 只改 `font-size` 即可整体等比缩放；需要非等比尺寸时仍可单独覆写任一属性
- **颜色永不写死**，一律消费 `--md-sys-color-*` M3 角色变量
- **文档写给 AI 读**：自包含、结构化、只含事实，AI 按需检索即可正确使用组件
- **交互组件必须支持键盘聚焦**：可点击/可操作的组件（按钮、输入、开关等）必须能用 Tab 聚焦并显示可见的 focus ring（用 `on-surface` 等与页面背景有对比的 M3 角色，见[坑 #11](./pitfall/11-focus-ring-not-currentcolor.md)），Enter/Space 可激活；disabled 态可跳过聚焦

## 命名约定

- 组件标签：`st-` 前缀（如 `st-button`）
- 组件 Style API：原生 CSS 属性本身（各组件 README 列出默认值清单）
- 颜色 token：`--md-sys-color-*`（Material Design 3 角色色）

## 基础引入（所有页面通用）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<script src="/packages/boot/st-boot.js"></script>
```

`st-color-init.js` 是项目初始化模块（取代了原静态 `css/st-m3.css`）：读取 color 工具保存在 localStorage 的配置（种子色/角色覆盖/自定义变量/对比度/对比度方向），动态生成完整 M3 体系并注入 `<style>`——**在 color 工具里调好配色，全站页面（同域）自动跟随**；无保存配置时用默认种子色 `#0061A4`。体系默认注入内置扩展角色 `success`（`--md-sys-color-success` / `on-success` / `success-container` / `on-success-container`，默认绿色 `#006E1C` 按 M3 tone 规则推导，不随主种子色变化，可在工具中覆盖）。主题切换：默认跟随系统；强制用 `<html class="st-light">` / `<html class="st-dark">`。**全局主题模式**（`packages/color/st-theme-mode.js`，st-color-init 自动引入）：模式偏好持久化在 localStorage `st-theme-mode`（`auto` / `light` / `dark`），`st-boot.js` 首帧同步挂类（强制浅/深色无闪色），导出 `getThemeMode` / `setThemeMode` / `applyThemeMode`，跨窗口经 `storage` 事件实时跟随——同域所有引入 st-boot 或任一 st-* 组件的页面共享，一处切换全站生效。

皮肤（可选）：`<html data-skin="apple">` + 引入 `packages/skin/apple.css`（或运行时 `import { setSkin } from "/packages/skin/st-skin.js"`）。皮肤只改材质、不改颜色，切换会持久化到 localStorage 并在同源窗口间同步；首帧固定皮肤用静态 link 可避免一次样式切换。详见 [packages/skin/README.md](./packages/skin/README.md)。

`st-boot.js` 是**同步引导脚本（经典 script，非 module，页面唯一需要引入的标签，须放 head）**，消除刷新闪色：刷新时同步注入 `st-color-init.js` 预先缓存的 CSS（key `st-theme-css`，零闪）；首次访问无缓存则同步 `<link>` 静态兜底 `st-default.css`（默认种子色主题）；注入完首帧样式后自动动态加载 `st-color-init.js`（module），由它按配置生成真实主题覆盖并更新缓存。缓存每次页面加载都会被 `st-color-init.js` 重写（key `st-theme-css`），旧结构缓存自然被新结构覆盖。三条 CSS 生成路径（`applyTheme` 动态 `<style>`、`themeToCss` 缓存/静态文件、`st-default.css` 兜底）输出**同一结构**：浅色块、`html.st-dark` 深色块、`@media (prefers-color-scheme: dark) { html:not(.st-light) }` 深色跟随块，每块都带对应 `color-scheme` 声明——深色系统下 `color-scheme` 计算值为 dark（原生滚动条/表单控件跟随）且首帧不闪浅色。`material-color-utilities` 已 vendored 到 `packages/color/vendor/`，无外部 CDN 依赖。

## 组件清单

| 组件 | 标签 | 引入 | 文档 |
|------|------|------|------|
| Button 按钮 | `st-button` | `<l-m src="/packages/button/button.html"></l-m>` | [packages/button/README.md](./packages/button/README.md) |
| Button-group 按钮组 | `st-button-group` | `<l-m src="/packages/button/button-group.html"></l-m>` | [packages/button/README.md](./packages/button/README.md) |
| Split-button 分裂按钮 | `st-split-button` | `<l-m src="/packages/button/split-button.html"></l-m>` | [packages/button/README.md](./packages/button/README.md) |
| Icon-button 图标按钮 | `st-icon-button` | `<l-m src="/packages/button/icon-button.html"></l-m>` | [packages/button/README.md](./packages/button/README.md) |
| Input 单行输入框 | `st-input` | `<l-m src="/packages/input/input.html"></l-m>` | [packages/input/README.md](./packages/input/README.md) |
| Textarea 多行输入框 | `st-textarea` | `<l-m src="/packages/textarea/textarea.html"></l-m>` | [packages/textarea/README.md](./packages/textarea/README.md) |
| Select 单选下拉框 | `st-select` / `st-option` | `<l-m src="/packages/select/select.html"></l-m>` | [packages/select/README.md](./packages/select/README.md) |
| Dialog 对话框 | `st-dialog` | `<l-m src="/packages/dialog/dialog.html"></l-m>` | [packages/dialog/README.md](./packages/dialog/README.md) |
| Drawer 侧边抽屉 | `st-drawer` | `<l-m src="/packages/drawer/drawer.html"></l-m>` | [packages/drawer/README.md](./packages/drawer/README.md) |
| Dialog 命令式工具 | `alert/confirm/prompt` | `import alert from "/packages/dialog/alert.js"` | [packages/dialog/README.md](./packages/dialog/README.md) |
| Checkbox 复选框 | `st-checkbox` | `<l-m src="/packages/checkbox/checkbox.html"></l-m>` | [packages/checkbox/README.md](./packages/checkbox/README.md) |
| Switch 开关 | `st-switch` | `<l-m src="/packages/switch/switch.html"></l-m>` | [packages/switch/README.md](./packages/switch/README.md) |
| Radio 单选按钮 | `st-radio` | `<l-m src="/packages/radio/radio.html"></l-m>` | [packages/radio/README.md](./packages/radio/README.md) |
| Snackbar 消息条 | `st-snackbar` | `<l-m src="/packages/snackbar/snackbar.html"></l-m>` | [packages/snackbar/README.md](./packages/snackbar/README.md) |
| Toast 命令式工具 | `toast` | `import toast from "/packages/snackbar/toast.js"` | [packages/snackbar/README.md](./packages/snackbar/README.md) |
| Slider 滑块 | `st-slider` | `<l-m src="/packages/slider/slider.html"></l-m>` | [packages/slider/README.md](./packages/slider/README.md) |
| Progress 进度 | `st-progress` | `<l-m src="/packages/progress/progress.html"></l-m>` | [packages/progress/README.md](./packages/progress/README.md) |
| Tooltip 提示 | `st-tooltip` | `<l-m src="/packages/tooltip/tooltip.html"></l-m>` | [packages/tooltip/README.md](./packages/tooltip/README.md) |
| Code 代码块 | `st-code` | `<l-m src="/packages/code/code.html"></l-m>` | [packages/code/README.md](./packages/code/README.md) |
| Card 卡片 | `st-card` | `<l-m src="/packages/card/card.html"></l-m>` | [packages/card/README.md](./packages/card/README.md) |
| Badges 徽标 | `st-badges` | `<l-m src="/packages/badges/badges.html"></l-m>` | [packages/badges/README.md](./packages/badges/README.md) |
| Chip 筛选小片 | `st-chip` | `<l-m src="/packages/chip/chip.html"></l-m>` | [packages/chip/README.md](./packages/chip/README.md) |
| Avatar 头像 | `st-avatar` | `<l-m src="/packages/avatar/avatar.html"></l-m>` | [packages/avatar/README.md](./packages/avatar/README.md) |
| Skeleton 加载占位 | `st-skeleton` | `<l-m src="/packages/skeleton/skeleton.html"></l-m>` | [packages/skeleton/README.md](./packages/skeleton/README.md) |
| Collapse 折叠容器 | `st-collapse` | `<l-m src="/packages/collapse/collapse.html"></l-m>` | [packages/collapse/README.md](./packages/collapse/README.md) |
| List 列表 | `st-list` / `st-list-item` | `<l-m src="/packages/list/list.html"></l-m>` | [packages/list/README.md](./packages/list/README.md) |
| Menu 下拉菜单 | `st-menu` / `st-menu-item` | `<l-m src="/packages/menu/menu.html"></l-m>` | [packages/menu/README.md](./packages/menu/README.md) |
| Context-menu 命令式工具 | `contextMenu` | `import contextMenu from "/packages/menu/context-menu.js"` | [packages/menu/README.md](./packages/menu/README.md) |
| Tabs 标签栏 | `st-tab-bar` / `st-tab-item` | `<l-m src="/packages/tabs/tab-bar.html"></l-m>` | [packages/tabs/README.md](./packages/tabs/README.md) |
| Navigation 导航栏 / 布局 | `st-nav-bar` / `st-nav-item` / `st-nav-layout` | `<l-m src="/packages/navigation/nav-bar.html"></l-m>` + `<l-m src="/packages/navigation/nav-layout.html"></l-m>` | [packages/navigation/README.md](./packages/navigation/README.md) |
| Ripple 波纹 | `st-ripple` | `<l-m src="/packages/ripple/ripple.html"></l-m>` | [packages/ripple/README.md](./packages/ripple/README.md) |

组件包结构：`{name}.html`（组件）+ `index.html`（验收页加载器）+ `page.html`（ofa.js 页面模块，承载验收页逻辑）。

**关联组件同目录原则**：与主组件强相关的子组件（如 button 的 button-group / split-button、tabs 的 tab-item、list 的 list-item）放在主组件同一目录下，共用一个 README 与验收页（page.html 里写在一起），l-m 引入语句各自独立；不要为子组件单独建目录。

### 代码层级规范（页面/验收页/示例通用）

写页面模块（page.html）与示例代码时，API 选择有严格优先级：

0. **状态建模**：组件的运行时状态（可被内部交互修改的，如 dialog 的 open、select 的 value）放 **data**（不放 attrs）——attrs 声明的属性内部只能 setAttribute/removeAttribute，无法回写上层的 `sync:` 绑定；纯外部输入的语义配置（disabled / auto-close 等）才放 attrs。data 状态需 watch 反射到宿主属性供 CSS 选择器用，并用 MutationObserver 做属性→data 的反向兼容
1. **优先 ofa.js 模板渲染语法**——数据绑定 `{{xxx}}`、属性绑定 `attr:xxx="expr"`（布尔属性必须 `attr:` 不能 `:prop`）、事件绑定 `on:click="method"`（根级直接写方法名，o-fill 内才用 `$host.`）、列表 `o-fill`、计算属性放 **proto 上的 `get`**（放模块顶层会导致页面模块加载失败且报错被吞，只显示"Loading page module failed"）
2. **其次 ofa.js API**——`this.xxx = ...` 改数据驱动视图（不要手动 setAttribute/DOM 操作）、`sync:` 双向绑定、`this.emit()` 自定义事件
3. **最后才用原生 DOM API**——仅当 ofa 没有对应能力（如 ResizeObserver、document 级监听、getBoundingClientRect 量取）

典型对照：打开对话框用 `attr:open="openState.basic"` + `on:click="openDlg('basic')"`（数据驱动），而不是 ready 里 `addEventListener` + `setAttribute`；动态行列表用 `o-fill :value="lines"`，而不是 `insertAdjacentHTML`。**禁止**在 ready 里用 `this.ele.shadowRoot.querySelector(...).addEventListener(...)` 挂事件——这是 ofa 页面模块，模板语法天然覆盖。

### 文档（README.md）规范

每个组件的 README 必须包含「**注意事项与使用技巧**」章节，把该组件特有的坑和技巧写全（不是通用框架知识的重复），至少覆盖：

- 状态建模方式：哪些是标签属性（attribute 修改）、哪些是运行时状态（data，`el.value` / `sync:open` 读写）——**会被内部交互修改的状态（dialog 的 open、input 的 value、menu 的 open）必须声明为 data 并写明 `sync:` 绑定用法**，attrs 声明的状态内部无法回写上层绑定（st-dialog 的 open 已踩过此坑）
- 组件特有的交互细节（如 radio 同组互斥依赖同一父容器、snackbar 的 action 按钮必须用 st-button 的 `color` 属性而非内联 style）
- 已知限制（如 st-select 弹层被 overflow 祖先裁剪）
- 与其他组件配合的技巧（如 ripple 已内嵌于哪些组件）

### 验收页（page.html）规范

验收页是组件的**标签用法说明书**（参照 Punch-UI demo 的完整度），AI（和人）看一眼就该知道每种用法怎么写。**必须覆盖以下清单**（不适用项注明"无"即可）：

1. **属性全展示**：每个属性（尤其是 `color` 类枚举值——primary / secondary / tertiary / error / success 及自定义变量）、每个插槽、每种 variant、每个语义状态（默认/选中/禁用/禁用+选中等组合），都要有对应的**真实标签示例**直接写在页面里，而非只靠文字说明
2. **视觉定制能力**：原生 CSS 属性覆盖、`font-size` 等比缩放、`::part()`（有面板的组件）各给一两个示例
3. **事件监听**：核心事件（change/click/close…）用 `on:xxx` 绑定 proto 方法，配可见反馈（计数器 + 当前状态值显示），验证者无需打开控制台
4. **数据绑定**：ofa 页面内的标准用法（`attr:checked="xxx"` / `sync:open="xxx"` 等），配数据显示让双向链路可见
5. **JS 主动操作**：非 ofa 环境/自动化测试的写法（`setAttribute` / `removeAttribute` / `el.value` / `el.hide()` 等），用按钮触发并回显结果
6. **聚焦与键盘行为**：焦点落在哪（内部原生元素）、Tab 可达、Space/Enter 激活，给"聚焦此组件"按钮 + 操作提示
7. 纯展示类组件（snackbar 等）直接静态渲染（加 `open` 之类属性），不要为了"演示"写 JS 触发逻辑；有交互语义的（dialog / menu 等）才用按钮触发

示例参照 `packages/switch/page.html`（完整七项）；所有交互区块用 ofa 语法写（on:click / attr: / {{}}），页面用到的其他组件记得在 index.html 补 `<l-m>` 引入。

## 工具

| 工具 | 说明 | 入口 |
|------|------|------|
| 皮肤系统 | 材质层换肤：`m3` / `apple`（毛玻璃）/ `windows`（Windows 11 / Fluent）/ `shadcn`（扁平）/ `cyberpunk`（零圆角霓虹终端）；只改圆角、密度、描边、阴影、毛玻璃、焦点环、动效、波纹，颜色仍走 M3；`st-skin.js` 提供 `setSkin/getSkin/applySkin/registerSkin`，皮肤 CSS 只声明 `[data-skin="名称"]` 作用域下的 token；已接入全部交互/表面组件（button/input/textarea/select/card/dialog/menu/list/checkbox/switch/radio/slider/progress/tabs/nav/tooltip/snackbar/badges/drawer）；官网另有页面层主题预设（材质 + 官方配色，`site/theme-presets.js`），不属于包 API；完整 token/part 表见 [packages/skin/README.md](./packages/skin/README.md) | [packages/skin/index.html](./packages/skin/index.html)（JS：`st-skin.js`） |
| M3 颜色体系生成器 | 从种子色生成完整浅色/深色 M3 体系（`--md-sys-color-*`），可即时预览、复制 CSS；含 `st-color-init.js` 项目初始化模块（各页面引入，动态注入颜色体系并跟随 localStorage 配置）；核心模块 `m3-theme.js` 提供 `generateM3Theme` / `themeToCss` / `applyTheme` / `expandCustoms` / `generateTonalPalettes` 五个 API；**对比度调整**（`contrast` -1 ~ 1，可按 primary/secondary/tertiary/error/success/neutral/custom 分角色设置）在不改色相的前提下调整角色色与表面关系：正值拉开（霓虹/游戏），负值收紧（可爱/柔和主题）（`generateTonalPalettes` 可传种子色生成标准五盘，或传角色色对象生成当前实际角色色五盘）；内置扩展角色 success（默认绿 `#006E1C`，不随种子色变化）；支持核心四角色 + success 手动覆盖与自定义变量（自动按 M3 tone 规则展开 on/container 配对 token），配置存 localStorage；完整 token 清单与配对规则见 [packages/color/README.md](./packages/color/README.md) | [packages/color/index.html](./packages/color/index.html)（JS：`packages/color/m3-theme.js`） |
| 官网（SCSR 真实路径 + 共享布局） | `site/` 目录：ofa.js **v5 分支 + scsr**。`layout.html` 是共享父页（header / footer / 主题控制；header 用三个 `variant="text"` 的 `st-button` 做「文档 / 皮肤 / 手记」导航（组件目录即首页，点品牌字标回首页），右侧 `st-menu` 只保留三巨头材质（m3/apple/windows）快捷切换，shadcn / cyberpunk 在独立皮肤页 `skins.html` 选用，`st-select`（自动 / 浅色 / 深色）+ Iconify 模式图标做主题模式，全站图标统一用 Iconify Web Component，`st-icon-button` / `st-tooltip` 做 GitHub，品牌为 favicon 同款圆角方块 + 圆点标记 + SentiUI 字标；`<slot>` 渲染子页，切页不销毁）；`index.html`（26 张组件卡片目录）与 `site/docs/` 下 23 个独立组件页共享 layout；`site/docs/layout.html` 是**二级父页**（左侧组件目录 `st-list` / 移动端左侧 `st-drawer` 组件目录 / 阅读正文 slot），组件页 `parent = "./layout.html"`，文档布局再 `parent = "../layout.html"`，组件间切换时侧栏不销毁、不重排；每个组件页 4–7 个 `.doc-section`（按 variant / 状态 / 语义色 / 插槽 / 受控用法拆场景，每节独立 LIVE 示例）；页面切换动画**只在 `app-config.js` 的 `pageAnime` 配置**（前进：新页自下方 16px 上移淡入、旧页上移 16px 淡出；后退方向相反。过渡时长由 ofa 注入 `all .3s`，三态只写 `opacity` / `transform`、不写 `transition`；`current.transform` 写 `none`；页面切换动画当前不做 `prefers-reduced-motion` 降级，组件层已做），两级 layout 不写任何切页动画 CSS；slot 外层容器需 `position: relative`（离场页 absolute 相对内容区，否则闪到视口）。`index/docs` 是完整文档：内容内联在 `<o-app><template page>`，scsr 把当前 URL 收编为子 o-page 后移除内联 template；`app-config.js` 不声明 home。支持目录直开、真实路径、后续多 HTML 页扩展。`notes/` 是手记栏目：`index.html` 文章目录 + `behavior-and-skin.html` 设计哲学长文（行为统一 / ofa.js v5 实现 / M3 颜色减法 / 对比度 / input 去 label），共用 `notes.css`，`parent = "../layout.html"`；`skins.html` 是主题页：五张主题卡（Android Material 3 / Apple 毛玻璃 / Microsoft Windows 11 / shadcn / Cyberpunk）各自用局部 `data-skin` + 局部 `--md-sys-color-*` 预览官方配色（M3 蓝 / Apple iOS 蓝 / Windows 蓝 / shadcn zinc / Cyberpunk 荧光绿）；`site/theme-presets.js` 在切换时一并套用配色，并按材质把颜色（对比度）存进 `st-theme-palettes`（M3 槽位承接用户原色，从 Cyberpunk 回 M3 恢复进入前配色）；**深浅模式是全局设置**，不随主题切换，Cyberpunk 也有浅色方案，`setSkin` 本身仍只换材质；页面底部另有 `COLOR / M3` 改色/加色工具：种子色 + 五个角色覆盖 + 任意自定义变量，调用 `packages/color/m3-theme.js` 的 HCT 生成器，改动写 `st-color-config` / `st-theme-css`，并支持恢复默认；工具下方分「白天 / 黑夜」两块面板，各用对应模式 surface-container 铺底；按 Primary / Secondary / Tertiary / Error / Success + 自定义颜色分组，每组 4 个堆叠色块（角色色 / on / container / on-container），底色与文字使用该模式配对 token；下方再按三段布局补 Surface / Surface Variant、五层 Surface Container、On Surface / On Surface Variant / Outline / Outline Variant（M3 生成器未提供 Surface Dim / Surface Bright），每块标注变量名；点击任意色块复制变量名（`$host.copyToken`，含 `execCommand` 兜底），随改色实时重算；标题右侧 `st-button-group` 可切到色块模式，展示 `generateTonalPalettes({ primary, secondary, tertiary, error, success })` 按当前实际角色色生成五条音调盘（每条 14 个 tone，与角色面板颜色一致），每个自定义颜色追加一条同名盘；点击变量名或任意色块复制对应变量名（标准角色 `--md-sys-color-*`，自定义 `--name`）；面板下方「标出变量位置」radio 组（白天 / 黑夜）切换四条跨行长条（白天 色值 40 / on 100 / container 90 / on-container 10，黑夜 色值 80 / on 20 / container 30 / on-container 90），移动端改为对应 tone 色块描边；首页为 shadcn 式组件目录：26 张卡片（每张 = 真实组件预览 + 名称 + 标签 + 站内文档 ↗；预览可交互，卡片不是链接）、紧凑 intro、三张局部 `data-skin` 系统 UI 卡（Android Material 3 / Apple 毛玻璃 / Windows 11，针对主流平台；各自用 `previewThemes` 锁定平台默认配色，不跟随站点当前主题色）与快速开始；**站内文档 `site/docs/`** 取代旧 `docs/`：23 个独立 SCSR 页（每组件一页：属性表 / 插槽事件 / 可折叠代码 / 可交互示例 / 上下一页）、`site/docs/index.html` 卡片概览（按「基础组件 18 / 辅助组件 4 / 高级组件 1」分组：波纹、折叠、提示归为辅助，代码展示归为高级）、`site/docs/layout.html` 内唯一的 `st-list` 侧栏（移动端改为左侧 `st-drawer` 组件目录）、layout 的 `st-progress` 阅读进度与 `st-icon-button` 回到顶部；旧根目录 `docs/` 已删除；命令式工具/皮肤 API 挂 `window.__site`；页面 shadow 内额外 `<link>` 皮肤 CSS 才能同页对比。无 JS 时 template 惰性，用 `<noscript>` 兜底（[坑 #50](./pitfall/50-scsr-template-inert.md)） | [site/index.html](./site/index.html) · [site/skins.html](./site/skins.html) · [site/notes/index.html](./site/notes/index.html) · [docs/index.html](./site/docs/index.html) |

2026-10-29 无障碍基础层（`packages/a11y/a11y.js`）落地：交互控件可访问名称同步、dialog `role=dialog`/`aria-modal`/焦点陷阱/焦点归还/滚动锁/叠加 Escape 只关最上层、select combobox/listbox、menu role + 方向键、tabs/nav 角色、progress `progressbar`、collapse `inert`、snackbar `role=status`。回归用例在 `tests/a11y.spec.js`。

2026-11-04 颜色体系新增对比度调整（`contrast`，-1 ~ 1）：M3 标准 tone 偏和谐、深色角色色落在 tone 80 容易发粉彩，霓虹/游戏主题不够冲。`m3-theme.js` 的 `generateM3Theme(seed, overrides, { contrast, contrastTone })` / `themeToCss(...)` / `applyTheme(...)` / `expandCustoms(...)` 支持 -1 ~ 1 数字（统一；负值降低对比度，走独立柔和表）或按角色对象（`{ default, primary, secondary, tertiary, error, success, neutral, custom }`）；角色色从色盘按目标 tone 重新取色，深色模式角色 tone 按 `contrastTone` 下移（`deep`，洋红/紫靠饱和度出霓虹）或上移（`bright`，荧光绿/黄靠亮度出霓虹），表面同时压到近黑，角色色对表面的明度对比仍保持在 4.5:1 以上。颜色工具与官网改色面板都有对比度滑杆；`contrastTone` 是主题级配置（UI 不暴露），官网 Cyberpunk 预设改为荧光绿 `#D6FE78` + `contrast: 1` + `contrastTone: "bright"`，其余材质默认 0 / deep；切换材质时对比度与方向回到目标主题的默认值（不跨材质记忆，种子色/角色覆盖仍按材质槽位记忆）；深浅模式是全局设置，默认不随主题切换；例外是 Cyberpunk（深色优先）——从浅色 / 自动+浅色进入时切到显式深色，auto+系统已深色则保持 auto，离开后继续保持深色；Cyberpunk 也有浅色方案，可手动切回。对比度属于配色，不写进皮肤 CSS。

2026-10-31 表单能力与 a11y 收尾：输入/多行/下拉/复选/开关/单选补 `name` / `required` / 原生约束校验与 `<form>` 提交（`packages/form/form-proxy.js` 的不可见 light DOM 代理控件），`st-button type=submit/reset` 代理到最近表单；select 的 combobox 移入 shadow 与 listbox 同树，tabs/nav 支持方向键，menu 触发器内部 button 也带展开状态，tooltip 用 `aria-description` 关联触发元素，tabs 指示条改用 offset 布局坐标。

2026-11-06 交互与无障碍回归修复：模态层打开时把宿主分支之外的背景设为 `inert`（模态栈统一重算，dialog/drawer 共用）；dialog/drawer 的 headline 名称随文本变化更新；switch 内部控件改 `role=switch`；radio 同名分组按 form owner 隔离并补组内方向键 + roving tabindex；menu 方向键只遍历当前层菜单项、关闭后焦点归还触发器；split-button 菜单补 `role=menu` / `aria-controls` / 方向键与 Escape 捕获（不再连带关闭外层 dialog）；card 键盘只在宿主自身聚焦时激活（内部按钮 Enter/Space 不再被吞）；checkbox `indeterminate` 同步原生混合态且不再错误参与表单提交；select 非法 value 自动清空；st-input/st-textarea/st-select 的 `el.focus()` / `el.blur()` 桥接到内部控件。

2026-11-06 P3 优化：`m3-theme` 的 `themeToCss` / `applyTheme` 共用同一 CSS 生成器，`applyTheme` 返回 `{ light, dark, css }`，`st-color-init` / 改色页 / 官网预设复用 `css`，不再为写缓存重复生成色盘；`syncAccessibleName` 只在 `fromSlot` 场景观察子树，显式 aria-label 场景只观察宿主属性；menu / tooltip / split-button 的滚动/resize 重定位用新增的 `rafThrottle` 合并到一帧；select 支持 `option disabled`、`optgroup` 分组标题与整组禁用、重复 value 按最近选择下标高亮（外部 `el.value` 仍按值定位第一项），点击选项时焦点保持在 combobox；nav-layout 断点改用 `clientWidth`；toast 窄屏增加右侧安全边距；两个已知并行 flaky 用例改为条件等待。

## 当前状态（2026-11-05）

当前 25 个模块（含 4 个双标签模块；2026-11-09 新增 chip/avatar/skeleton 三件套——参考 MUI 清单筛选引入），st-button 作为整个库设计范式的样板：

- **皮肤系统**（`packages/skin/`，2026-10-29 试点）：把“材质”从组件里抽成 token 层，内置 `m3` / `apple`（毛玻璃）/ `windows`（Windows 11 / Fluent）/ `shadcn`（扁平）/ `cyberpunk`（霓虹终端）五套皮肤。切换只改 `<html data-skin>`，颜色始终来自 M3；全部组件已 token 化（圆角、密度、描边、阴影、毛玻璃、字体、焦点环、state layer、动效、波纹）：M3 默认值回退到组件原有值，Apple 统一半透明毛玻璃，Windows 11 使用 4px 控件 / 8px 表面与 Mica + Acrylic，shadcn 统一扁平细描边，cyberpunk 统一零圆角 / 等宽字 / 霓虹发光（发光色仍消费 primary 角色）。焦点环/状态层/动效/阴影走通用 token，浮层表面用 `--st-dialog-*` / `--st-menu-*` / `--st-card-*` / `--st-select-popup-*` 组件 token；新增组件必须按 skin README 的接入清单消费 token。**prefers-reduced-motion**：所有带动效组件都有本地降级，五套皮肤同时把 `--st-*-duration` token 归零。
- **st-button**（`packages/button/`）：三种 variant（filled/outlined/text）、disabled、loading、prefix/suffix 插槽；`color` 语义色属性可与 variant 自由组合（按 M3 规范分派：filled 用角色色底/on-角色色字，outlined/text 用角色色作前景与描边，运行时切换 variant 亦生效）；外观完全由原生 CSS 属性定制（视觉在 `:host` 上，内部透明 `.native` 原生 button 承载交互语义）。已在浏览器中完成功能与双主题验证。
- **st-button-group / st-split-button**（`packages/button/`，2026-08-21 从 Punch-UI 重构）：按钮组（connected 连体/full-width 等分；**圆角在 attached 后由 JS 按位置设置**，不用 ::slotted(:first-child) 位置选择器——ofa 升级 light DOM 时序下不可靠，slotchange 自动重算）；分裂按钮（主区 click 冒泡做主操作 + 箭头区开合菜单，菜单项用 st-menu-item；open 为 data 运行时状态支持 sync:open；面板行为同 st-menu）。案例与 st-button 写在同一验收页。
- **st-icon-button**（`packages/button/icon-button.html`）：圆形图标按钮，四种 M3 variant（standard 透明 / filled / tonal container 配对 / outlined）+ `color` 属性（tonal 分支消费 container 配对 token）+ disabled；图标插槽默认 1.571em；使用时必须配 title/aria-label（无文字）。案例与 st-button 同验收页。
- **第二批组件**（2026-08-21，参考 MUI 组件清单）：**st-slider**（M3 视觉：轨道两端内缩拇指半径、20px 圆拇指、拖动/聚焦显示数值气泡 value indicator；内部原生 input[type=range] 承载拖拽/键盘；value 为 data 运行时状态 el.value 读写（sync:value / :value 绑定），min/max/step 转发原生并在变化时重新约束；2026-11-05 补 `name`/`form` 表单代理与 reset）；**st-progress**（线形/环形 × 确定/不定四态，不定动画由 JS 内联 animation 驱动——不能用属性选择器：JS 写 indeterminate 属性会经 ofa 反馈进 attr data 与"缺省 value 推导"形成自引用死锁，[坑 #37](./pitfall/37-attrs-self-reference-deadlock.md)；缺省 value 自动视为不定；环形不定为**固定弧长（55% 圆周）+ 1.2s 匀速旋转**——不做弧长呼吸：offset 推进/呼吸方案在实测中始终有可见接缝，固定弧长旋转 360°≡0° 天然无缝）；**st-tooltip**（悬停/聚焦开合、触屏长按 500ms 打开，气泡 fixed 自动上下翻转，open 为 data 需 watch 反射属性供 CSS，[坑 #27](./pitfall/27-watch-initial-trigger.md) 守卫；content 纯文本防注入）；**st-card**（elevated/filled/outlined 三 variant + interactive 可点击形态，宿主 role=button/tabindex 承载；宿主恒 position:relative 且波纹仅 interactive 显示——否则绝对定位的波纹逃逸到全局）；**st-badges**（点/数字封顶 max+/文字徽标，钉在默认插槽元素右上角，pointer-events none）。
- **st-ripple**（`packages/ripple/`）：点击波纹，放在 relative 父元素内使用；已内嵌到 st-button（点击按钮有波纹效果），波纹色 currentColor。
- **三小件**（2026-11-09）：**st-chip**（`packages/chip/`，M3 assist/filter/input 三形态；filter 的 `selected` 是 data 运行时状态（`sync:selected`/`el.selected`，宿主属性 watch 反射 + MutationObserver 反向兼容，静态初始值 ready 时读取）；可点击形态宿主自身承载 role=button/tabindex/Enter·Space（同 st-card interactive，内部 ✕ 按键/点击被 e.target 与 composedPath 守卫放行）；`removable` 显示 ✕ 派发 composed `remove`（不触发 click/选中切换，不自动移除节点）；filter 选中消费 `--st-accent/--st-on-accent`（color 属性写入，缺省回退 secondary-container 配对）；内嵌波纹）；**st-avatar**（`packages/avatar/`，纯展示：src 图片 > image 插槽 > 默认插槽文字缩写；`alt` 自动转发宿主 aria-label 与内部 img；color 走 badges 直写模式设 `--st-avatar-bg/color`；尺寸即原生 CSS，font-size 等比）；**st-skeleton**（`packages/skeleton/`，纯展示骨架占位：shape=text/circle/rect；opacity 呼吸动画时长 `--st-skeleton-duration`（皮肤可归零），prefers-reduced-motion 自动静止；宽高一律原生 CSS 覆写）。
- **st-code**（`packages/code/`，2026-11-05 新增，高级组件）：代码块，HTML / JS / TS / CSS / Less / Sass 语法高亮（内置轻量高亮器），并 vendored js-beautify 自动格式化（Sass 只去公共缩进）；源码用 `<template>`（惰性安全）或 `code` 属性，读取后转义渲染；文件名标题 + 复制按钮，`copy` 事件；`--st-code-*` 皮肤 token 与 `part`；不请求外部 CDN。
- **st-input**（`packages/input/`）：单行输入框，两种 variant（outlined/filled）、disabled、readonly、type、placeholder、`default-value` 初始值属性、prefix/suffix 插槽、`color` 语义色属性（控制 caret 与 focus 边框色，常用于 error/success 校验态）；**value 是运行时状态（ofa data，非标签属性），attached 时由 default-value 初始化，JS 读写用 `el.value`**；`input`/`change` 事件天然 composed 直接在宿主监听；提供 `focus()`/`blur()` 方法。视觉在 `:host` 上，内部透明 `.native` input 承载交互。
- **st-textarea**（`packages/textarea/`）：多行输入框，与 st-input 同范式（outlined/filled、rows、default-value 初始值/color/disabled/readonly、focus 描边/底线动画；value 为运行时状态，`el.value` 读写）；内部透明 textarea 用 rows 自撑高度（拖拽手柄默认关闭）；`autosize` 属性按内容自动撑开（rows 为最小高度，ResizeObserver 兜底外部字号变化）。
- **st-select**（`packages/select/`）：单选下拉框，与 st-input 同范式（outlined/filled、placeholder、default-value 初始选中/color/disabled、focus 描边/底线动画；value 为运行时状态，`el.value` 读写）；选项写在 light DOM 的原生 `<option>` 或 **`st-option` 组件**（2026-09-30 新增：`packages/select/option.html`，随 select.html 内部 l-m 自动加载；`value`/`label` 属性 + 默认插槽富内容，内部 span/自定义元素均可克隆渲染，`label` 控制闭合态显示文本、value 缺省先取 label 再取文本，两者 option 也支持 label 属性；插槽里的图标元素（svg / img / iconify-icon / `[slot="icon"]`）会同步显示在闭合态），组件自绘 M3 风格弹层（shadow 内绝对定位，选中项 secondary-container + 对勾、键盘 ↑↓/Enter/Escape/Home/End 全支持、点击外部关闭）；弹层按视口剩余空间自动下弹/上弹（drop-up），开合动画同 st-menu（进入 0.2s 缩放淡入 / 退出 150ms 过渡后隐藏）；`change` 事件 composed。注意：弹层在 shadow 内，被 overflow 祖先裁剪时会截断。
- **st-dialog**（`packages/dialog/`）：模态对话框，`open` 为**运行时状态（data，非 attrs）**——内部交互关闭（auto-close）改 `this.open`，经 `sync:open` 双向绑定自动回写上层（attrs 声明的 open 内部 removeAttribute 无法回写 `:open` 绑定，此为状态类属性放 data 的原因）；watch 反射 data → 宿主 open 属性供 CSS，MutationObserver 反向兼容 setAttribute；显隐（纯 CSS，默认 display:none + `:host([open])` 正向启用）+ `auto-close`（遮罩点击/Escape 交互关闭并派发 `close` 事件 composed）；headline/默认/actions 三插槽（空区块自动隐藏）；**结构例外：宿主是全屏遮罩层（fixed + grid 居中），面板在 shadow 内 `part="panel"`，宽高/圆角/底色用原生 `::part(panel)` 选择器定制**（遮罩必须铺满视口，面板视觉无法放 :host 上）；面板默认值全 em（宿主改 font-size 全面板等比缩放）；打开时焦点移入面板容器；M3 emphasized 动效（遮罩淡入 250ms + 面板 translateY(-7.14em) scale(1,0.5) 展开入场 300ms，关闭反向退出 200ms 后再隐藏，closing 过渡态由 JS 短暂挂载，watch 需 `_wasOpen` 守卫防初始化误触发）；轻磨砂遮罩（rgba(0,0,0,0.28) + blur(2px)）；模态语义/焦点陷阱/焦点归还/背景滚动锁/叠加 Escape 只关最上层已接入。另含**命令式工具**（`alert.js`/`confirm.js`/`prompt.js`，核心工厂 `util.js`，2026-08-21 参考 LemonTrade 移植）：`await alert/confirm/prompt(...)` 基于 st-dialog 即用即毁，返回值对齐原生语义（alert→true/null，confirm→true/false/null，prompt→值/null），文本自动转义、组件按需注入 l-m；prompt 聚焦须排在对话框自身聚焦之后（open watch 的 rAF 会抢焦点）。
- **表单选择类**（checkbox / switch / radio，2026-08-20 从 Punch-UI 重构）：统一范式——内部透明原生 `<input type="checkbox|radio">`（`all: unset` + absolute inset 0 + **z-index: 2 盖住 position:relative 的兄弟元素**）承载点击/Space/焦点，变更后反射回宿主属性（`checked`/`indeterminate`）并派发 `change`（composed）；disabled 由 `input.disabled` 原生阻断；`color` 属性选中态换角色色（applyState 写 shadow 内元素内联样式）；对勾/圆点描边与弹性入场动画；radio 的 name 分组不跨 shadow root，互斥由组件在同一树作用域内查询同 name 兄弟手动实现。
- **st-snackbar**（`packages/snackbar/`）：消息条，`open` 显隐 + `duration`（毫秒）自动关闭派发 `close`；视觉在 :host（默认 secondary 次级色底，color 属性可换角色色）；`hide()` 已桥接为宿主 DOM property（[坑 #24](./pitfall/24-o-page-proto-external.md)）；显隐即时切换，动画由 toast 工具负责；带 `role=status` / `aria-live=polite`。
- **toast 命令式工具**（`packages/snackbar/toast.js`，2026-08-21 参考 Punch-UI 移植）：基于 st-snackbar 的 toast()——视口左下角 fixed 容器堆叠、入场/退场动画（0.3s）、duration 自动关闭（0 = 手动），返回 `{ close, el }`；✕ 关闭按钮色默认 on-secondary / 彩色底用 on-角色色（st-button color 属性）；组件按需注入 l-m，文本 textContent 防注入。
- **st-collapse**（`packages/collapse/`）：高度过渡折叠容器，`hide` 收起；ResizeObserver 跟随内容高度；watch 初始触发需容错（shadowRoot 未就绪直接 return）。
- **st-list / st-list-item**（`packages/list/`）：列表容器 + 列表项；item 支持 `button`（state layer + 波纹 + click 冒泡）/ `disabled`（原生 button.disabled 阻断）/ `collapsible + expanded`（内嵌 st-collapse 折叠 sublist，点击切换且不冒泡）；prefix/suffix/secondary 副文本插槽；首尾项自动大圆角。
- **st-menu / st-menu-item**（`packages/menu/`）：下拉菜单，trigger 插槽 + light DOM 菜单项；面板 fixed 定位 JS 计算（翻转避让视口、min-width 跟随触发器）；open/close 事件（watch 需守卫防初始化派发）；点外部/Escape/选中自动关闭（`keep-open` 时点项不关；外部判断用 composedPath，[坑 #21](./pitfall/21-composedpath-outside-click.md)）；item 的 `.native` 以宿主为包含块（宿主必须 position:relative，否则 absolute 铺满整个面板）。**可勾选菜单项（2026-11-05）**：`st-menu-item` 支持 `checkable` / `selected`——`checkable` 显示勾选位、内部 button `role=menuitemcheckbox` + `aria-checked`，点击自动切换 `selected` 并派发 composed `change`；`st-menu` 的 `keep-open` 让点项不关闭（多选菜单）。**支持多级子菜单（2026-08-23）**：`st-menu` 放在 `st-menu-item` 的 `sub-menu` 插槽内——item 仍是普通列表项（`has-sub` 属性自动显示 ▸ 箭头、hover 120ms 展开/移出 300ms 收起、点击开合且 stopPropagation），子菜单宿主检测祖先链挂 `sub` 属性后零尺寸（absolute 0×0，仅作 fixed 面板挂载点），定位锚点取所在 item 的 rect、右侧放置自动翻转；Escape 只关最内层（父级以 `_openSubs` 非空让位），选中任意项 click 逐级冒泡整链关闭（item 的 click 拦截要放行来自自身子菜单的点击：`e.composedPath().includes(this._subEle)` 时直接 return），父级关闭级联清子孙状态（`_openSubs` 靠子级 open/close 事件 composed 冒泡回传维护）；**跨组件写子菜单 open 必须经 `$(el)` 包装对象**（原生元素直接赋值不进 ofa data）；ofa 模块内 `(a && b)?.method()` 形式的可选链会被转译出 bug，改写为普通 if；**子菜单检测（sub 属性）在 ready 时可能失效**——ofa 升级 light DOM 的时序下 parentElement 尚未就绪（命令式动态构建 st-menu 时踩到，表现为子面板定位/形态全错），兜底：首次 watch open 时用 `ele.closest("st-menu-item")` 再校验一次。**context-menu 命令式工具（2026-08-23）**：`packages/menu/context-menu.js` 的 `contextMenu(event或{x,y}, items)` → 挂 body 用完即毁，Promise resolve 点击的叶子项 id / null（点空白、Escape）；items 为 `{id,label,prefix,suffix,disabled,children}` + `{separator:true}`（children 递归建 sub-menu 插槽）；**点击 id 必须用捕获阶段监听记录**（面板关闭监听在 shadow 内、气泡先于根监听派发 close）；close 事件统一 resolve + 250ms 后销毁；组件按需注入 l-m；ofa 页面验收需在 index.html 预 import 挂 window（[坑 #6](./pitfall/6-page-module-import.md)）。**移动端支持（2026-08-23）**：item 的 hover 展开/收起按 `e.pointerType === "touch"` 跳过（防滑动误触），触屏子菜单纯 click 开合；`contextMenu.longPress(el, items, onSelect)` 长按 ~500ms 呼出（pointerType 为 mouse 时忽略、移动超 10px/抬起/取消即中止、吞掉系统 contextmenu 与抬起 click），返回取消函数。**右键菜单（2026-08-23）**：`openAt(x, y)` proto 方法以坐标为锚点打开（面板左上角对齐光标，右侧/下方空间不足自动翻到左/上方并夹紧视口）；`_anchorPoint` 优先于触发器定位，关闭或点 trigger 时清除；已打开时再次 `openAt` 手动调 `updatePosition` 重定位（watch 不触发）；ofa 页面内查询页面元素用 `this.shadow.$("#id")`（`this.$` 查不到 shadow 内内容）。
- **st-tab-bar / st-tab-item** 与 **st-nav-bar / st-nav-item**（`packages/tabs/`、`packages/navigation/`）：指示条/药丸跟随动画组件——bar 用 MutationObserver 监听子项 `active` 属性变化 + ResizeObserver 尺寸重定位（瞬时无动画），item 的 active 切换由外部逻辑处理（click 冒泡传出）；tab 指示条贴底边线、nav 药丸为 secondary-container 对齐 item 内 `.pill` 区域。nav 的形态属性**分属两层**（bar 不向下改子项）：`vertical` 在 `st-nav-bar` 上（子项排列方向），`parallel` 在各 `st-nav-item` 上（文字位置：icon 右——icon 药丸 32×32、active 药丸覆盖整行、state layer/波纹改以 item 行为包含块：`.pill` 置 `position: static` 使内部绝对定位层上浮到 `.container`）；bar 的药丸定位按 active 项是否带 `parallel` 选择整行/药丸区（定位用 offset 布局坐标而非 getBoundingClientRect——祖先 transform / 隐藏初显不产生错位，见[坑 #41](./pitfall/41-offset-not-boundingrect.md)；demo 有「隐藏容器内初始 active」回归场景）；配套 **st-nav-layout**（2026-08-22 新增，参考 Punch-UI nav-layout）：以自身宽度做 container query 的三档响应式布局——<768px 底部导航 / 768–1023px 平板：仍在底部、item 切横排（parallel，整行药丸）/ ≥1024px 左侧窄 rail（仅 vertical，宽度跟随内容），**只有 st-nav-layout** 会按容器宽度自动修正两者（≥1024 给 bar 挂 `vertical`；768–1023 给各 item 挂 `parallel`，MutationObserver 跟随 bar 内增删 item）。

全局文件：

| 文件 | 作用 |
|------|------|
| `packages/a11y/a11y.js` | 组件共用无障碍基础设施：可访问名称同步、滚动锁、焦点陷阱 |
| `packages/form/form-proxy.js` | 组件共用的原生表单代理：name/value/required/校验/reset 与提交 |
| `AGENTS.md` | 开发规则：设计原则、目录约定、新增组件流程 |
| `CONTEXT.md` | 本文档，项目全景 + 组件总索引 |
| `pitfall/` | 踩坑记录索引，一条一文件（原 CONTEXT 的「ofa.js 已知坑」） |

## 踩坑索引（pitfall/）

所有踩坑记录已**逐条拆分**到 [pitfall/](./pitfall/README.md)，一条一个文件；组件代码与文档里的 `坑 #N`（如「坑 #18」「坑 #43」）对应 `pitfall/` 下同编号文件。历史重复号已用 `a` / `b` 区分（见索引的「编号约定」）。

- [ofa.js / 组件（48 条）](./pitfall/README.md#ofajs) —— 属性与模板绑定、watch 时序、shadow DOM、皮肤 token、SCSR / 路由等
- [测试 / 验证（17 条）](./pitfall/README.md#testing) —— Playwright、皮肤异步加载、CSS 过渡帧、无障碍验证等（#27–#38 为借测试发现的组件时序 / 样式坑）

改组件前优先读这几条高频坑：

| 主题 | 条目 |
| --- | --- |
| watch 异步 / 初始触发 | [坑 #18](./pitfall/18-watch-async-after-setattr.md) · [坑 #27](./pitfall/27-watch-initial-trigger.md) |
| `:host:not()` 失效 | [坑 #20](./pitfall/20-host-not-selector.md) |
| shadow 换肤只走 CSS 变量 | [坑 #43](./pitfall/43-shadow-css-vars.md) · [坑 #47](./pitfall/47-part-cross-shadow.md) |
| 皮肤 token 提前解析 | [坑 #59a](./pitfall/59a-skin-token-var-resolution.md) |
| fixed 弹层包含块 | [坑 #42](./pitfall/42-fixed-containing-block.md) |
| display:none 冻结动画 | [坑 #34](./pitfall/34-display-none-pauses-animation.md) |

新增坑：按 [pitfall/README.md](./pitfall/README.md) 的模板新建文件并更新索引，**不要再把正文追加回本文件**。

## 测试

Playwright 端到端测试（无构建，走真实浏览器）：

- 用例：`tests/*.spec.js`（覆盖 button/input/textarea/select/checkbox/switch/radio/dialog/menu/tabs/nav/slider/progress/tooltip/card/badges/snackbar/toast/skin/site，以及 `a11y.spec.js` 的无障碍与回归用例）；fixture 页：`tests/fixtures/*.html`（引 CDN ofa.js + st-color-init.js + l-m，`window.events` 记录事件）
- 运行：`npm test`（自动起 `http-server` :8642，禁缓存；须先 `npx playwright install chromium`）
- CI：`.github/workflows/test.yml`（push/PR 时跑 chromium）
- 已知注意：st-input/st-textarea 宿主本身不可聚焦（无 tabindex），焦点在内部 `.native` 上，`el.focus()` 原生调用无效（[坑 #24](./pitfall/24-o-page-proto-external.md)），测试用真实点击聚焦；焦点事件断言用 `focusin`/`focusout`（原生 focus/blur 不冒泡）

## 下一步可能的方向

- 皮肤矩阵截图回归（`m3/apple/windows/shadcn × 组件 × 深浅色`），把“只换材质不换颜色”变成可自动验证的约束
- 皮肤 token 目前是“通用 + 组件”两层，后续可补 `--st-density-*` 统一密度（列表/菜单项/对话框内边距）
- 表单代理目前不支持原生 `<label for>`；如需完整 labelable 语义，需要给 ofa.js 增加 form-associated 支持或在代理上做 id 映射
- 按同样范式继续扩组件（table、autocomplete、date picker 等），新组件从第一天就消费 token 并暴露 part