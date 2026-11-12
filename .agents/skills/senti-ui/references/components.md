# 组件详解

引入地址均为完整 jsdelivr URL（`https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/...`），可直接使用。
每个组件的完整文档（完整属性表、插槽、事件、默认值清单、更多示例）在本目录 [components/](./components/) 下对应文件中，如按钮见 [components/button.md](./components/button.md)。
通用规则（所有组件）：属性读写遵守 SKILL.md 的「写法优先级」（ofa API 优先，`attr(name, 值/""/null)`）；`color` 属性值是 M3 角色名或自定义变量名；尺寸默认值全 em，改 `font-size` 等比缩放。

## 皮肤 st-skin（材质层）

- `m3`（默认）/ `apple`（毛玻璃）/ `windows`（Windows 11 / Fluent：Mica + Acrylic）/ `shadcn`（扁平）/ `cyberpunk`（零圆角霓虹终端）；只改材质，颜色仍走 M3
- 切换：`import { setSkin } from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/skin/st-skin.js"; setSkin("apple")`；静态：`<html data-skin="apple">` + `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/skin/apple.css">`
- 已接入全部交互与表面组件；token / part 表与自定义皮肤见 [components/skin.md](./components/skin.md)

## st-button 按钮

- 属性：`variant`（`filled`(默认)/`outlined`/`text`）、`color`、`disabled`、`loading`（spinner + 自动禁用）、`type`
- 插槽：默认（文字）、`prefix` / `suffix`
- 事件：`click` 直接在宿主监听（内部原生 button 转发，Enter/Space/Tab 天然可用）
- 示例：`<st-button color="error" variant="outlined"><span slot="prefix">🔍</span>Search</st-button>`
- 皮肤：已 token 化（高度/圆角/阴影/毛玻璃/焦点环等），part：`state-layer` / `loader` / `control`

## st-button-group 按钮组

- 属性：`connected`（连体）、`full-width`（等分）；圆角由 JS 按位置自动设置
- 可作选择器：`attr:variant="state === 'x' ? 'filled' : 'outlined'"` + `on:click="state = 'x'"`（详见 [components/button.md](./components/button.md)）

## st-split-button 分裂按钮

- 主区 click 冒泡做主操作 + 箭头区开合菜单（菜单项用 `st-menu-item`）；菜单面板 `role=menu`，↑/↓ 移动焦点，Escape 只关菜单
- `open` 为运行时状态，支持 `sync:open` / `attr("open", "")`；`menu-label` 可改箭头区可访问名称

## st-icon-button 图标按钮

- 属性：`variant`（`standard`(默认)/`filled`/`tonal`/`outlined`）、`color`（tonal 消费 container 配对 token）、`disabled`
- 插槽：默认（图标，建议 1.571em 见方）
- **必须配 `title` / `aria-label`**（无文字）

## st-input 单行输入框

- 属性：`variant`（`outlined`(默认)/`filled`）、`default-value`、`placeholder`、`type`、`color`（caret 与 focus 边框色，常用 `error`/`success` 表校验态）、`disabled`、`readonly`
- **`value` 是运行时状态**：JS 用 `el.value` 读写（已反射到宿主 property，`e.target.value` 可用）；`setAttribute("value")` 无效
- 插槽：`prefix` / `suffix`
- 事件：`input` / `change`（已转发为 composed）直接在宿主监听；方法 `focus()` / `blur()`
- 皮肤：已 token 化（圆角/背景/焦点环/外侧光圈等），part：`focus-ring` / `underline` / `control`

## st-textarea 多行输入框

- 与 st-input 同范式；额外：`rows`（内部 textarea 自撑高度）、`autosize`（按内容自动撑开，rows 为最小高度）
- `value` 运行时状态，`default-value` 初始值

## st-select 单选下拉框

- 属性：`variant`（`outlined`(默认)/`filled`）、`default-value`、`placeholder`、`color`、`disabled`
- **`value` 是运行时状态**（`el.value` 读写）
- 选项写在 light DOM：原生 `<option>` 或 `<st-option>` 组件（随 select.html 自动加载，无需单独引入）
  - `label` 属性（两者都支持）控制闭合态显示文本；`value` 缺省先取 `label` 再取文本
  - 富内容（内部 span/自定义元素）推荐 `st-option`：`value`/`label` 属性 + 默认插槽克隆渲染到下拉项
