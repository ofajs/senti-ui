# CONTEXT.md — 项目上下文

> 新进本仓库的 AI 请先读完本文档，开发规则见 [AGENTS.md](./AGENTS.md)，具体组件用法见 `packages/{name}/README.md`。

## 项目是什么

Senti-UI 是一个**面向 AI 的 UI 组件库**，基于 **ofa.js**（Web Components 框架），颜色体系采用 **Google Material Design 3（M3）**。无构建、纯静态，CDN 引入即用。

## 核心理念（与传统组件库的本质区别）

传统组件库为人设计大量"便利预设"（`size="small"`、`color="primary"` 这类枚举）。对 AI 来说这些没有价值——AI 直接写 style/CSS 更精确灵活，预设只是多余的记忆负担。因此本库：

- **属性只表达语义**（disabled / loading / M3 规范内的 variant / `color` 语义色引用），**外观直接用原生 CSS 属性定制**——`color` 属性的值是 M3 角色名或 color 模块自定义变量名（如 `color="brand"` 消费 `--brand/--on-brand`），与 color 工具联动实现一键换色，它引用的是语义而非样式预设——组件视觉全部定义在 `:host` 上，`style="height:32px; border-radius:8px"` 直接生效，不发明 `--st-*` 样式代理变量；交互语义由内部透明原生元素（`.native` 模式）承载
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
<script type="module" src="/packages/color/st-init.js"></script>
```

`st-init.js` 是项目初始化模块（取代了原静态 `css/st-m3.css`）：读取 color 工具保存在 localStorage 的配置（种子色/角色覆盖/自定义变量），动态生成完整 M3 体系并注入 `<style>`——**在 color 工具里调好配色，全站页面（同域）自动跟随**；无保存配置时用默认种子色 `#0061A4`。体系默认注入内置扩展角色 `success`（`--md-sys-color-success` / `on-success` / `success-container` / `on-success-container`，默认绿色 `#006E1C` 按 M3 tone 规则推导，不随主种子色变化，可在工具中覆盖）。主题切换：默认跟随系统；强制用 `<html class="st-light">` / `<html class="st-dark">`。注意：颜色在 JS 执行后生效（有极短未上色闪烁），且依赖 CDN 上的 material-color-utilities。

## 组件清单

| 组件 | 标签 | 引入 | 文档 |
|------|------|------|------|
| Button 按钮 | `st-button` | `<l-m src="/packages/button/button.html"></l-m>` | [packages/button/README.md](./packages/button/README.md) |
| Input 单行输入框 | `st-input` | `<l-m src="/packages/input/input.html"></l-m>` | [packages/input/README.md](./packages/input/README.md) |
| Textarea 多行输入框 | `st-textarea` | `<l-m src="/packages/textarea/textarea.html"></l-m>` | [packages/textarea/README.md](./packages/textarea/README.md) |
| Select 单选下拉框 | `st-select` | `<l-m src="/packages/select/select.html"></l-m>` | [packages/select/README.md](./packages/select/README.md) |
| Dialog 对话框 | `st-dialog` | `<l-m src="/packages/dialog/dialog.html"></l-m>` | [packages/dialog/README.md](./packages/dialog/README.md) |
| Checkbox 复选框 | `st-checkbox` | `<l-m src="/packages/checkbox/checkbox.html"></l-m>` | [packages/checkbox/README.md](./packages/checkbox/README.md) |
| Switch 开关 | `st-switch` | `<l-m src="/packages/switch/switch.html"></l-m>` | [packages/switch/README.md](./packages/switch/README.md) |
| Radio 单选按钮 | `st-radio` | `<l-m src="/packages/radio/radio.html"></l-m>` | [packages/radio/README.md](./packages/radio/README.md) |
| Snackbar 消息条 | `st-snackbar` | `<l-m src="/packages/snackbar/snackbar.html"></l-m>` | [packages/snackbar/README.md](./packages/snackbar/README.md) |
| Collapse 折叠容器 | `st-collapse` | `<l-m src="/packages/collapse/collapse.html"></l-m>` | [packages/collapse/README.md](./packages/collapse/README.md) |
| List 列表 | `st-list` / `st-list-item` | `<l-m src="/packages/list/list.html"></l-m>` | [packages/list/README.md](./packages/list/README.md) |
| Menu 下拉菜单 | `st-menu` / `st-menu-item` | `<l-m src="/packages/menu/menu.html"></l-m>` | [packages/menu/README.md](./packages/menu/README.md) |
| Tabs 标签栏 | `st-tab-bar` / `st-tab-item` | `<l-m src="/packages/tabs/tab-bar.html"></l-m>` | [packages/tabs/README.md](./packages/tabs/README.md) |
| Navigation 导航栏 | `st-nav-bar` / `st-nav-item` | `<l-m src="/packages/navigation/nav-bar.html"></l-m>` | [packages/navigation/README.md](./packages/navigation/README.md) |
| Ripple 波纹 | `st-ripple` | `<l-m src="/packages/ripple/ripple.html"></l-m>` | [packages/ripple/README.md](./packages/ripple/README.md) |

