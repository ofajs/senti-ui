# Senti-UI 官网首页（site/）

官网首页把 20 个组件模块（29 个 `st-*` 标签）全部摆在一页里，按「动作 / 输入 / 反馈 / 内容 / 导航」分区展示；组件文档则是每个组件一个独立 SCSR 页，按场景拆分多组可交互示例。两处共用同一套 header / footer 与皮肤、深浅色主题。

采用 **ofa.js v5 + scsr**（Symphony Client-Server Rendering）：每个 URL 都是可直接访问的真实文档，站内跳转走 o-app 路由（真实路径，非 hash），而不是 hash 路由。

运行：

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
  docs/
    layout.html    # 二级父页：左侧组件目录 / 移动端 picker + <slot>（parent 指向上级 layout）
    index.html     # 文档概览：21 张卡片，按基础 / 辅助分组（parent = "./layout.html"）
    button.html    # 每个组件一页（共 21 页，均 parent = "./layout.html"）
    input.html
    ...
  docs.css         # 文档页共用的 shadow 样式表
  app-config.js    # o-app 配置（不声明 home；pageAnime 控制真实路径切换动画）
  README.md
```

`index.html` 是 SCSR 契约的载体：

```html
<body>
  <!-- 组件与 l-m 仍可放在 o-app 外 -->
  <l-m src="../packages/button/button.html"></l-m>

  <o-app src="./app-config.js">
    <template page>
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

- `layout.html` 是 SCSR 的**共享父页**：header（favicon 同款标记 + SentiUI 字标 / 组件与文档文字导航 / 材质菜单 / 主题 / GitHub）、footer、以及主题与皮肤状态都在这里；子页在 `<slot>` 中渲染，切页时布局不销毁；材质切换走 `data-skin` / `setSkin()`；
- `index.html` 声明 `export const parent = "./layout.html"`；`docs/layout.html` 再声明 `export const parent = "../layout.html"`，形成**多级嵌套布局**；`docs/` 下每个组件页声明 `export const parent = "./layout.html"`；
- 文档左侧组件目录（`st-list` + `st-list-item`）和移动端 `st-select` 只存在于 `docs/layout.html` 一处；同父页的组件互相切换时侧栏不销毁、不重排，只替换 `<slot>` 里的正文；
- 页面切换动画：`app-config.js` 的 `pageAnime` 让离场页淡出，两级 layout 的 `::slotted(o-page)` 让新页轻微上滑入场（0.24s，`prefers-reduced-motion` 下关闭）；页面背景透明，由 layout 的固定环境光层提供底色；文档示例容器 `.demo` / `.demo-stage` / `.demo-content` 也改为半透明，Apple 下同样能透出环境光；
- **slot 外层必须是相对容器**（`.docs-body { position: relative }`）：离场页会被 scsr 设为 `position: absolute`，没有相对容器时会相对视口定位，切换瞬间露出旧内容造成“闪一下”；
- **环境光背景**：layout 内固定 `.ambient` 层（三个模糊色球缓慢漂移）位于页面后面；M3 / windows / shadcn 下透明度较低，Apple 下通过 `ambient-strong` 提升到 1，半透明卡片、菜单、对话框的毛玻璃才有可见内容。页面 `::slotted(o-page)` 与首页 `:host` 背景透明，否则会盖住环境光；`prefers-reduced-motion` 下停止漂移；
- **滚动容器固定为 `.site-scroll`**：文档 head 里 `html, body { height: 100%; overflow: hidden }`，layout 内部用 `.shell { height: 100dvh; overflow: hidden }` + `.site-scroll { overflow-y: auto; overscroll-behavior-y: none }`。这样整页不会在底部继续触发根节点的弹性回弹，header / 阅读进度 / 回到顶部始终固定在视口；滚动进度、`toTop()`、路由切换后的复位都基于 `.site-scroll` 而不是 `window`；
- 页面入场动画不要用 `animation-fill-mode: both` 保留 `transform`：identity transform 也会成为 `position: fixed` 的包含块，对话框/菜单会相对页面而不是视口定位（内部滚动后尤其明显）。动画结束后必须回到 `transform: none`；
- header 用 senti-ui 组件搭：两个 `variant="text"` 的 `st-button` 做「组件 / 文档」导航（当前项用 `class:active` 换成 primary 色，不使用 button-group）、`st-icon-button` + `st-tooltip`（主题 / GitHub）、品牌也是 `st-button`：favicon 同款圆角方块 + 白点标记 + SentiUI 字标；导航用页面实例的 `goto()` 保持真实路径与共享布局；
- scsr 接管后，把当前 URL（`/site/`、`/site/index.html`、`/site/docs/button.html` 等）收编为 `<o-page src>`，用同一份 HTML 的 `template[page]` 转译成页面模块，然后移除内联 template；
- 页面本体随后渲染在 `o-page` 的 shadow 内，`:host` 样式、`this.ele.shadowRoot` 等写法与普通页面模块一致；
- `app-config.js` **不声明 home**：首页就是当前 URL 的页面，声明 home 会与 scsr 竞争；
- 站内多页时用 `<a olink href="./other.html">` 或 `this.goto("./other.html")`，地址栏是真实路径；每个路径都必须有一份同名 HTML。