- 弹层：自绘 M3 风格，自动上下弹翻转、键盘 ↑↓/Enter/Escape/Home/End、点外关闭；`change` composed
- 无障碍：`role="combobox"` + `aria-expanded/controls/activedescendant`，弹层 `listbox` / 选项 `option`；disabled 移出 Tab 顺序
- 限制：弹层在 shadow 内，被 overflow 祖先裁剪；动态选项支持 `el.options = [...]` / `:options` / o-fill 嵌套（已渲染选项改属性不生效）

## st-dialog 对话框

- **结构例外**：宿主是全屏遮罩（fixed + 居中），面板在 shadow 内 `part="panel"`——宽高/圆角/底色用 `::part(panel)` 定制（如 `st-dialog::part(panel) { width: 400px; }`）
- 属性：`auto-close`（遮罩点击/Escape 关闭并派发 `close`）
- **`open` 是运行时状态**：推荐 `sync:open="xxx"` 双向绑定（auto-close 关闭自动回写）；纯 JS 用 `$("st-dialog").attr("open", "") / attr("open", null)`
- 插槽：`headline` / 默认 / `actions`（空区块自动隐藏）
- 焦点：`role="dialog"` + `aria-modal`，打开移入面板、Tab 焦点陷阱、关闭归还焦点、背景滚动锁；M3 emphasized 动效
- 命令式工具（无需预引入组件）：

```js
import alert from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/dialog/alert.js";
import confirm from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/dialog/confirm.js";
import prompt from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/dialog/prompt.js";
const ok = await confirm("确认删除？"); // true/false/null（null=被关闭）
const name = await prompt("你的名字", "默认值"); // 值/null
await alert("完成"); // true/null
```

- 坑：不要放在有 transform/filter 的祖先内

## st-drawer 侧边抽屉

- **结构**：宿主是全屏遮罩（fixed），面板在 shadow 内 `part="panel"`；默认左侧滑入，`side="right"` 改为右侧滑入
- 属性：`auto-close`（遮罩点击 / Escape 关闭并派发 `close`）、`side`（`left`(默认) / `right`）
- **`open` 是运行时状态**：ofa 页面用 `sync:open="xxx"` 双向绑定（auto-close 关闭自动回写）；纯 JS 用 `$("st-drawer").attr("open", "") / attr("open", null)`
- 插槽：`headline` / 默认 / `actions`（空区块自动隐藏；正文区超高时内部滚动）
- 焦点：`role="dialog"` + `aria-modal`，打开移入面板、Tab 焦点陷阱、关闭归还焦点、背景滚动锁；与 st-dialog 共用模态栈，Escape 只关最上层
- 面板定制：`st-drawer::part(panel) { width: 360px; }`；part：`panel` / `scrim` / `headline` / `body` / `actions`
- 皮肤 token：`--st-drawer-bg` / `--st-drawer-radius` / `--st-drawer-border` / `--st-drawer-shadow` / `--st-drawer-padding` / `--st-drawer-gap` / `--st-drawer-backdrop-filter` / `--st-drawer-scrim` / `--st-drawer-scrim-filter` / `--st-drawer-enter-duration` / `--st-drawer-exit-duration`

```html
<st-drawer sync:open="drawerOpen" auto-close side="left">
  <h2 slot="headline">导航</h2>
  <p>抽屉内容</p>
  <div slot="actions">
    <st-button variant="text" on:click="drawerOpen = false">关闭</st-button>
  </div>
</st-drawer>
```

完整属性表、默认值与示例见 [components/drawer.md](./components/drawer.md)。

## st-checkbox / st-switch / st-radio 表单选择类

统一范式：内部透明原生 input 承载点击/Space/焦点，变更后反射回宿主属性并派发 `change`（composed）。

