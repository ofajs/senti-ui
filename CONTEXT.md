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
- **交互组件必须支持键盘聚焦**：可点击/可操作的组件（按钮、输入、开关等）必须能用 Tab 聚焦并显示可见的 focus ring（用 `on-surface` 等与页面背景有对比的 M3 角色，见已知坑 #11），Enter/Space 可激活；disabled 态可跳过聚焦

## 命名约定

- 组件标签：`st-` 前缀（如 `st-button`）
- 组件 Style API：原生 CSS 属性本身（各组件 README 列出默认值清单）
- 颜色 token：`--md-sys-color-*`（Material Design 3 角色色）

## 基础引入（所有页面通用）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<script src="/packages/boot/st-boot.js"></script>
```

`st-color-init.js` 是项目初始化模块（取代了原静态 `css/st-m3.css`）：读取 color 工具保存在 localStorage 的配置（种子色/角色覆盖/自定义变量），动态生成完整 M3 体系并注入 `<style>`——**在 color 工具里调好配色，全站页面（同域）自动跟随**；无保存配置时用默认种子色 `#0061A4`。体系默认注入内置扩展角色 `success`（`--md-sys-color-success` / `on-success` / `success-container` / `on-success-container`，默认绿色 `#006E1C` 按 M3 tone 规则推导，不随主种子色变化，可在工具中覆盖）。主题切换：默认跟随系统；强制用 `<html class="st-light">` / `<html class="st-dark">`。**全局主题模式**（`packages/color/st-theme-mode.js`，st-color-init 自动引入）：模式偏好持久化在 localStorage `st-theme-mode`（`auto` / `light` / `dark`），`st-boot.js` 首帧同步挂类（强制浅/深色无闪色），导出 `getThemeMode` / `setThemeMode` / `applyThemeMode`，跨窗口经 `storage` 事件实时跟随——同域所有引入 st-boot 或任一 st-* 组件的页面共享，一处切换全站生效。

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
| Dialog 命令式工具 | `alert/confirm/prompt` | `import alert from "/packages/dialog/alert.js"` | [packages/dialog/README.md](./packages/dialog/README.md) |
| Checkbox 复选框 | `st-checkbox` | `<l-m src="/packages/checkbox/checkbox.html"></l-m>` | [packages/checkbox/README.md](./packages/checkbox/README.md) |
| Switch 开关 | `st-switch` | `<l-m src="/packages/switch/switch.html"></l-m>` | [packages/switch/README.md](./packages/switch/README.md) |
| Radio 单选按钮 | `st-radio` | `<l-m src="/packages/radio/radio.html"></l-m>` | [packages/radio/README.md](./packages/radio/README.md) |
| Snackbar 消息条 | `st-snackbar` | `<l-m src="/packages/snackbar/snackbar.html"></l-m>` | [packages/snackbar/README.md](./packages/snackbar/README.md) |
| Toast 命令式工具 | `toast` | `import toast from "/packages/snackbar/toast.js"` | [packages/snackbar/README.md](./packages/snackbar/README.md) |
| Slider 滑块 | `st-slider` | `<l-m src="/packages/slider/slider.html"></l-m>` | [packages/slider/README.md](./packages/slider/README.md) |
| Progress 进度 | `st-progress` | `<l-m src="/packages/progress/progress.html"></l-m>` | [packages/progress/README.md](./packages/progress/README.md) |
| Tooltip 提示 | `st-tooltip` | `<l-m src="/packages/tooltip/tooltip.html"></l-m>` | [packages/tooltip/README.md](./packages/tooltip/README.md) |
| Card 卡片 | `st-card` | `<l-m src="/packages/card/card.html"></l-m>` | [packages/card/README.md](./packages/card/README.md) |
| Badges 徽标 | `st-badges` | `<l-m src="/packages/badges/badges.html"></l-m>` | [packages/badges/README.md](./packages/badges/README.md) |
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
| 皮肤系统 | 材质层换肤：`m3` / `apple`（毛玻璃）/ `windows`（Windows 11 / Fluent）/ `shadcn`（扁平）/ `cyberpunk`（零圆角霓虹终端）；只改圆角、密度、描边、阴影、毛玻璃、焦点环、动效、波纹，颜色仍走 M3；`st-skin.js` 提供 `setSkin/getSkin/applySkin/registerSkin`，皮肤 CSS 只声明 `[data-skin="名称"]` 作用域下的 token；已接入全部交互/表面组件（button/input/textarea/select/card/dialog/menu/list/checkbox/switch/radio/slider/progress/tabs/nav/tooltip/snackbar/badges）；官网另有页面层主题预设（材质 + 官方配色，`site/theme-presets.js`），不属于包 API；完整 token/part 表见 [packages/skin/README.md](./packages/skin/README.md) | [packages/skin/index.html](./packages/skin/index.html)（JS：`st-skin.js`） |
| M3 颜色体系生成器 | 从种子色生成完整浅色/深色 M3 体系（`--md-sys-color-*`），可即时预览、复制 CSS；含 `st-color-init.js` 项目初始化模块（各页面引入，动态注入颜色体系并跟随 localStorage 配置）；核心模块 `m3-theme.js` 提供 `generateM3Theme` / `themeToCss` / `applyTheme` / `expandCustoms` 四个 API；内置扩展角色 success（默认绿 `#006E1C`，不随种子色变化）；支持核心四角色 + success 手动覆盖与自定义变量（自动按 M3 tone 规则展开 on/container 配对 token），配置存 localStorage；完整 token 清单与配对规则见 [packages/color/README.md](./packages/color/README.md) | [packages/color/index.html](./packages/color/index.html)（JS：`packages/color/m3-theme.js`） |
| 官网（SCSR 真实路径 + 共享布局） | `site/` 目录：ofa.js **v5 分支 + scsr**。`layout.html` 是共享父页（header / footer / 主题控制；header 用三个 `variant="text"` 的 `st-button` 做「文档 / 皮肤 / 手记」导航（组件目录即首页，点品牌字标回首页），右侧 `st-menu` 只保留三巨头材质（m3/apple/windows）快捷切换，shadcn / cyberpunk 在独立皮肤页 `skins.html` 选用，`st-icon-button` / `st-tooltip` 做主题与 GitHub，品牌为 favicon 同款圆角方块 + 圆点标记 + SentiUI 字标；`<slot>` 渲染子页，切页不销毁）；`index.html`（25 张组件卡片目录）与 `docs/` 下 21 个独立组件页共享 layout；`docs/layout.html` 是**二级父页**（左侧组件目录 `st-list` / 移动端 `st-select` / 阅读正文 slot），组件页 `parent = "./layout.html"`，文档布局再 `parent = "../layout.html"`，组件间切换时侧栏不销毁、不重排；每个组件页 4–7 个 `.doc-section`（按 variant / 状态 / 语义色 / 插槽 / 受控用法拆场景，每节独立 LIVE 示例）；页面切换动画**只在 `app-config.js` 的 `pageAnime` 配置**（前进：新页自下方 16px 上移淡入、旧页上移 16px 淡出；后退方向相反。过渡时长由 ofa 注入 `all .3s`，三态只写 `opacity` / `transform`、不写 `transition`；`current.transform` 写 `none`；当前不做 `prefers-reduced-motion` 降级），两级 layout 不写任何切页动画 CSS；slot 外层容器需 `position: relative`（离场页 absolute 相对内容区，否则闪到视口）。`index/docs` 是完整文档：内容内联在 `<o-app><template page>`，scsr 把当前 URL 收编为子 o-page 后移除内联 template；`app-config.js` 不声明 home。支持目录直开、真实路径、后续多 HTML 页扩展。`notes/` 是手记栏目：`index.html` 文章目录 + `why-senti-ui.html` 首篇设计手记，共用 `notes.css`，`parent = "../layout.html"`；`skins.html` 是主题页：五张主题卡（Android Material 3 / Apple 毛玻璃 / Microsoft Windows 11 / shadcn / Cyberpunk）各自用局部 `data-skin` + 局部 `--md-sys-color-*` 预览官方配色（M3 蓝 / Apple iOS 蓝 / Windows 蓝 / shadcn zinc / Cyberpunk 洋红+青）；`site/theme-presets.js` 在切换时一并套用配色，并按材质把颜色/模式存进 `st-theme-palettes`（M3 槽位承接用户原色，从 Cyberpunk 回 M3 恢复进入前配色），`setSkin` 本身仍只换材质；页面底部另有 `COLOR / M3` 改色/加色工具：种子色 + 五个角色覆盖 + 任意自定义变量，调用 `packages/color/m3-theme.js` 的 HCT 生成器，改动写 `st-color-config` / `st-theme-css`，并支持恢复默认；工具下方分「白天 / 黑夜」两块面板，各用对应模式 surface-container 铺底，展示全部 34 个 M3 token 与自定义配对 token 的色块 / HEX / 变量名，变量名可点击复制（`$host.copyToken`，含 `execCommand` 兜底），随改色实时重算；首页为 shadcn 式组件目录：25 张卡片（每张 = 真实组件预览 + 名称 + 标签 + 站内文档 ↗；预览可交互，卡片不是链接）、紧凑 intro、四张局部 `data-skin` 材质卡与快速开始；**站内文档 `site/docs/`** 取代旧 `docs/`：21 个独立 SCSR 页（每组件一页：属性表 / 插槽事件 / 可折叠代码 / 可交互示例 / 上下一页）、`docs/index.html` 卡片概览（按「基础组件 18 / 辅助组件 3」分组：波纹、折叠、提示归为辅助）、`docs/layout.html` 内唯一的 `st-list` 侧栏（移动端 `st-select`）、layout 的 `st-progress` 阅读进度与 `st-icon-button` 回到顶部；官网不再引用 `docs/`；命令式工具/皮肤 API 挂 `window.__site`；页面 shadow 内额外 `<link>` 皮肤 CSS 才能同页对比。无 JS 时 template 惰性，用 `<noscript>` 兜底（坑 #50） | [site/index.html](./site/index.html) · [site/skins.html](./site/skins.html) · [site/notes/index.html](./site/notes/index.html) · [docs/index.html](./site/docs/index.html) |
| 组件官网 | `docs/` 目录，o-router + o-app 微应用（入口 `docs/index.html`）：`layout.html` 侧边栏布局（parent/slot 嵌套）+ `pages/home.html` 首页 + 每组件一页薄包装（预载 l-m 后 `<o-page>` 内嵌对应验收页 `packages/{name}/page.html`）；dialog/snackbar 的命令式工具在入口 index.html 预加载挂 window（坑 #6）；新增组件时在 `docs/layout.html` 的 components 数组登记并建 `docs/pages/{name}.html` | [docs/index.html](./docs/index.html) |