`index.html` 里还做了三件事：

1. `st-boot.js` 同步注入首帧主题（防刷新闪色）；
2. 预载四套皮肤 CSS（页面要同页并列展示四种材质）；
3. 页面末尾的 module 预加载命令式工具（alert / confirm / prompt / toast / contextMenu）与皮肤 / 主题 API，挂到 `window.__site`（ofa 页面模块不能相对 `import`）。

## 页面内容

采用 shadcn 式的组件目录首页：

- 共享 header（来自 `layout.html`）：组件 / 文档文字切换、深浅色、GitHub
- 紧凑 intro：标题、一句话说明、统计数据、组件文档 / 源码入口
- **25 张组件卡片**（`CATALOG / 25 CARDS`）：每张卡片 = 真实组件预览 + 名称 + 标签 + 站内文档 ↗
  - 预览区可交互：按钮、输入、选择、开关、滑块、标签栏、导航、折叠、对话框、菜单、Toast 等都能直接操作
  - 覆盖 20 个模块、29 个 `st-*` 标签，以及 toast / alert / confirm / prompt / contextMenu 命令式工具
- 四张局部 `data-skin` 材质卡：M3 / Apple 毛玻璃 / Windows 11 / shadcn 同页对比，可一键应用到全站
- 快速开始：安装代码、复制、文档入口
- 深浅色切换（`setThemeMode`）、皮肤切换（`setSkin`）

卡片右下角的 ↗ 会打开对应组件的独立文档页（如 `./docs/button.html`）；卡片本身不是链接，所以预览可以放心交互。

## 站内组件文档（docs/）

不再依赖旧的 `docs/` 目录（该目录准备删除）。每个组件一个独立 SCSR 页面，全部共用 `layout.html` 和文档侧栏：

- `/site/docs/index.html`：21 张组件卡片概览，分为「基础组件 18」与「辅助组件 3」
  - 基础组件：按钮、表单控件、反馈、内容与导航，承担完整业务流程
  - 辅助组件：波纹、折叠、提示，在基础组件之上做锦上添花
- `/site/docs/{button,input,...,navigation}.html`：每个组件一页，包含
  - 一句话说明、分类、标签、上一页 / 下一页
  - 可交互的真实组件示例
  - 属性表（类型 / 默认值 / 说明）
  - 插槽 / 事件 / 注意事项
  - 可折叠的示例代码
  - 指向 GitHub README 的入口
- 左侧粘性目录只在 `docs/layout.html` 维护一次，用 `st-list` + `st-list-item` 搭；父页在 `routerChange` 里按当前 URL 高亮，移动端自动显示 `st-select` 组件切换器
- 页面内用 `st-progress` 做阅读进度条、`st-icon-button` + `st-tooltip` 做回到顶部
- header 与首页完全共用；主题 / 材质切换在 header 中，只影响按钮 / 输入框
- 仍然是 SCSR：每个组件页都是可直达、可刷新、可分享的真实文档
- 页面切换有淡入 + 轻微上滑动画；header / 阅读进度常驻，内容区不因侧栏出现而重排

新增组件文档时：在 `site/docs/` 复制一个页面改内容；只改 `site/docs/layout.html` 一处，补上侧栏项与移动端 `<option>`；再在 `site/docs/index.html` 补一张卡（放进基础或辅助分组，并同步该组计数），并同步首页卡片的 `./docs/{id}.html` 链接。组件页本身不再包含侧栏。

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