组件包结构：`{name}.html`（组件）+ `index.html`（验收页加载器）+ `page.html`（ofa.js 页面模块，承载验收页逻辑）。

### 代码层级规范（页面/验收页/示例通用）

写页面模块（page.html）与示例代码时，API 选择有严格优先级：

1. **优先 ofa.js 模板渲染语法**——数据绑定 `{{xxx}}`、属性绑定 `attr:xxx="expr"`（布尔属性必须 `attr:` 不能 `:prop`）、事件绑定 `on:click="method"`（根级直接写方法名，o-fill 内才用 `$host.`）、列表 `o-fill`、计算属性放 **proto 上的 `get`**（放模块顶层会导致页面模块加载失败且报错被吞，只显示"Loading page module failed"）
2. **其次 ofa.js API**——`this.xxx = ...` 改数据驱动视图（不要手动 setAttribute/DOM 操作）、`sync:` 双向绑定、`this.emit()` 自定义事件
3. **最后才用原生 DOM API**——仅当 ofa 没有对应能力（如 ResizeObserver、document 级监听、getBoundingClientRect 量取）

典型对照：打开对话框用 `attr:open="openState.basic"` + `on:click="openDlg('basic')"`（数据驱动），而不是 ready 里 `addEventListener` + `setAttribute`；动态行列表用 `o-fill :value="lines"`，而不是 `insertAdjacentHTML`。**禁止**在 ready 里用 `this.ele.shadowRoot.querySelector(...).addEventListener(...)` 挂事件——这是 ofa 页面模块，模板语法天然覆盖。

### 验收页（page.html）规范

验收页是组件的**标签用法说明书**，AI（和人）看一眼就该知道每种用法怎么写。必须覆盖：

- **完整展示组件标签的各种用法**：每个属性（尤其是 `color` 类枚举值——primary / secondary / tertiary / error / success 及自定义变量）、每个插槽、每种 variant，都要有对应的**真实标签示例**直接写在页面里，而非只靠文字说明
- 纯展示类组件（snackbar 等）直接静态渲染（加 `open` 之类属性），不要为了"演示"写 JS 触发逻辑；有交互语义的（dialog / menu 等）才用按钮触发
- 视觉定制能力（原生 CSS 属性覆盖、`font-size` 等比缩放、`::part()`）各给一两个示例
- 交互/事件类组件给一个最小的事件反馈（如计数展示），让验证者无需打开控制台

## 工具

| 工具 | 说明 | 入口 |
|------|------|------|
| M3 颜色体系生成器 | 从种子色生成完整浅色/深色 M3 体系（`--md-sys-color-*`），可即时预览、复制 CSS；含 `st-init.js` 项目初始化模块（各页面引入，动态注入颜色体系并跟随 localStorage 配置）；核心模块 `m3-theme.js` 提供 `generateM3Theme` / `themeToCss` / `applyTheme` / `expandCustoms` 四个 API；内置扩展角色 success（默认绿 `#006E1C`，不随种子色变化）；支持核心四角色 + success 手动覆盖与自定义变量（自动按 M3 tone 规则展开 on/container 配对 token），配置存 localStorage | [packages/color/index.html](./packages/color/index.html)（JS：`packages/color/m3-theme.js`） |

## 当前状态（2026-08-20）