- 属性：`checked`（checkbox 另有 `indeterminate`，混合态不参与表单提交）、`color`（选中态换角色色）、`disabled`
- radio：同组互斥按**同一树作用域 + 同一 form owner** 的同 `name` 隔离；组内 roving tabindex + 方向键移动/选中
- switch 内部原生控件带 `role="switch"`
- 用法：`<st-checkbox checked on:change="...">`；JS 用 `$("st-checkbox").attr("checked", "") / attr("checked", null)`
- `checked` / `selected` / `expanded` 是 attrs：内部交互只能 setAttribute/removeAttribute，无法回写 `sync:`；双向场景监听 `change`，把 `el.hasAttribute(...)` 写回 data

## st-snackbar 消息条

- 属性：`open`、`duration`（毫秒，到时自动关闭派发 `close`）、`color`（底色为角色色、文字 on-角色色）
- 插槽：默认（消息）、`action`（建议放 `st-button variant="text"`）
- 方法：`el.hide()` 主动关闭（派发 close）
- `toast` 命令式工具（无需预引入）：

```js
import toast from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/snackbar/toast.js";
const t = toast("已保存", { duration: 3000 }); // 返回 { close, el }；duration 0 = 手动
```

## st-slider 滑块

- 属性：`min`/`max`/`step`（默认 0/100/1，转发原生 range）、`default-value`、`disabled`、`color`、`name`/`form`（原生表单）
- **`value` 是运行时状态**（`el.value`；ofa 页面绑定 `attr:value`）
- 事件：`input`（拖动实时）、`change`（松手/键盘提交），均 composed
- 键盘：Tab 聚焦、`←/→` 步进、`Home/End` 到两端；拖动/聚焦显示数值气泡
- 表单：`name` + `form` 进 `FormData`，`reset` 回 `default-value` / `min`；`required` 对 range 无实际约束

## st-progress 进度

- 线形/环形 × 确定/不定四态；属性：`circular`（环形，缺省线形）、`indeterminate`（不定；设置后 `value` 被忽略）、`value`（0-100，缺省且无 indeterminate 时自动视为不定）、`color`
- 示例：`<st-progress value="60">`、`<st-progress circular indeterminate color="error">`

## st-tooltip 提示

- 属性：`content`（纯文本，防注入）、`disabled`
- **`open` 是运行时状态**（`sync:open` / setAttribute 兼容）
- 悬停、聚焦或触屏长按 500ms 显示；点外部 / Escape 关闭；气泡 fixed 自动上下翻转；触发器需可聚焦（如 st-button）
- 不承载关键信息

## st-card 卡片

- 属性：`variant`（`elevated`(默认)/`filled`/`outlined`）、`interactive`（可点击：hover 抬升 + 波纹 + click 冒泡，内部原生 button 承载键盘焦点）
- 插槽：默认（自由组合）；卡内放交互元素时避免 `interactive`

## st-chat / st-chat-message 对话

- `st-chat` 包裹消息：`auto-scroll`（`auto`(默认，贴底才跟随)/`always`/`off`）、`label`；插槽 `header` / `footer` / `empty`；必须给高度（`style="height:420px"`）才内部滚动
- `st-chat-message` 属性：`from`（`assistant`(默认)/`user`/`system`）、`name`、`time`、`avatar`、`status`、`streaming`（流式光标/空内容呼吸点）、`error`；插槽 `avatar` / `actions`
- 数据流三种：light DOM 组合、ofa `o-fill` + `fill-key="id"`（推荐；流式替换最后一条并保持 id）、宿主 `el.messages` 对象数组（纯文本，兼容 `from`/`role`）
- `el.scrollToEnd({ smooth })` 滚到底部；`streaming` 内容为空时显示三个呼吸点；新消息自动入场动画
- 示例：`<st-chat style="height:420px"><st-chat-message from="assistant" name="Senti" streaming>…</st-chat-message></st-chat>`
- 皮肤 token：`--st-chat-*`；part：`viewport` / `list` / `header` / `footer` / `empty` / `scroll-button` 与 `avatar` / `bubble` / `meta` / `name` / `time` / `content` / `actions` / `status`