2026-10-29 无障碍基础层（`packages/a11y/a11y.js`）落地：交互控件可访问名称同步、dialog `role=dialog`/`aria-modal`/焦点陷阱/焦点归还/滚动锁/叠加 Escape 只关最上层、select combobox/listbox、menu role + 方向键、tabs/nav 角色、progress `progressbar`、collapse `inert`、snackbar `role=status`。回归用例在 `tests/a11y.spec.js`。

2026-10-31 表单能力与 a11y 收尾：输入/多行/下拉/复选/开关/单选补 `name` / `required` / 原生约束校验与 `<form>` 提交（`packages/form/form-proxy.js` 的不可见 light DOM 代理控件），`st-button type=submit/reset` 代理到最近表单；select 的 combobox 移入 shadow 与 listbox 同树，tabs/nav 支持方向键，menu 触发器内部 button 也带展开状态，tooltip 用 `aria-description` 关联触发元素，tabs 指示条改用 offset 布局坐标。

## 当前状态（2026-10-29）

当前 20 个模块（含 4 个双标签模块，2026-08-21 新增 slider/progress/tooltip/card/badges 五件套——参考 MUI 清单筛选引入），st-button 作为整个库设计范式的样板：

- **皮肤系统**（`packages/skin/`，2026-10-29 试点）：把“材质”从组件里抽成 token 层，内置 `m3` / `apple`（毛玻璃）/ `windows`（Windows 11 / Fluent）/ `shadcn`（扁平）/ `cyberpunk`（霓虹终端）五套皮肤。切换只改 `<html data-skin>`，颜色始终来自 M3；全部组件已 token 化（圆角、密度、描边、阴影、毛玻璃、字体、焦点环、state layer、动效、波纹）：M3 默认值回退到组件原有值，Apple 统一半透明毛玻璃，Windows 11 使用 4px 控件 / 8px 表面与 Mica + Acrylic，shadcn 统一扁平细描边，cyberpunk 统一零圆角 / 等宽字 / 霓虹发光（发光色仍消费 primary 角色）。焦点环/状态层/动效/阴影走通用 token，浮层表面用 `--st-dialog-*` / `--st-menu-*` / `--st-card-*` / `--st-select-popup-*` 组件 token；新增组件必须按 skin README 的接入清单消费 token。
- **st-button**（`packages/button/`）：三种 variant（filled/outlined/text）、disabled、loading、prefix/suffix 插槽；`color` 语义色属性可与 variant 自由组合（按 M3 规范分派：filled 用角色色底/on-角色色字，outlined/text 用角色色作前景与描边，运行时切换 variant 亦生效）；外观完全由原生 CSS 属性定制（视觉在 `:host` 上，内部透明 `.native` 原生 button 承载交互语义）。已在浏览器中完成功能与双主题验证。
- **st-button-group / st-split-button**（`packages/button/`，2026-08-21 从 Punch-UI 重构）：按钮组（connected 连体/full-width 等分；**圆角在 attached 后由 JS 按位置设置**，不用 ::slotted(:first-child) 位置选择器——ofa 升级 light DOM 时序下不可靠，slotchange 自动重算）；分裂按钮（主区 click 冒泡做主操作 + 箭头区开合菜单，菜单项用 st-menu-item；open 为 data 运行时状态支持 sync:open；面板行为同 st-menu）。案例与 st-button 写在同一验收页。
- **st-icon-button**（`packages/button/icon-button.html`）：圆形图标按钮，四种 M3 variant（standard 透明 / filled / tonal container 配对 / outlined）+ `color` 属性（tonal 分支消费 container 配对 token）+ disabled；图标插槽默认 1.571em；使用时必须配 title/aria-label（无文字）。案例与 st-button 同验收页。
- **第二批组件**（2026-08-21，参考 MUI 组件清单）：**st-slider**（M3 视觉：轨道两端内缩拇指半径、20px 圆拇指、拖动/聚焦显示数值气泡 value indicator；内部原生 input[type=range] 承载拖拽/键盘；value 为 data 运行时状态 el.value 读写（sync:value / :value 绑定），min/max/step 转发原生并在变化时重新约束）；**st-progress**（线形/环形 × 确定/不定四态，不定动画由 JS 内联 animation 驱动——不能用属性选择器：JS 写 indeterminate 属性会经 ofa 反馈进 attr data 与"缺省 value 推导"形成自引用死锁，坑 #37；缺省 value 自动视为不定；环形不定为**固定弧长（55% 圆周）+ 1.2s 匀速旋转**——不做弧长呼吸：offset 推进/呼吸方案在实测中始终有可见接缝，固定弧长旋转 360°≡0° 天然无缝）；**st-tooltip**（悬停/聚焦开合，气泡 fixed 自动上下翻转，open 为 data 需 watch 反射属性供 CSS，坑 #27 守卫；content 纯文本防注入）；**st-card**（elevated/filled/outlined 三 variant + interactive 可点击形态，宿主 role=button/tabindex 承载；宿主恒 position:relative 且波纹仅 interactive 显示——否则绝对定位的波纹逃逸到全局）；**st-badges**（点/数字封顶 max+/文字徽标，钉在默认插槽元素右上角，pointer-events none）。
- **st-ripple**（`packages/ripple/`）：点击波纹，放在 relative 父元素内使用；已内嵌到 st-button（点击按钮有波纹效果），波纹色 currentColor。
- **st-input**（`packages/input/`）：单行输入框，两种 variant（outlined/filled）、disabled、readonly、type、placeholder、`default-value` 初始值属性、prefix/suffix 插槽、`color` 语义色属性（控制 caret 与 focus 边框色，常用于 error/success 校验态）；**value 是运行时状态（ofa data，非标签属性），attached 时由 default-value 初始化，JS 读写用 `el.value`**；`input`/`change` 事件天然 composed 直接在宿主监听；提供 `focus()`/`blur()` 方法。视觉在 `:host` 上，内部透明 `.native` input 承载交互。
- **st-textarea**（`packages/textarea/`）：多行输入框，与 st-input 同范式（outlined/filled、rows、default-value 初始值/color/disabled/readonly、focus 描边/底线动画；value 为运行时状态，`el.value` 读写）；内部透明 textarea 用 rows 自撑高度（拖拽手柄默认关闭）；`autosize` 属性按内容自动撑开（rows 为最小高度，ResizeObserver 兜底外部字号变化）。
- **st-select**（`packages/select/`）：单选下拉框，与 st-input 同范式（outlined/filled、placeholder、default-value 初始选中/color/disabled、focus 描边/底线动画；value 为运行时状态，`el.value` 读写）；选项写在 light DOM 的原生 `<option>` 或 **`st-option` 组件**（2026-09-30 新增：`packages/select/option.html`，随 select.html 内部 l-m 自动加载；`value`/`label` 属性 + 默认插槽富内容，内部 span/自定义元素均可克隆渲染，`label` 控制闭合态显示文本、value 缺省先取 label 再取文本，两者 option 也支持 label 属性），组件自绘 M3 风格弹层（shadow 内绝对定位，选中项 secondary-container + 对勾、键盘 ↑↓/Enter/Escape/Home/End 全支持、点击外部关闭）；弹层按视口剩余空间自动下弹/上弹（drop-up），开合动画同 st-menu（进入 0.2s 缩放淡入 / 退出 150ms 过渡后隐藏）；`change` 事件 composed。注意：弹层在 shadow 内，被 overflow 祖先裁剪时会截断。
- **st-dialog**（`packages/dialog/`）：模态对话框，`open` 为**运行时状态（data，非 attrs）**——内部交互关闭（auto-close）改 `this.open`，经 `sync:open` 双向绑定自动回写上层（attrs 声明的 open 内部 removeAttribute 无法回写 `:open` 绑定，此为状态类属性放 data 的原因）；watch 反射 data → 宿主 open 属性供 CSS，MutationObserver 反向兼容 setAttribute；显隐（纯 CSS，默认 display:none + `:host([open])` 正向启用）+ `auto-close`（遮罩点击/Escape 交互关闭并派发 `close` 事件 composed）；headline/默认/actions 三插槽（空区块自动隐藏）；**结构例外：宿主是全屏遮罩层（fixed + grid 居中），面板在 shadow 内 `part="panel"`，宽高/圆角/底色用原生 `::part(panel)` 选择器定制**（遮罩必须铺满视口，面板视觉无法放 :host 上）；面板默认值全 em（宿主改 font-size 全面板等比缩放）；打开时焦点移入面板容器；M3 emphasized 动效（遮罩淡入 250ms + 面板 translateY(-7.14em) scale(1,0.5) 展开入场 300ms，关闭反向退出 200ms 后再隐藏，closing 过渡态由 JS 短暂挂载，watch 需 `_wasOpen` 守卫防初始化误触发）；轻磨砂遮罩（rgba(0,0,0,0.28) + blur(2px)）；模态语义/焦点陷阱/焦点归还/背景滚动锁/叠加 Escape 只关最上层已接入。另含**命令式工具**（`alert.js`/`confirm.js`/`prompt.js`，核心工厂 `util.js`，2026-08-21 参考 LemonTrade 移植）：`await alert/confirm/prompt(...)` 基于 st-dialog 即用即毁，返回值对齐原生语义（alert→true/null，confirm→true/false/null，prompt→值/null），文本自动转义、组件按需注入 l-m；prompt 聚焦须排在对话框自身聚焦之后（open watch 的 rAF 会抢焦点）。
- **表单选择类**（checkbox / switch / radio，2026-08-20 从 Punch-UI 重构）：统一范式——内部透明原生 `<input type="checkbox|radio">`（`all: unset` + absolute inset 0 + **z-index: 2 盖住 position:relative 的兄弟元素**）承载点击/Space/焦点，变更后反射回宿主属性（`checked`/`indeterminate`）并派发 `change`（composed）；disabled 由 `input.disabled` 原生阻断；`color` 属性选中态换角色色（applyState 写 shadow 内元素内联样式）；对勾/圆点描边与弹性入场动画；radio 的 name 分组不跨 shadow root，互斥由组件在同一树作用域内查询同 name 兄弟手动实现。
- **st-snackbar**（`packages/snackbar/`）：消息条，`open` 显隐 + `duration`（毫秒）自动关闭派发 `close`；视觉在 :host（默认 secondary 次级色底，color 属性可换角色色）；`hide()` 已桥接为宿主 DOM property（坑 #24）；显隐即时切换，动画由 toast 工具负责；带 `role=status` / `aria-live=polite`。
- **toast 命令式工具**（`packages/snackbar/toast.js`，2026-08-21 参考 Punch-UI 移植）：基于 st-snackbar 的 toast()——视口左下角 fixed 容器堆叠、入场/退场动画（0.3s）、duration 自动关闭（0 = 手动），返回 `{ close, el }`；✕ 关闭按钮色默认 on-secondary / 彩色底用 on-角色色（st-button color 属性）；组件按需注入 l-m，文本 textContent 防注入。
- **st-collapse**（`packages/collapse/`）：高度过渡折叠容器，`hide` 收起；ResizeObserver 跟随内容高度；watch 初始触发需容错（shadowRoot 未就绪直接 return）。
- **st-list / st-list-item**（`packages/list/`）：列表容器 + 列表项；item 支持 `button`（state layer + 波纹 + click 冒泡）/ `disabled`（原生 button.disabled 阻断）/ `collapsible + expanded`（内嵌 st-collapse 折叠 sublist，点击切换且不冒泡）；prefix/suffix/secondary 副文本插槽；首尾项自动大圆角。
- **st-menu / st-menu-item**（`packages/menu/`）：下拉菜单，trigger 插槽 + light DOM 菜单项；面板 fixed 定位 JS 计算（翻转避让视口、min-width 跟随触发器）；open/close 事件（watch 需守卫防初始化派发）；点外部/Escape/选中自动关闭（外部判断用 composedPath，坑 #21）；item 的 `.native` 以宿主为包含块（宿主必须 position:relative，否则 absolute 铺满整个面板）。**支持多级子菜单（2026-08-23）**：`st-menu` 放在 `st-menu-item` 的 `sub-menu` 插槽内——item 仍是普通列表项（`has-sub` 属性自动显示 ▸ 箭头、hover 120ms 展开/移出 300ms 收起、点击开合且 stopPropagation），子菜单宿主检测祖先链挂 `sub` 属性后零尺寸（absolute 0×0，仅作 fixed 面板挂载点），定位锚点取所在 item 的 rect、右侧放置自动翻转；Escape 只关最内层（父级以 `_openSubs` 非空让位），选中任意项 click 逐级冒泡整链关闭（item 的 click 拦截要放行来自自身子菜单的点击：`e.composedPath().includes(this._subEle)` 时直接 return），父级关闭级联清子孙状态（`_openSubs` 靠子级 open/close 事件 composed 冒泡回传维护）；**跨组件写子菜单 open 必须经 `$(el)` 包装对象**（原生元素直接赋值不进 ofa data）；ofa 模块内 `(a && b)?.method()` 形式的可选链会被转译出 bug，改写为普通 if；**子菜单检测（sub 属性）在 ready 时可能失效**——ofa 升级 light DOM 的时序下 parentElement 尚未就绪（命令式动态构建 st-menu 时踩到，表现为子面板定位/形态全错），兜底：首次 watch open 时用 `ele.closest("st-menu-item")` 再校验一次。**context-menu 命令式工具（2026-08-23）**：`packages/menu/context-menu.js` 的 `contextMenu(event或{x,y}, items)` → 挂 body 用完即毁，Promise resolve 点击的叶子项 id / null（点空白、Escape）；items 为 `{id,label,prefix,suffix,disabled,children}` + `{separator:true}`（children 递归建 sub-menu 插槽）；**点击 id 必须用捕获阶段监听记录**（面板关闭监听在 shadow 内、气泡先于根监听派发 close）；close 事件统一 resolve + 250ms 后销毁；组件按需注入 l-m；ofa 页面验收需在 index.html 预 import 挂 window（坑 #6）。**移动端支持（2026-08-23）**：item 的 hover 展开/收起按 `e.pointerType === "touch"` 跳过（防滑动误触），触屏子菜单纯 click 开合；`contextMenu.longPress(el, items, onSelect)` 长按 ~500ms 呼出（pointerType 为 mouse 时忽略、移动超 10px/抬起/取消即中止、吞掉系统 contextmenu 与抬起 click），返回取消函数。**右键菜单（2026-08-23）**：`openAt(x, y)` proto 方法以坐标为锚点打开（面板左上角对齐光标，右侧/下方空间不足自动翻到左/上方并夹紧视口）；`_anchorPoint` 优先于触发器定位，关闭或点 trigger 时清除；已打开时再次 `openAt` 手动调 `updatePosition` 重定位（watch 不触发）；ofa 页面内查询页面元素用 `this.shadow.$("#id")`（`this.$` 查不到 shadow 内内容）。
- **st-tab-bar / st-tab-item** 与 **st-nav-bar / st-nav-item**（`packages/tabs/`、`packages/navigation/`）：指示条/药丸跟随动画组件——bar 用 MutationObserver 监听子项 `active` 属性变化 + ResizeObserver 尺寸重定位（瞬时无动画），item 的 active 切换由外部逻辑处理（click 冒泡传出）；tab 指示条贴底边线、nav 药丸为 secondary-container 对齐 item 内 `.pill` 区域。nav 的形态属性**分属两层**（bar 不向下改子项）：`vertical` 在 `st-nav-bar` 上（子项排列方向），`parallel` 在各 `st-nav-item` 上（文字位置：icon 右——icon 药丸 32×32、active 药丸覆盖整行、state layer/波纹改以 item 行为包含块：`.pill` 置 `position: static` 使内部绝对定位层上浮到 `.container`）；bar 的药丸定位按 active 项是否带 `parallel` 选择整行/药丸区（定位用 offset 布局坐标而非 getBoundingClientRect——祖先 transform / 隐藏初显不产生错位，见坑 #41；demo 有「隐藏容器内初始 active」回归场景）；配套 **st-nav-layout**（2026-08-22 新增，参考 Punch-UI nav-layout）：以自身宽度做 container query 的三档响应式布局——<768px 底部导航 / 768–1023px 平板：仍在底部、item 切横排（parallel，整行药丸）/ ≥1024px 左侧窄 rail（仅 vertical，宽度跟随内容），**只有 st-nav-layout** 会按容器宽度自动修正两者（≥1024 给 bar 挂 `vertical`；768–1023 给各 item 挂 `parallel`，MutationObserver 跟随 bar 内增删 item）。

