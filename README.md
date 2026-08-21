# Senti-UI

**面向 AI 的 UI 组件库**：基于 [ofa.js](https://github.com/ofajs/ofa.js)（Web Components 框架），颜色体系采用 Google Material Design 3（M3）。**无构建、纯静态，CDN 引入即用**。

仓库地址：<https://github.com/ofajs/senti-ui>

## 设计理念（与传统组件库的区别）

传统组件库为人设计大量"便利预设"（`size="small"` 这类枚举）。Senti-UI 认为 AI 直接写 style/CSS 更精确灵活，预设只是多余的记忆负担，因此：

- **属性只表达语义**（`disabled` / `loading` / M3 规范内的 `variant` / `color` 语义色引用），没有 size 类预设，也没有 `--st-*` 样式代理变量
- **外观直接用原生 CSS 属性定制**——组件视觉全部定义在 `:host` 上，`<st-button style="height:32px; border-radius:8px">` 直接生效
- **尺寸默认值全用 em**——只改 `font-size` 即整体等比缩放
- **颜色永不写死**，一律消费 `--md-sys-color-*` M3 角色变量，自动适配深浅色主题
- **`color` 属性是语义引用**：值是 M3 角色名或 color 工具里定义的自定义变量名（如 `color="brand"` 消费 `--brand/--on-brand`），与 color 工具联动实现一键换色
- **文档写给 AI 读**：自包含、结构化、只含事实

## 快速开始

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
</head>
<body>
  <!-- 按需引入组件（用哪个引哪个） -->
  <l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/button/button.html"></l-m>

  <st-button color="error" variant="outlined">Delete</st-button>
  <st-button>
    <span slot="prefix">🔍</span>Search
  </st-button>
</body>
</html>
```

- 组件内部会自动 import 颜色初始化模块（`st-init.js`）注入 `--md-sys-color-*` 体系，无需额外配置
- 深浅色主题默认跟随系统；强制用 `<html class="st-light">` / `<html class="st-dark">`
- 主题定制（种子色、自定义色）用 [M3 颜色体系生成器](#主题定制)：调好配色后，同域所有页面自动跟随

## 组件清单

CDN 前缀统一为 `https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main`，下表引入语句省略前缀（实际使用必须写全）。文档在各组件目录的 `README.md`（如 `.../packages/button/README.md`）。

| 组件 | 标签 | 引入 |
|------|------|------|
| Button 按钮 | `st-button` | `<l-m src=".../packages/button/button.html"></l-m>` |
| Button-group 按钮组 | `st-button-group` | `.../packages/button/button-group.html` |
| Split-button 分裂按钮 | `st-split-button` | `.../packages/button/split-button.html` |
| Icon-button 图标按钮 | `st-icon-button` | `.../packages/button/icon-button.html` |
| Input 单行输入框 | `st-input` | `.../packages/input/input.html` |
| Textarea 多行输入框 | `st-textarea` | `.../packages/textarea/textarea.html` |
| Select 单选下拉框 | `st-select` | `.../packages/select/select.html` |
| Dialog 对话框 | `st-dialog` | `.../packages/dialog/dialog.html` |
| Dialog 命令式工具 | `stAlert/stConfirm/stPrompt` | `import stAlert from ".../packages/dialog/alert.js"` 等 |
| Checkbox 复选框 | `st-checkbox` | `.../packages/checkbox/checkbox.html` |
| Switch 开关 | `st-switch` | `.../packages/switch/switch.html` |
| Radio 单选按钮 | `st-radio` | `.../packages/radio/radio.html` |
| Snackbar 消息条 | `st-snackbar` | `.../packages/snackbar/snackbar.html` |
| Toast 命令式工具 | `stToast` | `import stToast from ".../packages/snackbar/toast.js"` |
| Slider 滑块 | `st-slider` | `.../packages/slider/slider.html` |
| Progress 进度 | `st-progress` | `.../packages/progress/progress.html` |
| Tooltip 提示 | `st-tooltip` | `.../packages/tooltip/tooltip.html` |
| Card 卡片 | `st-card` | `.../packages/card/card.html` |
| Badges 徽标 | `st-badges` | `.../packages/badges/badges.html` |
| Collapse 折叠容器 | `st-collapse` | `.../packages/collapse/collapse.html` |
| List 列表 | `st-list` / `st-list-item` | `.../packages/list/list.html` |
| Menu 下拉菜单 | `st-menu` / `st-menu-item` | `.../packages/menu/menu.html` |
| Tabs 标签栏 | `st-tab-bar` / `st-tab-item` | `.../packages/tabs/tab-bar.html` |
| Navigation 导航栏 | `st-nav-bar` / `st-nav-item` | `.../packages/navigation/nav-bar.html` |
| Ripple 波纹 | `st-ripple` | `.../packages/ripple/ripple.html` |

## 关键使用模式

- **运行时状态不是标签属性**——`st-input`/`st-select`/`st-slider` 的 `value`，`st-dialog`/`st-tooltip` 的 `open` 等是运行时状态：JS 用 `el.value` / `el.open` 读写，`setAttribute("value")` 无效（初始值用 `default-value` 标签属性）
- **布尔属性的 JS 修改必须用 `setAttribute` / `removeAttribute`**——直接改 property 不触发更新
- 命令式工具即用即毁，返回 Promise，对齐原生语义：

```html
<script type="module">
  import stConfirm from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/dialog/confirm.js";
  import stToast from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/snackbar/toast.js";

  if (await stConfirm("确认删除？")) {   // true / false / null（被关闭）
    stToast("已删除", { duration: 3000 }); // 左下角 toast，返回 { close, el }
  }
</script>
```

## 主题定制

[M3 颜色体系生成器](https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/color/index.html) 从种子色生成完整浅色/深色 M3 体系（`--md-sys-color-*`），支持核心四角色 + 扩展角色 success 覆盖与自定义变量（自动展开 `--brand` / `--on-brand` 等配对 token）。配置存 localStorage——在工具里调好配色，同域所有引入 `st-init.js` 的页面自动跟随（一键换色）。

需要手动控制时：

```html
<script type="module" src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/color/st-init.js"></script>
```

## AI 使用

本库附带 Agent Skill（`.agents/skills/senti-ui/`），Claude Code / ZCode 等 AI 工具加载后即可正确使用全部组件：组件属性、插槽、事件、运行时状态读写方式与常见坑。详见 [SKILL.md](./.agents/skills/senti-ui/SKILL.md)。

## 本地开发

```bash
npm install
npm run dev    # http-server 禁缓存，端口 8642
npm test       # Playwright 端到端测试（须先 npx playwright install chromium）
```

- 新增/修改组件请先阅读 [AGENTS.md](./AGENTS.md)（开发规则）与 [CONTEXT.md](./CONTEXT.md)（项目全景 + 组件索引 + ofa.js 已知坑）
- 组件官网：`docs/` 目录，本地 `http://localhost:8642/docs/`

## License

见 [LICENSE](./LICENSE)。