## st-markdown Markdown 渲染

- 属性：`default-value`、`streaming`（光标 + `aria-busy`）、`breaks`（段内单换行转 `<br>`）
- 运行时：`el.value`（Markdown 源码）、`el.appendMarkdown(delta)`；初始源码优先级 value > default-value > textarea > template > 默认插槽
- 支持标题 / 列表（含嵌套、任务）/ 引用 / 围栏代码块（语言标签 + 复制，复用 st-code 高亮）/ GFM 表格 / 行内代码 / 粗斜删除线 / 链接图片 / 自动链接；原始 HTML 转义，链接协议白名单
- 流式：rAF 合并渲染；未闭合代码块渲染到末尾，未完成表格 / 行内标记先按字面显示；`copy` 事件 detail `{code, lang}`
- 示例：`<st-markdown :value="answer"></st-markdown>`；在 st-chat-message 内只给 message 设 `streaming`
- 皮肤 token：`--st-markdown-*`；part：`content` / `p` / `h1`–`h6` / `pre` / `code` / `copy` / `table` 等

## st-badges 徽标

- 点 / 数字（`max` 封顶显示 `N+`）/ 文字徽标，钉在默认插槽元素右上角，pointer-events none

## st-chip 筛选小片

- 属性：`variant`（`assist`(默认)/`filter`/`input`）、`removable`（尾部 ✕）、`disabled`、`color`
- `selected` 是运行时状态：ofa 页面 `sync:selected="x"` 双向绑定；纯 JS `$("sel").attr("selected", "")` / `attr("selected", null)`，读 `el.selected`
- 事件：`click` / `change`（选中切换）/ `remove`（点 ✕，不触发 click，也不自动移除节点——收到后自己删）
- 示例：`<st-chip variant="filter" sync:selected="picked" on:change="picked = !picked">音乐</st-chip>`
- 键盘：assist/filter 宿主自身 role=button，Tab 可达、Enter/Space 切换；皮肤 token：`--st-chip-*`，part：`remove`

## st-avatar 头像

- 纯展示圆形头像；内容来源：`src` 图片 > `image` 插槽 > 默认插槽文字缩写；`alt` 自动转发宿主 `aria-label` 与内部 img
- 属性：`src`、`alt`、`color`（默认 secondary-container 配对）；无 size 属性——`font-size` 等比或直接写 width/height
- 示例：`<st-avatar color="primary" style="font-size: 24px;">AI</st-avatar>`
- 皮肤 token：`--st-avatar-*`，part：`image`

## st-skeleton 加载占位

- 纯展示骨架占位：`shape`（`text`(默认 整行 1em)/`circle` 正圆/`rect` 大块 60px）；宽高一律原生 CSS 覆写
- opacity 呼吸动画（1.6s 循环），prefers-reduced-motion 自动静止；数据到达后用真实内容替换节点（ofa 页面配合 `o-if` 切骨架/内容）
- 示例：`<st-skeleton shape="circle" style="width:48px;height:48px;"></st-skeleton>`
- 皮肤 token：`--st-skeleton-*`；无交互无事件

## st-collapse 折叠容器

- 属性：`hide`（收起）；高度过渡跟随内容（ResizeObserver）
- 用法：`<st-collapse>内容</st-collapse>`，JS 切换 `hide` 属性开合

## st-list / st-list-item 列表

- item 属性：`button`（state layer + 波纹 + click）、`disabled`、`collapsible + expanded`（内嵌折叠 sublist）
- item 插槽：`prefix` / `suffix` / `secondary`（副文本）
- 首尾项自动大圆角

## st-menu / st-menu-item 下拉菜单