全局文件：

| 文件 | 作用 |
|------|------|
| `packages/a11y/a11y.js` | 组件共用无障碍基础设施：可访问名称同步、滚动锁、焦点陷阱 |
| `packages/form/form-proxy.js` | 组件共用的原生表单代理：name/value/required/校验/reset 与提交 |
| `AGENTS.md` | 开发规则：设计原则、目录约定、新增组件流程 |
| `CONTEXT.md` | 本文档，项目全景 + 组件总索引 + ofa.js 已知坑 |

## ofa.js 已知坑（沉淀自实战，改组件前必读）

0. **ofa.js CDN 不锁版本**（`https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs`）——锁 4.5.0 时 `o-fill` 直接渲染（内嵌 `$data` 模板）不可用
1. **布尔属性默认值用 `null`，不用 `false`**——`false` 默认值会覆盖初始裸属性（`<st-button disabled>` 失效）
2. **布尔属性转发到内部原生元素用属性绑定 `:disabled="..."`**——`attr:disabled` 会把 `false` 序列化成字符串，属性存在即生效，导致永远禁用
3. **JS 修改组件状态用 `setAttribute` / `removeAttribute`**——直接改 property 不触发模板更新
4. **条件渲染不要依赖 `x-if` 响应运行时属性变化**——改用常驻 DOM + `:host([attr])` CSS 选择器控制显隐
5. `{{...}}` 只能用在文本节点，属性值一律用 `attr:` / `:prop` / `:style.` 指令
6. **ofa 页面模块（page.html）脚本内不能用相对路径 `import()`**——模块代码经 eval 执行，相对路径解析失败；需要在 index.html 用 `<script type="module">` 预加载并挂到 `window`，页面工厂里等待就绪（注意 `o-page` 升级可能早于内联 module 执行，`__ready` Promise 可能尚不存在，须轮询 `window` 上的标记）
7. **验收页统一用 `o-page` 模式**——index.html 只做加载器（ofa.js + st-color-init.js + `<l-m>` + `<o-page src="./page.html">`），内容与逻辑全部放 page.html 页面模块（data / proto / o-fill 列表渲染）
8. **本地验证必须用 `npm run dev`**（http-server `-c-1` 禁缓存，端口 8642）——用户通常会提前启动它，直接用 `http://localhost:8642/` 验证即可，不要另起 python http.server 等不禁缓存的服务，否则改完 `page.html` / `m3-theme.js` 浏览器继续用旧模块，表现为"改了没生效"或诡异报错，排查极耗时
9. **ofa CDN 不锁版本会自动升级**（曾从 4.5 漂移到 4.7.3），新版可能把更多方法名变为保留（如 `refresh` 已被 `$.fn` 占用）——proto 方法名避开 `$.fn` 上的通用名（get/set/text/html/data/watch/on/emit/class/style/remove/refresh 等）
10. **页面模块内部操作 shadow DOM 用 `this.ele.shadowRoot.querySelector`（原生 API）**——比 `this.shadow.$()` 跨版本更稳
11. **focus ring 等画在组件外部的指示色不要用 `currentColor`**——它跟随文字色（如 filled 按钮白字 → 白圈），画在浅色页面上完全不可见；应使用与页面背景有对比的 M3 角色（如 `on-surface`），深浅色主题下都成立
12. **组件内向自身插入动态节点必须 `this.ele.shadowRoot.appendChild(...)`**——直接 `this.ele.appendChild(...)` 会落入 light DOM，无 slot 分发时完全不可见
13. **测试时合成事件（`dispatchEvent(new PointerEvent/...)`）跨 shadow 边界冒泡必须带 `{ composed: true }`**——否则监听在 shadow 宿主上的处理器收不到，会误判为组件不工作；真实用户点击天然 composed，无此问题
14. **shadow 内的 `<l-m>` 加载占位是 flex item，会参与 gap 布局**——组件模板里用 `<l-m>` 引入子组件时必须同时写 `l-m { display: none; }`，否则它会在内容一侧多占一个 gap，造成左右间距不对称
15. **JS 写的内联样式会压过 `:host([attr])` 的 CSS 规则**——组件用 JS 应用语义色（如 `color` 属性）时，若无条件 `style.background = ...`，会把 outlined/text 等靠属性选择器实现的 variant 外观强制覆盖成填充样式；正确写法是先读当前 variant 再分派（filled：角色色底 + on-角色色字；outlined：透明底 + 角色色字与描边；text：透明底 + 角色色字），并在 variant 的 watch 里重新应用。后续做 icon-button / chip / fab 等带 color 属性的组件时同样适用
16. **`<code>` 标签内的 `{{...}}` 插值不会被 ofa 编译**（现象：字面显示 `{{demoValue}}`，其余绑定正常、无任何报错；原因：ofa 模板编译器对 `code` 元素有特殊处理，跳过其文本绑定；正确写法：用 `<span class="code">` + `font-family: ui-monospace` 模拟等宽样式）
17. **自定义组件的事件处理器里读 `e.target.value` 是 undefined**——ofa 的 attr 数据不在宿主原生 property 上，事件冒泡到宿主时 target 已被重定向；正确写法：组件在 ready 里用 `Object.defineProperty(ele, "value", { get/set })` 把 value 反射到宿主 DOM property（getter 读内部 input、setter 写 input 并 setAttribute），这样 `e.target.value` 与外部 `el.value` 读写都直接可用
18. **`setAttribute` 触发组件 watch 是异步的**（MutationObserver 落到下一轮微任务/帧）——setAttribute 后**同步**读计算样式/ofa data 会得到旧值，极易误判为"改了没生效"；正确验证方式：setAttribute 后 `await` 一下（如 setTimeout 100ms）再断言
19. **ofa `:` 属性绑定写不对 camelCase 的原生属性**（如内部 input 的 `readOnly`）——绑定小写化后落到不存在的属性上；正确写法：声明对应 attr 并在 watch/ready 里用 JS `input.readOnly = this.readonly !== null` 同步
20. **shadow 样式里 `:host:not([attr])` 不生效**——ofa 的样式作用域处理不支持 `:host(...)` 内嵌 `:not()`（静默失效，无报错）；正确写法：反向逻辑，元素默认隐藏（`display: none`），用 `:host([attr="x"])` 正向启用
21. **document 层监听判断"点击组件外部"必须用 `e.composedPath().includes(ele)`，不能用 `ele.contains(e.target)`**——composed 事件（pointerdown/click）冒泡到 document 时，target 已被沿途每层 shadow 边界重定向为最外层宿主（如 `o-page`），`contains` 必然误判为外部；st-select 曾因此弹层被提前关闭、选项 click 落空（表现为"选了没反应"）。另：合成验证（直接 `.click()` 选项）不触发 pointerdown，测不出此类问题，务必用真实点击回归
22. **ofa 的 `:prop` 绑定到 attr 声明的键时会把对象 JSON 序列化写入 attribute**——组件侧 watch 收到的是 JSON 字符串（或解析后的值），不能当作数组直接用；正确写法：组件内 watch 里 `JSON.parse` 后规范化存入内部字段（如 `_opts`），不要存回 ofa attr data（会再次序列化）。同理 `:prop` 绑定到未声明的键则完全不生效
23. **o-fill 把模板条目渲染在自身 light DOM（innerHTML），slot 的 assignedElements 只能看到 O-FILL 容器本身**——宿主组件想消费其中的条目（如 st-select 消费 option），需在 collect 时深入容器查询：`el.querySelectorAll('option')`（light DOM）+ `el.shadowRoot?.querySelectorAll('option')` 双路收集并去重，且要用 MutationObserver 同时观察容器本体与 shadowRoot（childList+subtree）跟随重渲染；只观察 shadowRoot 会漏掉 o-fill 的实际渲染位置
39. **o-router 的 hash 路由以站点根（origin）解析，不相对当前页面目录**——应用放在子目录（如 `docs/`）时，hash 必须带目录前缀：`#/docs/pages/xxx.html`（写 `#/pages/xxx.html` 会去请求 `/pages/xxx.html` 而 404）；`app-config.js` 的 `home` 是相对配置文件的路径不受影响。另：嵌套布局页（parent/slot 模式）里 `routerChange` 不保证触发，侧边栏高亮改用 `ready` + `window.addEventListener("hashchange", ...)` 主动刷新更可靠