当前 15 个模块（含 4 个双标签模块），st-button 作为整个库设计范式的样板：

- **st-button**（`packages/button/`）：三种 variant（filled/outlined/text）、disabled、loading、prefix/suffix 插槽；`color` 语义色属性可与 variant 自由组合（按 M3 规范分派：filled 用角色色底/on-角色色字，outlined/text 用角色色作前景与描边，运行时切换 variant 亦生效）；外观完全由原生 CSS 属性定制（视觉在 `:host` 上，内部透明 `.native` 原生 button 承载交互语义）。已在浏览器中完成功能与双主题验证。
- **st-ripple**（`packages/ripple/`）：点击波纹，放在 relative 父元素内使用；已内嵌到 st-button（点击按钮有波纹效果），波纹色 currentColor。
- **st-input**（`packages/input/`）：单行输入框，两种 variant（outlined/filled）、disabled、readonly、type、placeholder、`default-value` 初始值属性、prefix/suffix 插槽、`color` 语义色属性（控制 caret 与 focus 边框色，常用于 error/success 校验态）；**value 是运行时状态（ofa data，非标签属性），attached 时由 default-value 初始化，JS 读写用 `el.value`**；`input`/`change` 事件天然 composed 直接在宿主监听；提供 `focus()`/`blur()` 方法。视觉在 `:host` 上，内部透明 `.native` input 承载交互。
- **st-textarea**（`packages/textarea/`）：多行输入框，与 st-input 同范式（outlined/filled、rows、default-value 初始值/color/disabled/readonly、focus 描边/底线动画；value 为运行时状态，`el.value` 读写）；内部透明 textarea 用 rows 自撑高度（拖拽手柄默认关闭）；`autosize` 属性按内容自动撑开（rows 为最小高度，ResizeObserver 兜底外部字号变化）。
- **st-select**（`packages/select/`）：单选下拉框，与 st-input 同范式（outlined/filled、placeholder、default-value 初始选中/color/disabled、focus 描边/底线动画；value 为运行时状态，`el.value` 读写）；选项写在 light DOM 的原生 `<option>`（value 缺省取文本），组件自绘 M3 风格弹层（shadow 内绝对定位，选中项 secondary-container + 对勾、键盘 ↑↓/Enter/Escape/Home/End 全支持、点击外部关闭）；`change` 事件 composed。注意：弹层在 shadow 内，被 overflow 祖先裁剪时会截断。
- **st-dialog**（`packages/dialog/`）：模态对话框，`open` 显隐（纯 CSS，默认 display:none + `:host([open])` 正向启用）+ `auto-close`（遮罩点击/Escape 交互关闭并派发 `close` 事件 composed）；headline/默认/actions 三插槽（空区块自动隐藏）；**结构例外：宿主是全屏遮罩层（fixed + grid 居中），面板在 shadow 内 `part="panel"`，宽高/圆角/底色用原生 `::part(panel)` 选择器定制**（遮罩必须铺满视口，面板视觉无法放 :host 上）；面板默认值全 em（宿主改 font-size 全面板等比缩放）；打开时焦点移入面板容器；M3 emphasized 动效（遮罩淡入 250ms + 面板 scale 0.9 上移入场 300ms，关闭反向退出 200ms 后再隐藏，closing 过渡态由 JS 短暂挂载，watch 需 `_wasOpen` 守卫防初始化误触发）；轻磨砂遮罩（rgba(0,0,0,0.28) + blur 0.357em）。已在浏览器中完成功能与动画验证。
- **表单选择类**（checkbox / switch / radio，2026-08-20 从 Punch-UI 重构）：统一范式——内部透明原生 `<input type="checkbox|radio">`（`all: unset` + absolute inset 0 + **z-index: 2 盖住 position:relative 的兄弟元素**）承载点击/Space/焦点，变更后反射回宿主属性（`checked`/`indeterminate`）并派发 `change`（composed）；disabled 由 `input.disabled` 原生阻断；`color` 属性选中态换角色色（applyState 写 shadow 内元素内联样式）；对勾/圆点描边与弹性入场动画；radio 的 name 分组不跨 shadow root，互斥由组件在同一容器内查询同 name 兄弟手动实现。
- **st-snackbar**（`packages/snackbar/`）：消息条，`open` 显隐 + `duration`（毫秒）自动关闭派发 `close`；视觉在 :host（默认 secondary 次级色底，color 属性可换角色色）；`hide()` 已桥接为宿主 DOM property（坑 #24）；上滑入场动画。
- **st-collapse**（`packages/collapse/`）：高度过渡折叠容器，`hide` 收起；ResizeObserver 跟随内容高度；watch 初始触发需容错（shadowRoot 未就绪直接 return）。
- **st-list / st-list-item**（`packages/list/`）：列表容器 + 列表项；item 支持 `button`（state layer + 波纹 + click 冒泡）/ `disabled`（原生 button.disabled 阻断）/ `collapsible + expanded`（内嵌 st-collapse 折叠 sublist，点击切换且不冒泡）；prefix/suffix/secondary 副文本插槽；首尾项自动大圆角。
- **st-menu / st-menu-item**（`packages/menu/`）：下拉菜单，trigger 插槽 + light DOM 菜单项；面板 fixed 定位 JS 计算（翻转避让视口、min-width 跟随触发器）；open/close 事件（watch 需守卫防初始化派发）；点外部/Escape/选中自动关闭（外部判断用 composedPath，坑 #21）；item 的 `.native` 以宿主为包含块（宿主必须 position:relative，否则 absolute 铺满整个面板）。
- **st-tab-bar / st-tab-item** 与 **st-nav-bar / st-nav-item**（`packages/tabs/`、`packages/navigation/`）：指示条/药丸跟随动画组件——bar 用 MutationObserver 监听子项 `active` 属性变化 + ResizeObserver 尺寸重定位（瞬时无动画），item 的 active 切换由外部逻辑处理（click 冒泡传出）；tab 指示条贴底边线、nav 药丸为 secondary-container 对齐 item 内 `.pill` 区域。

