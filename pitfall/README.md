# 踩坑索引（Pitfall Index）

所有踩坑记录按**一条一文件**存放在本目录；文件名前缀就是稳定编号（`{ID}-{slug}.md`）。组件代码、README、CONTEXT 里的 `坑 #N` 均指本索引中的同编号条目。

- 修改组件前，先扫一遍对应分类；皮肤 / shadow / watch 相关条目在 [ofa.js / 组件](#ofajs) 组。
- 本目录是仓库内部文档，**不随 senti-ui 技能导出**；技能里只保留文字描述，不要引用本目录路径。

## 编号约定

- ID 一旦分配就不再改号；新增坑取当前最大号 +1（目前从 **#63** 开始）。
- 文件名 = `{ID}-{slug}.md`，slug 用简短的英文 kebab-case。
- 历史编号 `#54` / `#55` / `#59` 各重复出现两次，拆分为 `a` / `b`：旧引用 `坑 #54` → `54a`、`坑 #55` → `55a`、`坑 #59` → `59a`（皮肤 token）；`pageAnime` 条目是 `59b`。

## 新增一条坑

1. 在 `pitfall/` 新建 `{下一个ID}-{slug}.md`，保留文件头部的 ID / 分类行。
2. 正文写清「现象 / 原因 / 正确写法」，能贴最小复现代码就贴。
3. 更新本索引对应的分组表格。
4. 在代码注释或文档里用 `坑 #N`（或相对链接）引用；**不要再把正文追加回 CONTEXT.md**。

## <a id="ofajs"></a>ofa.js / 组件（49 条）

| ID | 主题 | 文件 |
| --- | --- | --- |
| `#0` | ofa.js CDN 不锁版本 | [0-cdn-unpinned-ofa.md](./0-cdn-unpinned-ofa.md) |
| `#1` | 布尔属性默认值用 `null`，不用 `false` | [1-boolean-attr-null-default.md](./1-boolean-attr-null-default.md) |
| `#2` | 布尔属性转发到内部原生元素用属性绑定 `:disabled="..."` | [2-boolean-attr-binding.md](./2-boolean-attr-binding.md) |
| `#3` | JS 修改组件状态用 `setAttribute` / `removeAttribute` | [3-setattr-vs-property.md](./3-setattr-vs-property.md) |
| `#4` | 条件渲染不要依赖 `x-if` 响应运行时属性变化 | [4-x-if-not-reactive.md](./4-x-if-not-reactive.md) |
| `#5` | `{{...}}` 只能用在文本节点，属性值一律用 `attr:` / `:prop` / `:style.` 指令 | [5-template-binding-syntax.md](./5-template-binding-syntax.md) |
| `#6` | ofa 页面模块（page.html）脚本内不能用相对路径 `import()` | [6-page-module-import.md](./6-page-module-import.md) |
| `#7` | 验收页统一用 `o-page` 模式 | [7-acceptance-page-o-page.md](./7-acceptance-page-o-page.md) |
| `#8` | 本地验证必须用 `npm run dev` | [8-dev-server-no-cache.md](./8-dev-server-no-cache.md) |
| `#9` | ofa CDN 不锁版本会自动升级 | [9-cdn-auto-upgrade-reserved-names.md](./9-cdn-auto-upgrade-reserved-names.md) |
| `#10` | 页面模块内部操作 shadow DOM 用 `this.ele.shadowRoot.querySelector`（原生 API） | [10-shadow-dom-native-query.md](./10-shadow-dom-native-query.md) |
| `#11` | focus ring 等画在组件外部的指示色不要用 `currentColor` | [11-focus-ring-not-currentcolor.md](./11-focus-ring-not-currentcolor.md) |
| `#12` | 组件内向自身插入动态节点必须 `this.ele.shadowRoot.appendChild(...)` | [12-append-node-to-shadow.md](./12-append-node-to-shadow.md) |
| `#13` | 测试时合成事件（`dispatchEvent(new PointerEvent/...)`）跨 shadow 边界冒泡必须带 `{ composed: true }` | [13-composed-synthetic-events.md](./13-composed-synthetic-events.md) |
| `#14` | shadow 内的 `<l-m>` 加载占位是 flex item，会参与 gap 布局 | [14-lm-flex-gap.md](./14-lm-flex-gap.md) |
| `#15` | JS 写的内联样式会压过 `:host([attr])` 的 CSS 规则 | [15-inline-style-overrides-attr-css.md](./15-inline-style-overrides-attr-css.md) |
| `#16` | `<code>` 标签内的 `{{...}}` 插值不会被 ofa 编译 | [16-code-interpolation-not-compiled.md](./16-code-interpolation-not-compiled.md) |
| `#17` | 自定义组件的事件处理器里读 `e.target.value` 是 undefined | [17-event-target-value.md](./17-event-target-value.md) |
| `#18` | `setAttribute` 触发组件 watch 是异步的 | [18-watch-async-after-setattr.md](./18-watch-async-after-setattr.md) |
| `#19` | ofa `:` 属性绑定写不对 camelCase 的原生属性 | [19-colon-binding-camelcase.md](./19-colon-binding-camelcase.md) |
| `#20` | shadow 样式里 `:host:not([attr])` 不生效 | [20-host-not-selector.md](./20-host-not-selector.md) |
| `#21` | document 层监听判断"点击组件外部"必须用 `e.composedPath().includes(ele)`，不能用 `ele.contains(e.target)` | [21-composedpath-outside-click.md](./21-composedpath-outside-click.md) |
| `#22` | ofa 的 `:prop` 绑定到 attr 声明的键时会把对象 JSON 序列化写入 attribute | [22-prop-binding-json-attribute.md](./22-prop-binding-json-attribute.md) |
| `#23` | o-fill 把模板条目渲染在自身 light DOM（innerHTML），slot 的 assignedElements 只能看到 O-FILL 容器本身 | [23-ofill-light-dom-assigned.md](./23-ofill-light-dom-assigned.md) |
| `#39` | o-router 的 hash 路由以站点根（origin）解析，不相对当前页面目录 | [39-hash-router-base.md](./39-hash-router-base.md) |
| `#40` | JS 动态生成主题会有 FOUC（刷新闪色），治理 = 同步引导 + 双兜底 | [40-fouc-theme-init.md](./40-fouc-theme-init.md) |
| `#41` | 组件内布局定位不要用 `getBoundingClientRect`，用 `offsetLeft/Top/Width/Height` 系 | [41-offset-not-boundingrect.md](./41-offset-not-boundingrect.md) |
| `#42` | `position:fixed` 弹层的 containing block 不保证是视口——transform 祖先会接管它 | [42-fixed-containing-block.md](./42-fixed-containing-block.md) |
| `#43` | 文档树的 CSS 选择器跨不进 `o-page` / `o-app` 的 shadow，CSS 变量可以 | [43-shadow-css-vars.md](./43-shadow-css-vars.md) |
| `#44` | 皮肤规则不要用 `@layer` 包 | [44-skin-no-layer.md](./44-skin-no-layer.md) |
| `#45` | 自定义属性 `--a: var(--b)` 在声明元素处解析后再继承，祖先 token 不会跟随子元素的内联覆盖 | [45-custom-property-resolution.md](./45-custom-property-resolution.md) |
| `#46` | `applyColor` 无条件清空内联样式会误伤页面定制 | [46-applycolor-inline-style.md](./46-applycolor-inline-style.md) |
| `#47` | `::part()` 不能跨 shadow 边界 | [47-part-cross-shadow.md](./47-part-cross-shadow.md) |
| `#49` | ofa.js v5 下子组件可能晚于父组件升级（ready 时子元素 shadowRoot 仍为 null） | [49-v5-child-upgrade-late.md](./49-v5-child-upgrade-late.md) |
| `#50` | SCSR 的 `template[page]` 在脚本执行前是惰性的，“无 JS 可见/首屏 SSR”不成立 | [50-scsr-template-inert.md](./50-scsr-template-inert.md) |
| `#51` | SCSR 多级父页：`parent` 相对子页解析，slot 外层必须相对定位；父页 `routerChange` 才能拿到当前子页 | [51-scsr-nested-parent-slot.md](./51-scsr-nested-parent-slot.md) |
| `#52` | 在 `o-page` shadow 里取 `getRootNode().host` 会拿到页面容器，不是视觉父元素 | [52-getrootnode-host.md](./52-getrootnode-host.md) |
| `#53` | SCSR 的 `::slotted(*) { height:100% }` 来自外层，会盖过页面 `:host` 的尺寸；内部滚动必须多包一层 shell | [53-scsr-slotted-height-shell.md](./53-scsr-slotted-height-shell.md) |
| `#54a` | `{{...}}` 在 `<pre>` / `<code>` 内不会被解析（ofa 为代码示例保留字面量） | [54a-code-pre-interpolation.md](./54a-code-pre-interpolation.md) |
| `#54b` | 自定义元素构造/ready 期间不能 setAttribute 宿主属性 | [54b-constructor-no-attributes.md](./54b-constructor-no-attributes.md) |
| `#55a` | SCSR 站内跳转只解析目标页的 `template[page]`，目标页 body 里的 `<l-m>` 不会执行 | [55a-scsr-inner-navigation.md](./55a-scsr-inner-navigation.md) |
| `#55b` | 内部原生控件的可访问名称不会自动来自 slot 文本 | [55b-accessible-name-from-slot.md](./55b-accessible-name-from-slot.md) |
| `#56` | ofa.js 组件不能直接注册成 form-associated custom element | [56-no-form-associated.md](./56-no-form-associated.md) |
| `#57` | shadow 内 button 的 `type=submit/reset` 不会提交外层 form | [57-shadow-submit-button.md](./57-shadow-submit-button.md) |
| `#58` | 祖先的 `backdrop-filter` 会成为后代弹层的 backdrop root，弹层毛玻璃“失效” | [58-backdrop-filter-backdrop-root.md](./58-backdrop-filter-backdrop-root.md) |
| `#59a` | 皮肤 token 在祖先层提前解析 `var(--st-accent)`，`color` 的语义色丢失 | [59a-skin-token-var-resolution.md](./59a-skin-token-var-resolution.md) |
| `#59b` | `pageAnime` 的入场过渡会被“先写 next、rAF+5ms 再写 current”折成 0 时长——三态都不要写 `transition` | [59b-pageanime-transition.md](./59b-pageanime-transition.md) |
| `#60` | “提高对比度”必须从色盘/源色按目标 tone 重新取色，不能平移已生成 token 的 tone | [60-contrast-retone-from-source.md](./60-contrast-retone-from-source.md) |

## <a id="testing"></a>测试 / 验证（17 条）

> #27–#38 是借测试发现的组件时序 / 样式问题，历史上归在本组；排查组件问题时也请扫一遍。

| ID | 主题 | 文件 |
| --- | --- | --- |
| `#24` | 外部脚本无法直接调用 o-page 页面模块的 proto 方法 | [24-o-page-proto-external.md](./24-o-page-proto-external.md) |
| `#25` | 原生 `<input>`/`<textarea>` 的 `change` 事件不是 composed，穿不出 shadow DOM | [25-change-event-not-composed.md](./25-change-event-not-composed.md) |
| `#26` | Playwright 断言 `page.evaluate(...)` 返回值必须 `await` | [26-playwright-await-evaluate.md](./26-playwright-await-evaluate.md) |
| `#27` | ofa 初始化时也会以初始值触发一次 watch | [27-watch-initial-trigger.md](./27-watch-initial-trigger.md) |
| `#28` | 内部 `.native` 元素要盖住 position:relative 的兄弟元素必须加 z-index | [28-native-z-index.md](./28-native-z-index.md) |
| `#29` | 组件内同步 disabled 到内部原生元素用 `nativeEle.disabled = this.disabled !== null` | [29-native-disabled-sync.md](./29-native-disabled-sync.md) |
| `#30` | ripple 类"监听宿主冒泡事件"的组件必须过滤嵌套组件的事件 | [30-ripple-filter-nested-events.md](./30-ripple-filter-nested-events.md) |
| `#31` | CSS 变量不能同名自引用累加 | [31-css-var-self-reference.md](./31-css-var-self-reference.md) |
| `#32` | 高度过渡类组件（collapse）默认 transition 时长必须为 0s，仅用户切换时临时启用；且显隐高度要完全 JS 驱动 | [32-collapse-transition-height.md](./32-collapse-transition-height.md) |
| `#33` | 依赖 light DOM 位置/结构的逻辑放 attached 而非 ready | [33-attached-vs-ready-layout.md](./33-attached-vs-ready-layout.md) |
| `#34` | display:none 会暂停 CSS 动画，animationend 永不触发 | [34-display-none-pauses-animation.md](./34-display-none-pauses-animation.md) |
| `#35` | "边框扩展成实心底"技巧在过渡与小数字号下会露馅，慎用 | [35-border-fill-artifact.md](./35-border-fill-artifact.md) |
| `#36` | fixed 定位的弹层组件不能放在有 transform 的祖先内 | [36-fixed-in-transform-ancestor.md](./36-fixed-in-transform-ancestor.md) |
| `#37` | 组件 JS 写自身声明的 attrs 属性会反馈进 ofa attr data，形成自引用死锁 | [37-attrs-self-reference-deadlock.md](./37-attrs-self-reference-deadlock.md) |
| `#38` | ofa 组件 document.createElement 动态创建可能不升级 | [38-createelement-not-upgraded.md](./38-createelement-not-upgraded.md) |
| `#48` | 皮肤切换是异步的：`setSkin()` 只改 `data-skin`，对应 CSS 还要网络加载 | [48-skin-switch-async-css.md](./48-skin-switch-async-css.md) |
| `#61` | 带 CSS transition 的属性，poll 到一个中间阈值后立刻读终值仍会读到过渡帧 | [61-poll-final-value-not-mid-transition.md](./61-poll-final-value-not-mid-transition.md) |
| `#62` | 等待子组件升级不要只靠固定定时器，用 `customElements.whenDefined` | [62-when-defined-not-fixed-timer.md](./62-when-defined-not-fixed-timer.md) |