40. **JS 动态生成主题会有 FOUC（刷新闪色），治理 = 同步引导 + 双兜底**——模块加载（及其 CDN 依赖）在首帧渲染之后完成，页面先无色再变色。方案：`st-color-init.js` 生成后把主题 CSS 缓存到 localStorage（`st-theme-css`），配套经典同步脚本 `st-boot.js`（head 内引入，页面唯一标签；boot 注入完首帧样式后自动动态加载 st-color-init）刷新时同步注入缓存；首次访问无缓存则同步 `<link>` 静态兜底 `st-default.css`（默认种子色）。要点：a) module 天生 defer，同步注入必须用经典 script（`document.currentScript.parentNode.insertBefore`）；b) st-boot 从自身 src 推导同目录路径，跨路径可用；c) 动态 `<style id="st-dynamic-theme">` 在 head 更靠后，同特异性自然覆盖 boot 注入的样式；d) 依赖库 vendored 到本地（`packages/color/vendor/`）后模块加载不再受外部 CDN 波动影响

41. **组件内布局定位不要用 `getBoundingClientRect`，用 `offsetLeft/Top/Width/Height` 系**——rect 是视口几何，含所有祖先的 transform：导航/指示类组件放在 st-dialog 等带入场动画（scale/translate）的容器里时，初始定位会量到动画中间态（实测：药丸高度被 scale(1,0.5) 压成一半、位置偏移），且**祖先动画结束不会触发自身的 ResizeObserver**，错位就此定格；display:none 祖先下 rect 还全是 0。offset 系是纯布局值，对祖先 transform 与隐藏免疫（隐藏时为 0，正好用来跳过定位、等可见时 ResizeObserver 再触发）。相对定位：element.offsetLeft 相对其 offsetParent（最近 positioned 祖先）的 padding 边缘，与 absolute 子元素在同一 containing block 里的定位基准一致，跨一层 shadow 时逐层相加即可（如 pill 相对 item + item 相对 bar）

