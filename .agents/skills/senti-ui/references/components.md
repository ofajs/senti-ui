# 组件详解

CDN 前缀：`https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main`（下文 `<l-m>` 的 src 省略前缀，使用时必须补全）。
每个组件的完整文档（完整属性表、插槽、事件、默认值清单、更多示例）在本目录 [components/](./components/) 下对应文件中，如按钮见 [components/button.md](./components/button.md)。
通用规则（所有组件）：布尔属性 JS 用 setAttribute/removeAttribute；`color` 属性值是 M3 角色名或自定义变量名；尺寸默认值全 em，改 `font-size` 等比缩放。

## st-button 按钮

- 属性：`variant`（`filled`(默认)/`outlined`/`text`）、`color`、`disabled`、`loading`（spinner + 自动禁用）、`type`
- 插槽：默认（文字）、`prefix` / `suffix`
- 事件：`click` 直接在宿主监听（内部原生 button 转发，Enter/Space/Tab 天然可用）
- 示例：`<st-button color="error" variant="outlined"><span slot="prefix">🔍</span>Search</st-button>`

## st-button-group 按钮组

- 属性：`connected`（连体）、`full-width`（等分）；圆角由 JS 按位置自动设置

## st-split-button 分裂按钮

- 主区 click 冒泡做主操作 + 箭头区开合菜单（菜单项用 `st-menu-item`）
- `open` 为运行时状态，支持 `sync:open`

## st-icon-button 图标按钮

- 属性：`variant`（`standard`(默认)/`filled`/`tonal`/`outlined`）、`color`（tonal 消费 container 配对 token）、`disabled`
- 插槽：默认（图标，建议 1.571em 见方）
- **必须配 `title` / `aria-label`**（无文字）

## st-input 单行输入框

- 属性：`variant`（`outlined`(默认)/`filled`）、`default-value`、`placeholder`、`type`、`color`（caret 与 focus 边框色，常用 `error`/`success` 表校验态）、`disabled`、`readonly`
- **`value` 是运行时状态**：JS 用 `el.value` 读写（已反射到宿主 property，`e.target.value` 可用）；`setAttribute("value")` 无效
- 插槽：`prefix` / `suffix`
- 事件：`input` / `change`（已转发为 composed）直接在宿主监听；方法 `focus()` / `blur()`

## st-textarea 多行输入框

- 与 st-input 同范式；额外：`rows`（内部 textarea 自撑高度）、`autosize`（按内容自动撑开，rows 为最小高度）
- `value` 运行时状态，`default-value` 初始值

## st-select 单选下拉框

- 属性：`variant`（`outlined`(默认)/`filled`）、`default-value`、`placeholder`、`color`、`disabled`
- **`value` 是运行时状态**（`el.value` 读写）
- 选项写在 light DOM 原生 `<option>`（value 缺省取文本；option 内可嵌 HTML，渲染到下拉项）
- 弹层：自绘 M3 风格，自动上下弹翻转、键盘 ↑↓/Enter/Escape/Home/End、点外关闭；`change` composed
- 限制：弹层在 shadow 内，被 overflow 祖先裁剪；动态选项支持 `el.options = [...]` / `:options` / o-fill 嵌套

## st-dialog 对话框

- **结构例外**：宿主是全屏遮罩（fixed + 居中），面板在 shadow 内 `part="panel"`——宽高/圆角/底色用 `::part(panel)` 定制（如 `st-dialog::part(panel) { width: 400px; }`）
- 属性：`auto-close`（遮罩点击/Escape 关闭并派发 `close`）
- **`open` 是运行时状态**：推荐 `sync:open="xxx"` 双向绑定（auto-close 关闭自动回写）；兼容 `setAttribute("open","")` / `removeAttribute("open")`
- 插槽：`headline` / 默认 / `actions`（空区块自动隐藏）
- 焦点：打开时自动移入面板；M3 emphasized 动效
- 命令式工具（无需预引入组件）：

```js
import stAlert from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/dialog/alert.js";
import stConfirm from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/dialog/confirm.js";
import stPrompt from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/dialog/prompt.js";
const ok = await stConfirm("确认删除？"); // true/false/null（null=被关闭）
const name = await stPrompt("你的名字", "默认值"); // 值/null
await stAlert("完成"); // true/null
```