与 `docs/`（现有组件文档站，o-router hash 路由）不同，本页是真实路径 + SCSR 的前向验证场景。若 v5 分支升级导致行为变化，优先修组件、再更新本页；组件级兼容问题（如子项升级时序）应沉淀到 CONTEXT 的已知坑。

## 组件覆盖

| 分区 | 使用的标签 |
|------|-----------|
| 动作 | `st-button` / `st-button-group` / `st-split-button` / `st-icon-button` / `st-badges` / `st-ripple` |
| 输入 | `st-input` / `st-textarea` / `st-select`（含 `st-option`）/ `st-checkbox` / `st-switch` / `st-radio` / `st-slider` |
| 反馈 | `st-dialog` / `st-menu` + `st-menu-item` / `st-snackbar` / `st-tooltip` / `st-progress` / toast / alert / confirm / prompt / contextMenu |
| 内容 | `st-card` / `st-list` + `st-list-item` / `st-collapse` |
| 导航 | `st-tab-bar` + `st-tab-item` / `st-nav-bar` + `st-nav-item` / `st-nav-layout` |

新增组件时：

1. 在 `site/index.html` 的 `l-m` 列表补一条；
2. 在 `template[page]` 对应分组补一张 `.spec` 卡片；
3. 若有命令式 API，在页面末尾 module 中 import 并挂到 `window.__site`；
4. 需要换肤的组件先按 `packages/skin/README.md` 接入 token。

## 皮肤说明

- 全局皮肤：`html[data-skin]` + `st-skin.js`（四套 CSS 已在 `index.html` 与页面 shadow 内预载，切换零等待）。
- 局部预览：`.skin-preview[data-skin="..."]`。文档树的 `[data-skin]` 选择器进不了 `o-page` 的 shadow，因此 `template[page]` 顶部额外 `<link>` 了同样的四套 CSS 到 shadow 内；这是本页能「同页四种材质」的关键。
- 颜色始终来自 M3：种子色、error、success、深浅色主题都不会被皮肤改变。

## 验证

```bash
npx playwright test tests/site.spec.js
npm test
```

烟雾用例检查：

- `/site/` 目录直开：25 张卡片、29 个 `st-*` 全部升级、无页面错误、`template[page]` 已被 scsr 移除、页面内没有 `/docs/` 链接；
- 皮肤 / 主题 / 对话框交互；
- 共享 layout：首页两个 `o-page`（layout + 子页）、header 文字导航 / 主题 / 回到首页，且 header 无材质菜单，品牌标记与 favicon 一致；
- 组件文档：三层 `o-page`（site layout + docs layout + 组件页）、侧栏只有一份、每页 4 组以上示例、侧栏切换、移动端 picker 跟随当前页、上一页 / 下一页、阅读进度、页面切换动画；
- 滚动外壳：`body` 不滚动、内部 `.site-scroll` 滚动、`overscroll-behavior-y: none`，header / 侧栏固定，阅读进度随内部滚动更新，路由切换复位；
- 固定弹层：页面动画结束后 `transform` 必须回到 `none`，对话框遮罩覆盖整个视口；
- 文档首页 21 张卡片进入独立页；
- 卡片右下角进入对应 `docs/{id}.html`，header 保持共享；
- 禁用 JavaScript 时 `<noscript>` 兜底可见。

## 部署

纯静态：把整个仓库（或至少 `site/` + `packages/`）放到任意静态服务器。SCSR **要求每个路径都有自己的 HTML 文件**，但**不需要任何 rewrite**；目录地址 `/site/` 由服务器补 `index.html` 即可。官网不再依赖 `docs/`。`layout.html` 与 `docs/` 下的页面需要一起部署。CDN 只依赖 ofa.js v5。

## 新增真实页面

复制 `index.html` 为 `site/about.html`，保留 `<o-app src="./app-config.js">` 与 `template[page]`，内容换掉，并保留 `export const parent = "./layout.html"`；在 header / 首页用 `this.goto("./about.html")` 或 `<a olink href="./about.html">` 跳转即可。文档页放在 `site/docs/` 下，`parent` 写 `./layout.html`。不要给 `app-config.js` 加 `home`。