42. **`position:fixed` 弹层的 containing block 不保证是视口——transform 祖先会接管它**（实测：st-menu 放进 st-dialog，菜单整体向右下漂移一个对话框面板原点、冲出面板被裁）。原因：st-dialog 面板入场动画 `fill: forwards` 结束后 `::part(panel)` 的 computed transform 保持 `matrix(1,0,0,1,0,0)` ≠ `none`（动画遗产序列化成单位矩阵），按规范它成为所有 fixed 后代的 containing block，组件按视口坐标写的 `left/top` 被重新解释为相对对话框面板 → 双重偏移。排查技巧：光 DOM `parentElement` 链查不到肇事者（slot 内容的布局祖先是宿主 shadow 内部元素），必须沿 `assignedSlot || parentElement` 的 flattened tree 上溯查 computed transform。正确写法（组件侧免疫，任何容器通用）：定位前把弹层摆到 `0,0` 读 `getBoundingClientRect()` 得 containing block 的视口原点，把算好的视口坐标减去该原点再写入——containing block 是视口时差值为 0、行为不变。注意探测时机：同步于 `display:block` 之后、入场动画首帧之前执行才干净（强制布局会把自家动画 from 态 transform 算进探测读数，实测差 `translateY(-0.429em)+scale(0.98)` ≈ 6px/2.6px）；稳妥做法是探测期间 `animation:none`、定位完恢复让动画从头播（st-menu updatePosition 即此实现）。与坑 #41 同族：#41 是量测用 offset 系躲祖先 transform，本条是 fixed 定位坐标系数换算——两者根源都是「transform 祖先改变几何基准」


