# Senti-UI 官网首页（site/）

单页聚合型官网：把 20 个组件模块（29 个 `st-*` 标签）全部摆在一页里，按「动作 / 输入 / 反馈 / 内容 / 导航」分区展示，同时演示皮肤切换、深浅色主题、命令式工具与响应式布局。

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
  index.html     # 完整文档 + o-app + 内联 template[page]（页面内容、样式、脚本）
  app-config.js  # o-app 配置（不声明 home；只有页面切换淡入淡出）
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

- scsr 接管后，把当前 URL（`/site/` 或 `/site/index.html`）收编为 `<o-page src>`，用同一份 HTML 的 `template[page]` 转译成页面模块，然后移除内联 template；
- 页面本体随后渲染在 `o-page` 的 shadow 内，`:host` 样式、`this.ele.shadowRoot` 等写法与普通页面模块一致；
- `app-config.js` **不声明 home**：首页就是当前 URL 的页面，声明 home 会与 scsr 竞争；
- 站内多页时用 `<a olink href="./other.html">` 或 `this.goto("./other.html")`，地址栏是真实路径；每个路径都必须有一份同名 HTML。

`index.html` 里还做了三件事：

1. `st-boot.js` 同步注入首帧主题（防刷新闪色）；
2. 预载三套皮肤 CSS（页面要同页并列展示三种材质）；
3. 页面末尾的 module 预加载命令式工具（alert / confirm / prompt / toast / contextMenu）与皮肤 / 主题 API，挂到 `window.__site`（ofa 页面模块不能相对 `import`）。

## 页面内容

采用 shadcn 式的组件目录首页：

- 紧凑 intro：标题、一句话说明、材质切换、统计数据、文档/源码入口
- **25 张组件卡片**（`CATALOG / 25 CARDS`）：每张卡片 = 真实组件预览 + 名称 + 标签 + 文档 ↗
  - 预览区可交互：按钮、输入、选择、开关、滑块、标签栏、导航、折叠、对话框、菜单、Toast 等都能直接操作
  - 覆盖 20 个模块、29 个 `st-*` 标签，以及 toast / alert / confirm / prompt / contextMenu 命令式工具
- 三张局部 `data-skin` 材质卡：M3 / Apple 毛玻璃 / shadcn 同页对比，可一键应用到全站
- 快速开始：安装代码、复制、文档入口
- 深浅色切换（`setThemeMode`）、皮肤切换（`setSkin`）

卡片右下角的 ↗ 会打开对应的 `docs/` 验收页；卡片本身不是链接，所以预览可以放心交互。

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

- 全局皮肤：`html[data-skin]` + `st-skin.js`（三套 CSS 已在 `index.html` 与页面 shadow 内预载，切换零等待）。
- 局部预览：`.skin-preview[data-skin="..."]`。文档树的 `[data-skin]` 选择器进不了 `o-page` 的 shadow，因此 `template[page]` 顶部额外 `<link>` 了同样的三套 CSS 到 shadow 内；这是本页能「同页三种材质」的关键。
- 颜色始终来自 M3：种子色、error、success、深浅色主题都不会被皮肤改变。

## 验证

```bash
npx playwright test tests/site.spec.js
npm test
```

烟雾用例检查：

- `/site/` 目录直开：25 张卡片、29 个 `st-*` 全部升级、无页面错误、`template[page]` 已被 scsr 移除；
- 皮肤 / 主题 / 对话框交互；
- 禁用 JavaScript 时 `<noscript>` 兜底可见。

## 部署

纯静态：把整个仓库（或至少 `site/` + `packages/` + `docs/`）放到任意静态服务器。SCSR **要求每个路径都有自己的 HTML 文件**，但**不需要任何 rewrite**；目录地址 `/site/` 由服务器补 `index.html` 即可。CDN 只依赖 ofa.js v5。

## 新增真实页面

复制 `index.html` 为 `site/about.html`，保留 `<o-app src="./app-config.js">` 与 `template[page]`，把内容换掉；在首页用 `<a olink href="./about.html">` 跳转即可。不要给 `app-config.js` 加 `home`。