全局文件：

| 文件 | 作用 |
|------|------|
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
7. **验收页统一用 `o-page` 模式**——index.html 只做加载器（ofa.js + st-init.js + `<l-m>` + `<o-page src="./page.html">`），内容与逻辑全部放 page.html 页面模块（data / proto / o-fill 列表渲染）
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

### 测试/验证类坑（非 ofa.js）

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
30. **ripple 类"监听宿主冒泡事件"的组件必须过滤嵌套组件的事件**——监听在宿主上的 pointerdown/click 会收到从嵌套子组件（子列表项、项内套的 st-button 等）冒泡上来的事件，导致一次点击多层涟漪；正确写法：用 `e.composedPath()` 扫描，路径中在宿主之前出现任何带连字符的自定义元素（tagName 含 "-"）即视为嵌套组件发起，直接跳过（插槽里的普通内容不受影响，仍正常波纹）
29. **组件内同步 disabled 到内部原生元素用 `nativeEle.disabled = this.disabled !== null`**——原生 disabled 天然阻断 click/键盘/焦点，无需手动 stopPropagation；不要用 `:host([disabled]) .native { display:none }` 隐藏（隐藏后阻断逻辑整个消失，宿主级点击照常冒泡）

## 测试

Playwright 端到端测试（无构建，走真实浏览器）：

- 用例：`tests/{button,input,textarea,select}.spec.js`；fixture 页：`tests/fixtures/*.html`（引 CDN ofa.js + st-init.js + l-m，`window.events` 记录事件）
- 运行：`npm test`（自动起 `http-server` :8642，禁缓存；须先 `npx playwright install chromium`）
- CI：`.github/workflows/test.yml`（push/PR 时跑 chromium）
- 已知注意：st-input/st-textarea 宿主本身不可聚焦（无 tabindex），焦点在内部 `.native` 上，`el.focus()` 原生调用无效（坑 #24），测试用真实点击聚焦；焦点事件断言用 `focusin`/`focusout`（原生 focus/blur 不冒泡）

## 下一步可能的方向

- 按同样范式扩展组件（dialog、menu 等，参考 st-button 的三件套结构）
- 将本文档封装为 Agent Skill（`SKILL.md`），供 Claude Code / ZCode 等工具按需加载
- ~~引入浏览器自动化测试~~ 已落地：Playwright 端到端测试（见「测试」章节）+ GitHub Actions CI