43. **文档树的 CSS 选择器跨不进 `o-page` / `o-app` 的 shadow，CSS 变量可以**——皮肤曾用 `[data-skin] st-input:focus-within { box-shadow: ... }` 在验收页（组件在 o-page shadow 内）静默失效，但 token 化圆角/背景全部正常。结论：跨 shadow 的换肤机制只能走 CSS 变量（token），宿主选择器与 `::part()` 只对 light DOM 内的组件有效；组件把可换肤的视觉全部写成 `var(--st-xxx, 旧默认值)`。

44. **皮肤规则不要用 `@layer` 包**——实测分层声明会输给 shadow 内未分层的 `:host` 规则（`box-shadow`/焦点环这类宿主级覆盖静默失效），而无层级的外部规则能正常覆盖。皮肤只写 token 时不受影响；若确需宿主级规则，保持无层并用 `:where()` 降低特异性，别用 `@layer`。

45. **自定义属性 `--a: var(--b)` 在声明元素处解析后再继承，祖先 token 不会跟随子元素的内联覆盖**——设计皮肤时若在 `:root` 写 `--st-fill: var(--st-accent)`，子元素 `style="--st-accent: error"` 不会改变 `--st-fill`（它已在 root 处解析成 primary）。需要“跟随语义色”的组合要么用数值 token（`--st-fill-alpha`）在组件端用 `color-mix` 组合，要么把变量声明在组件宿主上。

46. **`applyColor` 无条件清空内联样式会误伤页面定制**——旧 st-button 的 `applyColor()` 在无 `color` 时执行 `style.background = ""` / `color = ""`，把验收页 `<st-button style="background: var(--md-sys-color-error)">` 一起清掉（表现为“内联样式不生效”）。正确写法：只 `removeProperty()` 自己写入的变量（`--st-accent` 等），不要清空整个 style 属性；本次 token 化顺带修复。

47. **`::part()` 不能跨 shadow 边界**——`o-page` 里的 `st-input::part(focus-ring)` 从文档树选不中（part 只能由同一棵树的规则命中）；part 仅作为 light DOM 场景的可选能力保留，换肤机制不要依赖它。

49. **ofa.js v5 下子组件可能晚于父组件升级（ready 时子元素 shadowRoot 仍为 null）**——官网首页用 v5 时 `st-nav-bar` 的 `updateActive()` 在 ready 阶段读 `st-nav-item.shadowRoot.querySelector(".pill")` 直接抛错（两个 nav-bar 两条 pageerror），药丸指示条也不出现。正确写法：测量/定位前守卫子项 `shadowRoot`，缺失时用短定时器重试（nav-bar 已加，最多 20 次 × 50ms）；不要假设父组件 ready 时子组件一定已升级。

50. **SCSR 的 `template[page]` 在脚本执行前是惰性的，“无 JS 可见/首屏 SSR”不成立**——实测禁用 JavaScript 打开 SCSR 页面时正文为空（template 内容不渲染），scsr 只在 JS 执行后把它收编进 o-page shadow；“服务端投递完整 HTML”只保证源码里有全文。需要真正的无 JS 首屏/SEO 时，要在服务端把内容预渲染到 `o-app` 之外（或改用真 SSR/SSG），不要只依赖 template；至少给一个 `<noscript>` 兜底。官网 `site/` 已按此加兜底。

51. **SCSR 多级父页：`parent` 相对子页解析，slot 外层必须相对定位；父页 `routerChange` 才能拿到当前子页**——`site/docs/` 的嵌套布局踩过三个点：a) 组件页 `parent = "./layout.html"`（同目录），docs layout 再 `parent = "../layout.html"`，写成 `../layout.html` 会让组件页跳过二级父页直接挂到站点 layout；b) 同父页组件互切时父页不销毁，侧栏高亮/移动端 picker 要在父页 `routerChange({ current })` 里用 `current.src` 更新（`ready` 时再按 `location.pathname` 兜一次），子页自身不会收到该回调；c) 离场页被路由设为 `position: absolute`，承载 `<slot>` 的容器（如 `.docs-body`）必须 `position: relative`，否则离场页相对视口定位，切换瞬间露出旧页内容，表现为“闪一下”。另外 `::slotted(o-page)` 的入场动画要写在实际发生替换的那层父页里（docs layout），不能只写站点 layout。**（2026-11 更新：切页动画已统一收进 `app-config.js` 的 `pageAnime`，父页不再写动画 CSS，见 #59。）**

52. **在 `o-page` shadow 里取 `getRootNode().host` 会拿到页面容器，不是视觉父元素**——`st-ripple` 原实现 `root.host || parentElement`，直接写进页面 shadow 后所有并列波纹都绑到同一个 `o-page`，点任意示例会同时触发整页所有 ripple（组件验收页同样中招）。正确写法：在组件 shadow 内（host 是 `st-*`）监听 host；host 是 `O-PAGE` / `O-APP` 时改监听最近的 `parentElement`，再兜底 host。页面容器不是“组件宿主”，凡是 ready 里用 `getRootNode().host` 定位交互父级的组件都要防这个坑。

53. **SCSR 的 `::slotted(*) { height:100% }` 来自外层，会盖过页面 `:host` 的尺寸；内部滚动必须多包一层 shell**——官网把 `body` 设为 `overflow:hidden` 并希望整站只在内部容器滚动时，`o-page :host { height:100dvh; display:flex }` 不生效：scsr 在 o-app 的 shadow 里给 slotted 页面写 `display:block;width:100%;height:100%`（外层规则优先于 `:host`），宿主高度继续被内容撑到几千 px，内部容器没有可滚动高度。正确写法：布局内部再包一层 `.shell { height:100dvh; display:flex; overflow:hidden }`，`.site-scroll { flex:1; min-height:0; overflow-y:auto; overscroll-behavior-y:none }`；滚动进度/回到顶部/路由复位都改读这个容器。另：页面入场动画若用 `animation-fill-mode:both` 留下 `transform: matrix(1,0,0,1,0,0)`，该 identity transform 也会成为 `position:fixed` 的包含块，内部滚动后对话框会相对页面对齐错位；移除 fill-mode、动画结束回到 `transform:none`。

54. **`{{...}}` 在 `<pre>` / `<code>` 内不会被解析（ofa 为代码示例保留字面量）**——官网颜色实验室的 `o-fill` 自定义颜色行用 `<code>{{$data.name}}</code>` 显示 token，实际渲染出字面量 `{{$data.name}}`；同一行的 `<span>{{$data.hex}}</span>` 与 `<st-button>{{$data.name}}</st-button>` 都正常。正确写法：需要动态文本的 `<code>` 元素改用 `:text` 指令（如 `<code :text="'--' + $data.name"></code>`），不要把模板表达式写在 code/pre 的文本节点里。

55. **SCSR 站内跳转只解析目标页的 `template[page]`，目标页 body 里的 `<l-m>` 不会执行**——从手记/皮肤页切到文档时，文档页 body 明明有 `list/list.html` 与 `select/select.html` 的 l-m，但左侧目录只显示分组标题、`st-list-item` 全空（组件未升级）；从皮肤页切回首页时，首页只有 layout/皮肤页碰巧加载过的那几个组件能升级，按钮组、选择、开关等大量卡片空白。同样，**目标页 body 里的 module 脚本也不会执行**：从其他栏目切到皮肤页时 `window.__site` 还是上一页的对象，颜色 API / 预览主题缺失，五张卡会全部退回当前全局色。正确写法：① 页面自己的组件依赖放进该页 `<template page>` 内（首页、皮肤、手记与 21 个 docs 页已迁移）；② 全站命令式 API / 主题管理器在持久存在的 `layout.html` 里用 `initSiteApi()` 初始化一次并挂到 `window.__site` / `window.__siteTheme`，页面 body module 只做 `Object.assign` 兜底；③ 共享 layout 共用的依赖在父页模板里再声明一次。不要假设入口页加载过的组件或对象在另一栏目入口时仍然存在。