- `st-menu` 属性：`align`（`right`(默认)/`left`，面板与触发器水平对齐）、`keep-open`（点击项后不关，用于多选）；插槽：`trigger`（触发器）+ light DOM 菜单项 `st-menu-item`
- `open` 运行时状态；面板 fixed 定位 JS 计算（翻转避让视口）
- 点外部 / Escape / 选中自动关闭（`keep-open` 时点项不关）；事件 `open` / `close` / `change`
- item 属性：`disabled`、`checkable`、`selected`；菜单文字直接写在 item 内
- 可勾选菜单：`<st-menu-item checkable selected>`，点击切换 `selected` 并派发 `change`；`role=menuitemcheckbox` + `aria-checked`
- 多级子菜单：`st-menu` 放在 item 的 `sub-menu` 插槽内，箭头自动显示、hover 展开、选中任意项整链关闭
- 右键菜单：`openAt(x, y)`（ofa 页面在 `on:contextmenu` 里 `e.preventDefault()` 后调）；面板自动翻转避让视口
- `contextMenu` 命令式工具（无需预引入）：`await contextMenu(e, [{id,label,prefix,suffix,disabled,children},{separator:true}])` → 点击的叶子项 id / 取消 null，菜单挂 body 用完即毁；移动端 `contextMenu.longPress(el, items, onSelect)` 长按 500ms 呼出（触屏子菜单为点击开合，无 hover）

```js
import contextMenu from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/menu/context-menu.js";
const id = await contextMenu(e, [{ id: "copy", label: "复制" }, { separator: true }, { id: "del", label: "删除", disabled: true }]);
```

## st-tab-bar / st-tab-item 标签栏 与 st-nav-bar / st-nav-item 导航栏

- item 的 `active` 切换由**外部逻辑**处理（click 冒泡传出，on:click 里切换数据）；bar 用指示条/药丸动画跟随 active 项

## st-nav-layout 响应式导航布局

- 插槽：`nav`（放 `st-nav-bar`）+ 默认（内容区，可滚动）；高度依赖外部给定（如 `height: 100vh`）
- 形态属性分属两层：`vertical` 在 `st-nav-bar` 上（子项排列方向），`parallel` 在各 `st-nav-item` 上（文字在 icon 右、active 整行药丸），两者独立组合
- 单独用横向顶部导航：`st-nav-bar` 保持默认横向，每个 `st-nav-item` 加 `parallel`（icon 左 / 文字右、active 整行药丸）；不需要 `st-nav-layout`
- 按布局容器**自身宽度**（container query）三档切换：`<768px` 底部导航 / `768–1023px` 平板——仍在底部、各 item 自动挂 `parallel`（横排）/ `≥1024px` 左侧窄 rail——bar 自动挂 `vertical`、item 摘 `parallel`（icon 上/文字下）
- 单独用纵向导航：`<st-nav-bar vertical>` 即可
- 引入：`<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/navigation/nav-layout.html"></l-m>`

## st-ripple 波纹

- 点击波纹，放在 `position: relative` 的父元素内使用，波纹色 currentColor
- st-button 等已内嵌，无需重复添加

## st-code 代码块

- 属性：`lang`（`html`(默认)/`js`/`ts`/`css`/`less`/`sass`）、`title`、`code`、`format`（`auto`(默认)/`off`）、`frame`（浏览器外壳；默认只有代码）
- 源码用 `<textarea hidden>`（RCDATA，推荐）、`<template>`（惰性但会序列化）或 `code` 属性 / `:code`；不要直接放 light DOM 子节点（script 会执行）
- 自动格式化：HTML/JS/TS/CSS/Less 走内置 js-beautify；Sass 只去公共缩进；复制按钮内置，复制后派发 `copy`
- 颜色走 M3 角色；皮肤 token：`--st-code-*`；part：`shell` / `header` / `title` / `copy` / `body` / `pre` / `code`

## st-theme-mode 全局主题模式工具（无需预引入）

模式偏好持久化在 localStorage key `st-theme-mode`（`auto` / `light` / `dark`）；`st-boot.js` 首帧同步挂 `st-light` / `st-dark` 类，`st-color-init.js` 自动引入本模块，跨窗口经 `storage` 事件实时跟随——同域引入 st-boot 或任一 st-* 组件的页面全部自动生效（详见 theming.md）。

```js
import { getThemeMode, setThemeMode, applyThemeMode } from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/color/st-theme-mode.js";
setThemeMode("dark"); // 持久化 + 当前文档立即生效；其他窗口自动跟随
```