- 坑：不要放在有 transform/filter 的祖先内

## st-checkbox / st-switch / st-radio 表单选择类

统一范式：内部透明原生 input 承载点击/Space/焦点，变更后反射回宿主属性并派发 `change`（composed）。

- 属性：`checked`（checkbox 另有 `indeterminate`）、`color`（选中态换角色色）、`disabled`
- radio：同组互斥依赖**同一父容器**内的同 `name` 兄弟
- 用法：`<st-checkbox checked on:change="...">`；JS 用 `setAttribute("checked","")` / `removeAttribute("checked")`

## st-snackbar 消息条

- 属性：`open`、`duration`（毫秒，到时自动关闭派发 `close`）、`color`（底色为角色色、文字 on-角色色）
- 插槽：默认（消息）、`action`（建议放 `st-button variant="text"`）
- 方法：`el.hide()` 主动关闭（派发 close）
- `stToast` 命令式工具（无需预引入）：

```js
import stToast from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/snackbar/toast.js";
const t = stToast("已保存", { duration: 3000 }); // 返回 { close, el }；duration 0 = 手动
```

## st-slider 滑块

- 属性：`min`/`max`/`step`（默认 0/100/1，转发原生 range）、`default-value`、`disabled`、`color`
- **`value` 是运行时状态**（`el.value`；ofa 页面绑定 `attr:value`）
- 事件：`input`（拖动实时）、`change`（松手/键盘提交），均 composed
- 键盘：Tab 聚焦、`←/→` 步进、`Home/End` 到两端；拖动/聚焦显示数值气泡

## st-progress 进度

- 线形/环形 × 确定/不定四态；属性：`circular`（环形，缺省线形）、`indeterminate`（不定；设置后 `value` 被忽略）、`value`（0-100，缺省且无 indeterminate 时自动视为不定）、`color`
- 示例：`<st-progress value="60">`、`<st-progress circular indeterminate color="error">`

## st-tooltip 提示

- 属性：`content`（纯文本，防注入）、`disabled`
- **`open` 是运行时状态**（`sync:open` / setAttribute 兼容）
- 悬停或聚焦触发器显示；气泡 fixed 自动上下翻转；触发器需可聚焦（如 st-button）
- 不承载关键信息（触屏无悬停）

## st-card 卡片

- 属性：`variant`（`elevated`(默认)/`filled`/`outlined`）、`interactive`（可点击：hover 抬升 + 波纹 + click 冒泡，内部原生 button 承载键盘焦点）
- 插槽：默认（自由组合）；卡内放交互元素时避免 `interactive`

## st-badges 徽标

- 点 / 数字（`max` 封顶显示 `N+`）/ 文字徽标，钉在默认插槽元素右上角，pointer-events none

## st-collapse 折叠容器

- 属性：`hide`（收起）；高度过渡跟随内容（ResizeObserver）
- 用法：`<st-collapse>内容</st-collapse>`，JS 切换 `hide` 属性开合

## st-list / st-list-item 列表

- item 属性：`button`（state layer + 波纹 + click）、`disabled`、`collapsible + expanded`（内嵌折叠 sublist）
- item 插槽：`prefix` / `suffix` / `secondary`（副文本）
- 首尾项自动大圆角

## st-menu / st-menu-item 下拉菜单

- `st-menu` 属性：`align`（`right`(默认)/`left`，面板与触发器水平对齐）；插槽：`trigger`（触发器）+ light DOM 菜单项 `st-menu-item`
- `open` 运行时状态；面板 fixed 定位 JS 计算（翻转避让视口）
- 点外部 / Escape / 选中自动关闭；事件 `open` / `close`
- item 属性：`disabled`；菜单文字直接写在 item 内

## st-tab-bar / st-tab-item 标签栏 与 st-nav-bar / st-nav-item 导航栏

- item 的 `active` 切换由**外部逻辑**处理（click 冒泡传出，on:click 里切换数据）；bar 用指示条/药丸动画跟随 active 项

## st-ripple 波纹

- 点击波纹，放在 `position: relative` 的父元素内使用，波纹色 currentColor
- st-button 等已内嵌，无需重复添加
