# Senti-UI 官网首页（site/）

官网首页把 22 个组件模块（31 个 `st-*` 标签）全部摆在一页里，按「动作 / 输入 / 反馈 / 内容 / 导航」分区展示；组件文档是每个组件一个独立 SCSR 页，按场景拆分多组可交互示例；手记则记录组件库背后的设计取舍与材质系统思考。三者共用同一套 header / footer 与皮肤、深浅色主题。

采用 **ofa.js v5 + scsr**（Symphony Client-Server Rendering）：每个 URL 都是可直接访问的真实文档，站内跳转走 o-app 路由（真实路径，非 hash），而不是 hash 路由。

线上地址：<https://senti.ofajs.com/site/>（部署在域名根路径的 `/site/` 下，组件文档为 `/site/docs/`）。

本地运行：

```bash
npm run dev
# http://localhost:8642/site/          （目录直开）
# http://localhost:8642/site/index.html
```

## SCSR 结构

```
site/
  layout.html      # 一级父页：header / footer / 材质与主题 + <slot>
  index.html       # 组件目录首页（export const parent = "./layout.html"）
  skins.html       # 主题页：五张主题卡（材质 + 官方配色）+ 改色/加色（parent = "./layout.html"）
  docs/
    layout.html    # 二级父页：左侧组件目录 / 移动端左侧抽屉 + <slot>（parent 指向上级 layout）
    index.html     # 文档概览：23 张卡片，按基础 / 辅助 / 高级分组（parent = "./layout.html"）
    button.html    # 每个组件一页（共 21 页，均 parent = "./layout.html"）
    input.html
    ...
  docs.css         # 文档页共用的 shadow 样式表
  notes/
    index.html     # 手记目录（parent = "../layout.html"）
    behavior-and-skin.html  # 设计哲学：行为统一，VI 自由（ofa.js v5 + M3 的取舍）
  notes.css        # 手记目录与正文共用的 shadow 样式表
  app-config.js    # o-app 配置（不声明 home；pageAnime 控制真实路径切换动画）
  theme-presets.js # 主题预设：官方配色、按材质槽位记忆、切换时一并套用（页面层）
  README.md
```

`index.html` 是 SCSR 契约的载体：

```html
<body>
  <o-app src="./app-config.js">
    <template page>
      <!-- l-m 必须放在 template[page] 内：SCSR 站内跳转只解析目标页的 template，
           目标页 body 里的 <l-m> 不会执行。 -->
      <l-m src="../packages/button/button.html"></l-m>

      <style>…页面样式…</style>
      …整页内容…
      <script>
        export default async () => ({ data: {…}, ready() {}, proto: {…} });
      </script>
    </template>
  </o-app>

  <script type="module">
    import "…/ofa.js@refs/heads/v5/dist/ofa.min.mjs";
    import "…/ofa.js@refs/heads/v5/packages/scsr/dist/scsr.min.mjs";
  </script>
</body>
```