54. **自定义元素构造/ready 期间不能 setAttribute 宿主属性**——组件 factory 里的 `ready` 在 `document.createElement("st-xxx")` 时也可能执行；此时给宿主 `setAttribute`（role/aria/label 等）会抛 `NotSupportedError: The result must not have attributes`，命令式工具（alert 的 `createElement("st-dialog")`）直接挂掉。正确写法：宿主属性放到 `queueMicrotask` 里写，或移到 `attached`；内部 shadow 元素不受此限制。需要初始状态的组件（progress）用 `_a11yReady` 标志跳过构造期的属性写入，微任务里再统一应用。
55. **内部原生控件的可访问名称不会自动来自 slot 文本**——`.native` 与 label 是兄弟节点，`aria-label` 必须显式同步；宿主上的 `aria-label`/`title` 也要转发给内部控件，否则无障碍树里是空名 button/checkbox。统一用 `packages/a11y/a11y.js` 的 `syncAccessibleName(host, control, { fromSlot })`，并在 detached 里清理 observer。

56. **ofa.js 组件不能直接注册成 form-associated custom element**——生成的类没有 `formAssociated` / `ElementInternals` 钩子，`static formAssociated = true` 加不进去。表单能力用 light DOM 里的原生“代理控件”实现（`packages/form/form-proxy.js`）：`slot="form-proxy"`（没有对应 slot，不会渲染）但仍是 form 后代，承担 name/value/required/pattern/checked。代价：代理会让 `:host(:empty)` 失效，checkbox/switch/radio 必须改用 `has-label` 属性判断标签是否为空；代理不可见，浏览器原生校验气泡不会锚定到组件，组件改为派发 `invalid` 并设置 `aria-invalid`。
57. **shadow 内 button 的 `type=submit/reset` 不会提交外层 form**——原生 button 在 shadow 内没有 `form` 关联，`button.form === null`。正确写法：组件监听内部 button 的 click，用 `closest("form")`（或 `form=""` 引用）找到表单后手动 `requestSubmit()` / `reset()`；同理 form 控件要自己同步 reset 回填。
58. **祖先的 `backdrop-filter` 会成为后代弹层的 backdrop root，弹层毛玻璃“失效”**——给容器（如官网 header）直接加 `backdrop-filter` 后，容器内打开的菜单/提示层即使自身写了 `backdrop-filter: blur(...)`，也只采样容器内部（通常是空的），底下的页面内容完全不糊，表现为“弹层是半透明但没玻璃”。正确写法：把容器自身的毛玻璃放到一个**不是弹层祖先**的层上，例如 `.top::before { position:absolute; inset:0; z-index:-1; backdrop-filter: blur(...) }`，容器本身只留透明背景；弹层保持自己的 `backdrop-filter`。同理，任何承载 `st-menu` / `st-tooltip` / `st-select` 弹层的卡片不要把 `backdrop-filter` 写在卡片自身上。
59. **皮肤 token 在祖先层提前解析 `var(--st-accent)`，`color` 的语义色丢失**——Apple / Windows / shadcn 的输入框聚焦改用皮肤自己的光圈/底线后，`color="error"` 只改了隐藏的内嵌描边，实际焦点仍是主题主色：`--st-field-focus-shadow` 在 `[data-skin]`（html）上声明，其中的 `var(--st-accent)` 在**声明元素**解析，而 `--st-accent` 是组件按 `color` 写在宿主上的，祖先看不到它。正确写法：皮肤只提供几何/透明度 token（`--st-field-focus-gap` / `--st-field-focus-glow-spread` / `--st-field-focus-glow-alpha` / `--st-field-focus-underline-height` / `--st-field-focus-underline-alpha`），颜色在组件 `:host(:focus-within)` 的 `box-shadow` 里用 `var(--st-accent, …)` 现场组合。另注意 `box-shadow: …, none` 会让整条声明失效，中性阴影 token 要用 `0 0 0 0 transparent` 而不是 `none`。
59. **`pageAnime` 的入场过渡会被“先写 next、rAF+5ms 再写 current”折成 0 时长——三态都不要写 `transition`**——给 `next` / `previous` 也带 `transition` 时，浏览器先为起点态起一个过渡（1→0 透明、0→8px 位移），约 5ms 后 `current` 把值改回来，反向合并后过渡时长为 0，页面直接跳到位（实测 `transform` 的 run/start/end 只相隔 1ms，透明度同样瞬间到 1，肉眼看不出淡入）。正确写法：`next` / `previous` 只写起始值（`opacity`、`transform`），`current` 只写目标值；过渡时长不用配——`cr()` 在 `current` 阶段注入 `transition: all .3s`、`lr()` 在离场阶段同样注入，入场/离场自然都是 0.3s。配套两点：`current.transform` 必须显式 `none`（ofa 用 `{...css, ...current}` 叠加，不会清掉 `next` 写的位移）；`prefers-reduced-motion` 若要降级，静态对象不会感知媒体偏好，必须用 getter 返回另一组态（位移关掉，时长缩到 0.01s 而不是 0s——0s 不触发 `transitionend`，离场会多等 350ms 兜底超时）。

## 测试/验证类坑（非 ofa.js）

24. **外部脚本无法直接调用 o-page 页面模块的 proto 方法**——`document.querySelector('o-page').setRole(...)` 报 `not a function`（proto 方法挂在 ofa 实例上，宿主原生元素不可见）；自动化验证时改用真实交互触发（如 Playwright 对 `input[type=color]` fill 色值、直接 click 按钮），ofa 的 `on:input` / `on:click` 处理器正常响应
25. **原生 `<input>`/`<textarea>` 的 `change` 事件不是 composed，穿不出 shadow DOM**——`input` 事件 composed:true 可直接在宿主监听，但 `change`（bubbles:true、composed:false）只到 shadow 边界为止，在宿主/页面监听不到（Playwright 实测确认）；正确写法：组件 ready 里转发 `input.addEventListener("change", () => ele.dispatchEvent(new Event("change", { bubbles: true, composed: true })))`。st-input / st-textarea 已加此转发
26. **Playwright 断言 `page.evaluate(...)` 返回值必须 `await`**——`expect(page.evaluate(...))` 收到的是 Promise 对象，断言必失败且报错信息晦涩（"Received: Promise {}"）；正确写法 `expect(await page.evaluate(...))`
27. **ofa 初始化时也会以初始值触发一次 watch**——组件 attach 后每个 attr 的 watch 都会被调用一次（即便值就是声明的默认值、从未改过）；watch 里若有"值变为 X 时执行副作用"的分支，初始触发会误执行（st-dialog 曾在加载瞬间被 close 分支加上 closing 属性、display 变 grid 闪一下）；正确写法：watch 分支加状态守卫（如 `_wasOpen` 标记，首次 null 触发直接跳过），不要假设 watch 只在真实变更时执行
28. **内部 `.native` 元素要盖住 position:relative 的兄弟元素必须加 z-index**——`.native`（absolute + inset:0）若后面的兄弟（.box/.track/.item）也是 positioned（relative/absolute），后者按 DOM 顺序画在上面，点击会落到兄弟元素上，交互语义失效、表现为"点了没反应"；正确写法：`.native { z-index: 2 }`。另注意 absolute 的包含块：**宿主必须 position:relative**，否则 `.native` 以最近的 positioned 祖先（如菜单面板）为包含块、inset:0 会铺满整个祖先（st-menu-item 曾因此用最后一个 item 的 native 盖住整个面板、所有点击都被它拦截）
32. **高度过渡类组件（collapse）默认 transition 时长必须为 0s，仅用户切换时临时启用；且显隐高度要完全 JS 驱动**——三个连环坑（st-list 二级折叠"诡异缓慢"的完整链条）：
    a) 默认 `transition: height .3s` 会让 ResizeObserver 跟随内容高度的每次更新也被动画化，嵌套折叠时外层"追帧式"追赶内层动画（每帧重设目标、过渡不断重定向）；
    b) **transition shorthand 里第一个时间值是 duration、第二个是 delay**——`transition: height .3s <curve> 0s` 的 `0s` 是 delay，时长仍是 .3s，写成"时长在前来 0 结尾"毫无作用；正确写法 `transition: height 0s <curve>`；
    c) **不能用 `:host([hide]) { height: 0 !important }` 之类的 CSS 强制规则配合异步 watch 设过渡**——属性变化时高度随 CSS 同步瞬变，而 watch（异步，坑 #18）里才设置的 transitionDuration 来不及生效，动画整个跳过；正确写法：去掉 CSS 强制规则，watch hide（守卫初始化触发，坑 #27）里先设 `transitionDuration=".3s"` 再由 JS 设高度（收起设 0 / 展开设内容高），超时后恢复 0s（Punch-UI 原版即此设计）
31. **CSS 变量不能同名自引用累加**——`--x: calc(var(--x, 0px) + 1em)` 在同一元素上声明时 var 指向自身，按规范构成 guaranteed-invalid 循环，整条声明静默失效（computed value 为空，无任何报错），"沿嵌套层级累加缩进"这类需求 CSS 变量链做不到（Punch-UI 用两个变量名交替也只能固定层数）；正确写法：由父组件**自顶向下传播**——在 sublist 插槽的 slotchange 里把"深度+1"推给已分配的子 st-list 并递归通知子项（st-list-item 的嵌套缩进即此方案，每层 `calc(depth * var(--st-list-step, 1em))`），并加 rAF/setTimeout 重推兜底。**注意**：ofa 页面模块（o-page）可能重排甚至复制嵌套组件的 light DOM（parentElement 链断裂、出现同文本的残留副本），自动化验证时不要用 `textContent.includes` 匹配元素（会命中祖先或副本），要用 id 或精确匹配
37. **组件 JS 写自身声明的 attrs 属性会反馈进 ofa attr data，形成自引用死锁**——attrs 声明的属性，JS setAttribute/toggleAttribute 后 ofa 会同步进 attr data，watch 里再读 `this.xxx !== null` 判断"外部是否设置过"就永远为真/假锁死（st-progress 的 indeterminate 推导曾因此失效：一旦按推导挂上属性，自身读到的就是"用户设置了"）。正确写法：推导类状态不要落属性，直接以 JS 内联样式/内部字段表达；确需属性给 CSS 用时，读原始意图要用别的来源
38. **ofa 组件 document.createElement 动态创建可能不升级**——`customElements.get(tag)` 已 defined 但 createElement + append 的实例可能迟迟没有 shadowRoot（初始化机制与 l-m 扫描相关）；自动化测试/工具里需要动态实例时优先用页面预置元素，或创建后轮询 shadowRoot 就绪
36. **fixed 定位的弹层组件不能放在有 transform 的祖先内**——CSS `transform`/`filter`/`perspective`/`will-change` 会创建新包含块，后代的 `position: fixed` 改为相对该祖先定位而非视口：st-dialog 的全屏遮罩会铺不满视口（下方内容"穿透"可点、遮罩错位）。常见触发：做过入场动画且 transform 未清除的容器。正确写法：弹层组件挂在 body 或无 transform 的顶层容器；命令式工具（alert/confirm/prompt）自动 append 到 body 天然规避
35. **"边框扩展成实心底"技巧在过渡与小数字号下会露馅，慎用**——用 border-width 从 2px 扩到半高实现描边→实心填充（Punch-UI switch 的做法）时：a) em 换算在非基准字号（12px/20px）下产生小数像素，取整后在轨道正中露出 1px 底色行；b) 过渡瞬间边框色与底色各自插值，中缝行短暂显示混色。正确写法：改用**恒定描边宽度 + 背景色过渡**（bg 层 border-width 恒定 2px，选中态过渡 background-color），中心区域任何时刻都被背景完整覆盖，无缝隙行；若确需尺寸拼合视觉，必须给被覆盖底层同步同色兜底
34. **display:none 会暂停 CSS 动画，animationend 永不触发**——祖先被 display:none（如菜单面板关闭、对话框隐藏）时子树内的 CSS 动画冻结，animationend/transitionend 不会派发；靠 animationend 清理的元素（如 ripple 的波纹 span）会残留，面板再显示时动画从暂停处"续播"。正确写法：清理逻辑加 setTimeout 兜底（定时器不受 display 影响，先到先清）；同理监听 transitionend 的逻辑（如 collapse 的过渡时长复位）也要有超时兜底
33. **依赖 light DOM 位置/结构的逻辑放 attached 而非 ready**——ready 时元素可能尚未真正进入文档/兄弟结构未稳定（ofa 渐进升级、重排 light DOM），按位置计算（如 button-group 的首尾圆角）会算错；正确写法：attached 里读取 `slot.assignedElements()` 计算并设置，slotchange 时重算。同理 ::slotted(:first-child) 等位置选择器也受此时序影响，位置相关样式改用 JS 设置内联值
30. **ripple 类"监听宿主冒泡事件"的组件必须过滤嵌套组件的事件**——监听在宿主上的 pointerdown/click 会收到从嵌套子组件（子列表项、项内套的 st-button 等）冒泡上来的事件，导致一次点击多层涟漪；正确写法：用 `e.composedPath()` 扫描，路径中在宿主之前出现任何带连字符的自定义元素（tagName 含 "-"）即视为嵌套组件发起，直接跳过（插槽里的普通内容不受影响，仍正常波纹）
29. **组件内同步 disabled 到内部原生元素用 `nativeEle.disabled = this.disabled !== null`**——原生 disabled 天然阻断 click/键盘/焦点，无需手动 stopPropagation；不要用 `:host([disabled]) .native { display:none }` 隐藏（隐藏后阻断逻辑整个消失，宿主级点击照常冒泡）

48. **皮肤切换是异步的：`setSkin()` 只改 `data-skin`，对应 CSS 还要网络加载**——测试里同步读 `getComputedStyle` 会读到旧皮肤（或 M3 默认值），表现为随机失败。正确写法：断言前 `waitForFunction` 等到某个皮肤特征生效（如圆角 `< 7`、`backdropFilter !== "none"`）；本地开发同理，别在点击后立刻截图。

## 测试

Playwright 端到端测试（无构建，走真实浏览器）：

- 用例：`tests/*.spec.js`（覆盖 button/input/textarea/select/checkbox/switch/radio/dialog/menu/tabs/nav/slider/progress/tooltip/card/badges/snackbar/toast/skin/site，以及 `a11y.spec.js` 的无障碍与回归用例）；fixture 页：`tests/fixtures/*.html`（引 CDN ofa.js + st-color-init.js + l-m，`window.events` 记录事件）
- 运行：`npm test`（自动起 `http-server` :8642，禁缓存；须先 `npx playwright install chromium`）
- CI：`.github/workflows/test.yml`（push/PR 时跑 chromium）
- 已知注意：st-input/st-textarea 宿主本身不可聚焦（无 tabindex），焦点在内部 `.native` 上，`el.focus()` 原生调用无效（坑 #24），测试用真实点击聚焦；焦点事件断言用 `focusin`/`focusout`（原生 focus/blur 不冒泡）

## 下一步可能的方向

- 皮肤矩阵截图回归（`m3/apple/windows/shadcn × 组件 × 深浅色`），把“只换材质不换颜色”变成可自动验证的约束
- 皮肤 token 目前是“通用 + 组件”两层，后续可补 `--st-density-*` 统一密度（列表/菜单项/对话框内边距）
- 表单代理目前不支持原生 `<label for>`；如需完整 labelable 语义，需要给 ofa.js 增加 form-associated 支持或在代理上做 id 映射
- 按同样范式继续扩组件（table、autocomplete、date picker 等），新组件从第一天就消费 token 并暴露 part