- `layout.html` 是 SCSR 的**共享父页**：header（favicon 同款标记 + SentiUI 字标 / 文档·皮肤·手记文字导航（组件目录即首页，点品牌回首页） / 三巨头材质快捷菜单 / 主题 / GitHub）、footer、以及主题与皮肤状态都在这里；子页在 `<slot>` 中渲染，切页时布局不销毁；材质切换走 `data-skin` / `setSkin()`；
- `index.html` 声明 `export const parent = "./layout.html"`；`site/docs/layout.html` 再声明 `export const parent = "../layout.html"`，形成**多级嵌套布局**；`site/docs/` 下每个组件页声明 `export const parent = "./layout.html"`；
- 文档左侧组件目录（`st-list` + `st-list-item`）和移动端组件目录抽屉只存在于 `site/docs/layout.html` 一处；同父页的组件互相切换时侧栏不销毁、不重排，只替换 `<slot>` 里的正文；
- `notes/` 是独立的阅读栏目（导航名「手记」）：`index.html` 是文章目录，`behavior-and-skin.html` 是合并后的设计哲学长文，串起「行为统一 / ofa.js v5 实现 / M3 颜色减法 / 对比度 / input 去 label」；两者都 `parent = "../layout.html"`，正文页共用 `notes.css`，站内跳转用 `olink` 保持共享 header；
- 页面切换动画**只在 `app-config.js` 的 `pageAnime` 里配置**：前进时新页从下方 16px 上移并淡入、旧页上移 16px 淡出；后退方向相反（新页从上方 16px 落下）。过渡时长不写在配置里——ofa 自动注入 `all .3s`，入场淡入、离场淡出与位移都在这次过渡里完成。两级 layout 不写任何切页动画 CSS；页面背景透明，由 layout 的固定环境光层提供底色；文档示例容器 `.demo` / `.demo-stage` / `.demo-content` 也改为半透明，Apple 下同样能透出环境光；
- **slot 外层必须是相对容器**（`.docs-body { position: relative }`）：离场页会被 scsr 设为 `position: absolute`，没有相对容器时会相对视口定位，切换瞬间露出旧内容造成“闪一下”；
- **环境光背景**：layout 内固定 `.ambient` 层（三个模糊色球缓慢漂移）位于页面后面；M3 / windows / shadcn 下透明度较低，Apple 下通过 `ambient-strong` 提升到 1，半透明卡片、菜单、对话框的毛玻璃才有可见内容。页面 `::slotted(o-page)` 与首页 `:host` 背景透明，否则会盖住环境光；`prefers-reduced-motion` 下停止漂移；
- **滚动容器固定为 `.site-scroll`**：文档 head 里 `html, body { height: 100%; overflow: hidden }`，layout 内部用 `.shell { height: 100dvh; overflow: hidden }` + `.site-scroll { overflow-y: auto; overscroll-behavior-y: none }`。这样整页不会在底部继续触发根节点的弹性回弹，header / 阅读进度 / 回到顶部始终固定在视口；滚动进度、`toTop()`、路由切换后的复位都基于 `.site-scroll` 而不是 `window`；
- 切页动画用 `pageAnime` 时，`current.transform` 必须写 `"none"`（不是 `translateY(0)`）：identity transform 也会成为 `position: fixed` 的包含块，对话框/菜单会相对页面而不是视口定位（内部滚动后尤其明显）。代价是入场那 0.3s 内页内 `fixed` 后代临时以 `o-page` 为包含块；布局级 fixed 元素（环境光、回到顶部）在 `o-page` 之外，不受影响；
- **不要给 `pageAnime` 三态写 `transition`**：ofa 的入场是「先写 `next`，rAF+5ms 后再写 `current`」，起点态一旦自带 `transition`，这一帧会先起一个过渡、随后被 `current` 反向，浏览器把它合并成 0 时长，页面直接跳到位（Chromium 实测：`transform` 过渡只活了 1ms，淡入同样失效）。三态只写 `opacity` / `transform`，过渡统一由 ofa 注入的 `all .3s` 提供；
- 当前 `pageAnime` 是静态对象，**没有 `prefers-reduced-motion` 降级**——系统开启「减弱动效」时仍会播放 0.3s 位移 + 淡入。需要恢复时改成 getter，按 `matchMedia("(prefers-reduced-motion: reduce)")` 返回另一组无位移、0.01s 过渡的态（0s 不触发 `transitionend`，离场会多等 350ms 兜底，见 [pitfall #59b](../pitfall/59b-pageanime-transition.md)）；
- `pageAnime` 只覆盖站内路由切换：整页刷新 / 直接打开某页时 scsr 不经过切换，因此没有入场动画（这是有意接受的，不是 bug）；
- header 用 senti-ui 组件搭：三个 `variant="text"` 的 `st-button` 做「文档 / 皮肤 / 手记」导航（组件目录即首页，不再单独占一个导航项，点品牌字标回首页；当前项用 `class:active` 换成 primary 色，不使用 button-group）、`st-icon-button` + `st-tooltip`（主题 / GitHub）、品牌也是 `st-button`：favicon 同款圆角方块 + 白点标记 + SentiUI 字标；导航用页面实例的 `goto()` 保持真实路径与共享布局；**≤760px 时横向导航隐藏，改由右侧 `st-drawer.mobile-drawer` 承载组件目录 / 文档 / 皮肤 / 手记 / GitHub，当前栏目在抽屉内高亮**；
- scsr 接管后，把当前 URL（`/site/`、`/site/index.html`、`/site/docs/button.html` 等）收编为 `<o-page src>`，用同一份 HTML 的 `template[page]` 转译成页面模块，然后移除内联 template；
- 页面本体随后渲染在 `o-page` 的 shadow 内，`:host` 样式、`this.ele.shadowRoot` 等写法与普通页面模块一致；
- `app-config.js` **不声明 home**：首页就是当前 URL 的页面，声明 home 会与 scsr 竞争；
- 站内多页时用 `<a olink href="./other.html">` 或 `this.goto("./other.html")`，地址栏是真实路径；每个路径都必须有一份同名 HTML。

`index.html` / `skins.html` 里还做了三件事：

1. `st-boot.js` 同步注入首帧主题（防刷新闪色）；
2. 预载五套皮肤 CSS（页面要同页并列展示多种材质）；
3. 命令式工具（alert / confirm / prompt / toast / contextMenu）与皮肤 / 主题 API 由 `layout.html` 的 `initSiteApi()` 预加载并挂到 `window.__site`（页面 body module 只做 `Object.assign` 兜底；SCSR 跳转不会执行目标页 body module）。

## 页面内容

采用 shadcn 式的组件目录首页：

- 共享 header（来自 `layout.html`）：文档 / 皮肤 / 手记文字切换（组件目录即首页，点品牌回首页）、自动 / 浅色 / 深色（`st-select` + 随模式变化的 Iconify 图标）、GitHub
- **图标统一走 Iconify Web Component**（`iconify-icon`，由 `layout.html` 注入 `code.iconify.design` 的 2.1.0 脚本）：header、首页 CTA / 文档链接 / 图标按钮、皮肤页与文档导航都用 `<iconify-icon icon="mdi:...">`，不再用 emoji / Unicode 箭头；`st-select` 的闭合态会显示选中项的图标（选项里的图标元素同步到 label 前）；组件库内部用 CSS 绘制的对勾、箭头、关闭按钮不引入外部图标依赖
- 紧凑 intro：标题、一句话说明、统计数据、组件文档 / 源码 / AI Skill 下载入口（`senti-ui-skill.zip`，Claude Code / ZCode 可直接加载）
- **26 张组件卡片**（`CATALOG / 26 CARDS`）：每张卡片 = 真实组件预览 + 名称 + 标签 + 站内文档 ↗
  - 预览区可交互：按钮、输入、选择、开关、滑块、标签栏、导航、折叠、对话框、菜单、Toast 等都能直接操作
  - 覆盖 22 个模块、31 个 `st-*` 标签，以及 toast / alert / confirm / prompt / contextMenu 命令式工具
- 三张局部 `data-skin` 系统 UI 卡：Android Material 3 / Apple 毛玻璃 / Windows 11 同页对比；每张卡用 `previewThemes` 写入平台默认 `--md-sys-color-*`，不跟随站点当前主题色；shadcn 与 Cyberpunk 仍在独立的 `skins.html` 选用
- 快速开始：安装代码、复制、文档入口
- 深浅色切换（`st-select` → `setThemeMode`）、皮肤切换（`setSkin`）

卡片右下角的 ↗ 会打开对应组件的独立文档页（如 `./docs/button.html`）；卡片本身不是链接，所以预览可以放心交互。

## 站内组件文档（docs/）

旧的根目录 `docs/` 已删除，文档全部在 `site/docs/`。每个组件一个独立 SCSR 页面，全部共用 `layout.html` 和文档侧栏：

- `/site/docs/index.html`：23 张组件卡片概览，分为「基础组件 18」「辅助组件 4」与「高级组件 1」
  - 基础组件：按钮、表单控件、反馈、内容与导航，承担完整业务流程
  - 辅助组件：波纹、折叠、提示，在基础组件之上做锦上添花
  - 高级组件：代码展示（st-code），提供语法高亮、自动格式化与复制
- `/site/docs/{button,input,...,navigation}.html`：每个组件一页，包含
  - 一句话说明、分类、标签、上一页 / 下一页
  - 可交互的真实组件示例
  - 属性表（类型 / 默认值 / 说明）
  - 插槽 / 事件 / 注意事项
  - 可折叠的示例代码
  - 指向 GitHub README 的入口
- 左侧粘性目录只在 `site/docs/layout.html` 维护一次，用 `st-list` + `st-list-item` 搭；父页在 `routerChange` 里按当前 URL 高亮，移动端改为左侧 `st-drawer` 组件目录抽屉
- `site/docs/layout.html` 顶部必须自己声明 `list` / `select` 的 `<l-m>`：SCSR 站内跳转只解析目标页的 `template[page]`，目标页 body 里的 l-m 不会执行；否则从手记/皮肤等栏目进入文档时侧栏组件不会升级
- 页面内用 `st-progress` 做阅读进度条、`st-icon-button` + `st-tooltip` 做回到顶部。**进度条必须绝对定位**（`position: absolute; bottom: -4px`，放在 header 内）：它只在文档页出现，如果按普通 flex 项显隐，home ↔ docs 切换时会多占/少占 3px，把整页（包括正在淡出的上一页）挤动 3px——表现就是“切页前内容先偏一下，再开始动画”；
- header 与首页完全共用；主题 / 材质切换在 header 中，只影响按钮 / 输入框
- 仍然是 SCSR：每个组件页都是可直达、可刷新、可分享的真实文档
- 页面切换有淡入 + 轻微上滑动画；header / 阅读进度常驻，内容区不因侧栏出现而重排

新增组件文档时：在 `site/docs/` 复制一个页面改内容；只改 `site/docs/layout.html` 一处，补上 `navGroups` 项（桌面侧栏与移动抽屉共用）；再在 `site/docs/index.html` 补一张卡（放进基础或辅助分组，并同步该组计数），并同步首页卡片的 `./docs/{id}.html` 链接。组件页本身不再包含侧栏。

## 首屏与无 JS

SCSR 把整页内容内联在 `template[page]` 里。**template 在脚本执行前是惰性的**，所以关闭 JavaScript 时浏览器不会渲染这部分内容；本页在 `o-app` 前提供了 `<noscript>` 兜底（标题、说明、文档与 GitHub 链接）。

原始 HTML 里包含全文（爬虫读取源码时可见），但若需要“无 JS 也能看到完整首屏”的真正 SSR/SSG，应在服务端把页面快照预渲染到 `o-app` 之外（或使用真正的 SSR 方案），而不是依赖 `template`。

## 运行时版本

本页使用 **ofa.js v5 分支**：

```
https://cdn.jsdelivr.net/gh/ofajs/ofa.js@refs/heads/v5/dist/ofa.min.mjs
https://cdn.jsdelivr.net/gh/ofajs/ofa.js@refs/heads/v5/packages/scsr/dist/scsr.min.mjs
```

scsr 必须在 ofa.js 之后加载；本站把两者放在同一个 module 的连续 import 中保证顺序。语法遵循 `ofajs-docs-v5` 技能（`o-if` / `o-fill` / `attr:` / `sync:` / `on:`，页面 `<script>` 在 `template[page]` 内）。

与 `docs/`（现有组件文档站，o-router hash 路由）不同，本页是真实路径 + SCSR 的前向验证场景。若 v5 分支升级导致行为变化，优先修组件、再更新本页；组件级兼容问题（如子项升级时序）应沉淀到 [pitfall/](../pitfall/README.md)。

## 组件覆盖

| 分区 | 使用的标签 |
|------|-----------|
| 动作 | `st-button` / `st-button-group` / `st-split-button` / `st-icon-button` / `st-badges` / `st-ripple` |
| 输入 | `st-input` / `st-textarea` / `st-select`（含 `st-option`）/ `st-checkbox` / `st-switch` / `st-radio` / `st-slider` |
| 反馈 | `st-dialog` / `st-drawer` / `st-menu` + `st-menu-item` / `st-snackbar` / `st-tooltip` / `st-progress` / toast / alert / confirm / prompt / contextMenu |
| 内容 | `st-card` / `st-list` + `st-list-item` / `st-collapse` |
| 导航 | `st-tab-bar` + `st-tab-item` / `st-nav-bar` + `st-nav-item` / `st-nav-layout` |

新增组件时：

1. 在 `site/index.html` 的 `l-m` 列表补一条；
2. 在 `template[page]` 对应分组补一张 `.spec` 卡片；
3. 若有命令式 API，优先挂到 `layout.html` 的 `initSiteApi()`；页面 body module 只能作为直接打开的兜底，并且必须 `Object.assign` 合并，不能覆盖已有 API；
4. 需要换肤的组件先按 `packages/skin/README.md` 接入 token。

## 皮肤与主题

- 包内皮肤：`html[data-skin]` + `st-skin.js`（五套 CSS 已在 `index.html` 与页面 shadow 内预载，切换零等待）；皮肤仍只改材质，颜色来自 M3。
- 官网「主题」= 材质 + 官方配色：M3 蓝 `#0061A4` / Apple iOS 蓝 `#007AFF` / Windows 蓝 `#0078D4` / shadcn zinc `#18181B` / Cyberpunk 荧光绿 `#D6FE78`（`contrastTone: "bright"`，深色优先；同样有浅色方案）。切换主题时由 `site/theme-presets.js` 一起套用。
- 每个主题的颜色（含对比度）按材质存进 `st-theme-palettes`；**深浅模式是全局设置**，不存在 `st-theme-palettes` 里，切换主题时默认保持不变。唯一例外是深色优先主题：Cyberpunk 从浅色 / 自动+系统浅色进入时会切到显式深色（auto + 系统已是深色则保持 auto），之后切到其他主题也继续保持深色。Cyberpunk 预设的 `contrast` 为 `1`（满档）、`contrastTone` 为 `"bright"`，其余材质为 `0` / `"deep"`，切换材质时对比度与方向回到该主题默认值；M3 槽位承接用户原本的品牌色，所以从 Cyberpunk 回到 M3 会恢复进入前的配色。
- 局部预览：`.skin-preview[data-skin="..."]` 会在元素上写入该主题官方配色的 `--md-sys-color-*` 局部变量，所以五张卡能同页展示不同颜色；这只影响预览，不改全站。
- 文档树的 `[data-skin]` 选择器进不了 `o-page` 的 shadow，因此 `template[page]` 顶部额外 `<link>` 了五套 CSS 到 shadow 内；这是本页能「同页多种材质」的关键。
- `setSkin()` 仍然只换材质；header 菜单和 skins 页的切换走主题预设，才会同时换色。

## 皮肤页的改色与加色

`skins.html` 底部是 `COLOR / M3` 区块，直接调用 `packages/color/m3-theme.js`（Google Material Color Utilities / HCT）：

- **改色**：种子色选择器或 HEX 输入框，实时 `applyTheme(seed, overrides, customs, { contrast })`，整套 primary / secondary / tertiary / surface 中性色一起重算
- **对比度**：种子色下方「对比度」滑杆（-100% ~ 100%）传给 `applyTheme` 的 `options.contrast`；正值提高对比度（Cyberpunk 默认 100%），负值降低对比度（可爱 / 柔和主题），0 为标准 M3。切换材质时滑杆回到目标主题的默认值；主题内部的 `contrastTone`（deep / bright）也随主题重置，但不在滑杆 UI 中暴露。分角色精细调节在 `packages/color/index.html`
- **改色（单角色）**：primary / secondary / tertiary / error / success 五个角色可单独覆盖，on-* 与 container 配对仍按 M3 tone 规则推导；可随时复位回自动生成
- **加色**：添加任意数量自定义变量（如 `brand`），自动生成 `--brand` / `--on-brand` / `--brand-container` / `--on-brand-container` 四配对 token；组件直接 `color="brand"` 使用
- **可用色块变量**：工具下方分「白天 / 黑夜」两块面板，各用该模式的 `surface-container` 铺底；按 Primary / Secondary / Tertiary / Error / Success + 自定义颜色分组，每组 4 个堆叠色块（角色色 / on / container / on-container），色块底色与文字色使用该模式配对 token，下方标注变量名；角色组下方再按三段布局补 Surface / Surface Variant、五层 Surface Container、On Surface / On Surface Variant / Outline / Outline Variant（当前 M3 生成器未提供 Surface Dim / Surface Bright，故未列），同样可点击复制；改种子色、覆盖角色或增删自定义色时实时重算；`<code>` 内的动态文本要用 `:text`（见 [pitfall #54a](../pitfall/54a-code-pre-interpolation.md)）
- **色块模式**：标题右侧 `st-button-group` 切换「变量模式 / 色块模式」；色块模式调用 `generateTonalPalettes({ primary, secondary, tertiary, error, success })`，按角色面板里当前实际的颜色（含手动覆盖）生成 Primary / Secondary / Tertiary / Error / Success 五条音调盘；每个自定义颜色再追加一条同名音调盘，每条展示 0–100 共 14 个 tone；点击任意 tone 色块复制该行变量名（标准角色 `--md-sys-color-*`，自定义 `--name`）
- **变量位置标记**：色块面板下方「标出变量位置」radio 组（白天 / 黑夜，默认白天），在对应的 tone 列叠加长条：白天为色值 40 / on 100 / container 90 / on-container 10，黑夜为色值 80 / on 20 / container 30 / on-container 90；宽屏是跨行的连续长条，移动端改为对应 tone 色块的描边；切换 radio 时提示与标记同步更新
- **持久化**：每次改动写 `st-color-config`（配置）与 `st-theme-css`（下次刷新首帧 CSS），同域页面刷新后一起生效
- **恢复默认**：清空配置并回到 `#0061A4` 默认体系
- 颜色工具入口仍指向 `packages/color/index.html`（与官网共用同一份 localStorage 配置）
- 面板材质复用皮肤的 `--st-card-bg` / `--st-card-border` / `--st-card-backdrop-filter`：M3 / Windows / shadcn / Cyberpunk 保持实底，Apple 下自动变成半透明 + `blur(18px)` 毛玻璃，让改色工具本身也能看到材质差异
- 改色面板操作的是**当前主题的槽位**：切走时把 `st-color-config` 与模式存进 `st-theme-palettes[skin]`，切回时恢复

## 验证

```bash
npx playwright test tests/site.spec.js
npm test
```

烟雾用例检查：

- `/site/` 目录直开：26 张卡片、31 个 `st-*` 全部升级、无页面错误、`template[page]` 已被 scsr 移除、页面内没有 `/docs/` 链接；
- 皮肤 / 主题 / 对话框交互；
- 共享 layout：首页两个 `o-page`（layout + 子页）、header 文字导航 / 材质快捷菜单 / 主题 / 回到首页，品牌标记与 favicon 一致；移动端（≤760px）横向导航收进右侧抽屉，抽屉可切到组件目录 / 文档 / 皮肤 / 手记并高亮当前栏目；
- 组件文档：三层 `o-page`（site layout + docs layout + 组件页）、侧栏只有一份、每页 4 组以上示例、侧栏切换、移动端组件目录抽屉跟随当前页、上一页 / 下一页、阅读进度、页面切换动画；
- 滚动外壳：`body` 不滚动、内部 `.site-scroll` 滚动、`overscroll-behavior-y: none`，header / 侧栏固定，阅读进度随内部滚动更新，路由切换复位；
- 固定弹层：页面动画结束后 `transform` 必须回到 `none`，对话框遮罩覆盖整个视口；
- 皮肤页改色：种子色实时重算 CSS token、加色生成四配对 token、可用色块按角色分组、分白天 / 黑夜面板展示且色块可复制、色块模式展示当前角色色 + 自定义色的音调盘且随改色更新、刷新后持久化、恢复默认清空配置；
- 文档首页 23 张卡片进入独立页；
- 卡片右下角进入对应 `docs/{id}.html`，header 保持共享；
- 禁用 JavaScript 时 `<noscript>` 兜底可见。

## 部署

纯静态：把整个仓库（或至少 `site/` + `packages/`）放到任意静态服务器。SCSR **要求每个路径都有自己的 HTML 文件**，但**不需要任何 rewrite**；目录地址 `/site/` 由服务器补 `index.html` 即可。官方部署地址是 <https://senti.ofajs.com/site/>，站点按这个子路径组织所有相对链接。官网不再依赖根目录 `docs/`。`layout.html` 与 `site/docs/` 下的页面需要一起部署。CDN 只依赖 ofa.js v5。

## 新增真实页面

复制 `index.html` 为 `site/about.html`，保留 `<o-app src="./app-config.js">` 与 `template[page]`，内容换掉，并保留 `export const parent = "./layout.html"`；在 header / 首页用 `this.goto("./about.html")` 或 `<a olink href="./about.html">` 跳转即可。文档页放在 `site/docs/` 下，`parent` 写 `./layout.html`。不要给 `app-config.js` 加 `home`。
