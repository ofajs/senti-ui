# AGENTS.md — Senti-UI 开发规则

本仓库是面向 AI 的 ofa.js 组件库。任何 Agent（或人）在本仓库新增/修改组件时，必须遵守以下规则。

## 入场必读

**第一次进入本仓库开发前，先加载 ofajs-docs 技能（Skill）阅读 ofa.js 框架文档**，才能开始开发；之后**开始任何工作前，先阅读 [CONTEXT.md](./CONTEXT.md)** 了解项目背景、核心理念、组件清单与当前状态；修改组件代码前，务必读 CONTEXT.md 中的「ofa.js 已知坑」。

## 核心设计原则

1. **语义用属性，外观用原生 CSS**
   - 属性只表达语义（状态、行为、类型），如 `disabled` / `loading` / `variant`
   - 禁止添加 `size` 类预设枚举属性，也**如无必要，不要添加自定义样式代理变量**（如 `--st-btn-height`）
   - 视觉样式必须全部定义在 `:host` 上，让外部 `style="height: ...; border-radius: ..."` 直接覆盖原生属性生效；交互语义（点击/键盘/焦点）由内部一个透明的原生元素承载（`.native` 模式，见 st-button）
   - 例外一：M3 规范内明确定义的类型（如按钮的 filled/outlined/text）可作为属性
   - 例外二：**`color` 属性**——值是 M3 角色名或 color 模块的自定义变量名（语义引用，不是样式预设），组件配对消费 `--md-sys-color-{name}/on-{name}` 或 `--{name}/--on-{name}`，实现与 color 工具的一键换色联动
   - **尺寸类默认值用 em**（height / padding / border-radius / gap 等）——AI 只改 `font-size` 即可整体等比缩放，需要精确值时也可单独覆写任一属性

2. **颜色只走 M3 角色**
   - 组件内禁止写死任何颜色值，一律消费 `--md-sys-color-*` 变量
   - 全局 token 由 `packages/color/st-color-init.js`（初始化模块）动态注入，页面统一引入它，不使用静态 CSS
   - hover/active 用 state layer（currentColor 半透明叠加 8%/12%），disabled 用 0.38 透明度——自动与任意配色协调，无需变量

3. **文档即 API**
   - 每个组件的 README.md 必须自包含：依赖引入、属性表、插槽、事件、默认值清单、可运行示例
   - 不写营销性描述，只写 AI 使用时需要的事实

4. **无构建**
   - 纯静态：CDN 引入 ofa.js + `<l-m>` 按需加载组件，可直接部署
   - 不引入 Node/打包工具链

## 目录与命名约定

```
packages/{name}/
  {name}.html    # ofa.js 组件
  README.md      # AI 友好文档（自包含）
  index.html     # 验收页加载器（引入 ofa.js + st-color-init.js + l-m 组件 + o-page）
  page.html      # ofa.js 页面模块（验收页内容与逻辑，由 index.html 的 <o-page> 加载）
CONTEXT.md       # 项目全景 + 组件总索引 + ofa.js 已知坑（新组件必须登记）
packages/color/  # M3 体系生成器 + st-color-init.js（颜色唯一来源）
packages/boot/    # st-boot.js 项目同步引导（可选增强：首帧缓存/兜底注入 + 自动加载 color init）
```

- 组件标签：`st-` 前缀（`st-button`）
- 组件的 Style API 就是原生 CSS 属性本身：在 README 中列出各属性的默认值清单，不发明变量

## 新增组件流程

1. 在 `packages/{name}/` 创建组件、README、index.html、page.html 四件套
2. 在 `CONTEXT.md` 组件清单表中登记（标签、引入语句、文档链接）
3. 用 `npm run dev` 起服务（禁缓存），浏览器验证验收页，确认无误才算完成

## 坑的沉淀规则

开发中踩到 ofa.js / CDN / 缓存 / 浏览器兼容等任何坑并解决后，**必须**在解决当时就把这条经验沉淀到 [CONTEXT.md](./CONTEXT.md) 的「ofa.js 已知坑」章节（保持一条一坑：现象 + 原因 + 正确写法），防止下次重复踩坑、重复排查。非 ofa.js 类的坑（如部署、测试工具）可在该章节后另起小节存放。

## senti-ui 技能（.agents/skills/senti-ui/）维护规则

- 技能内的文件引用（含 SKILL.md 与 references/ 内的文档互链）**必须用相对地址，且不得超出技能目录**——该目录以后会被整体导出为技能发布到其他地方，超出目录的引用在导出后会失效（组件引入的 jsdelivr CDN URL 属于运行时地址，不受此限制）
- SKILL.md frontmatter 的 `version` **与仓库 release 版本号保持一致**（如 `1.0.5` 对应 tag `v1.0.5`），发版时用 `npm run bump [patch|minor|major|x.y.z]` 一键同步 package.json + SKILL.md 并自动打包技能（`scripts/bump.mjs`）——技能内的 jsdelivr URL 不锁版本、始终跟随最新 tag，version 是消费方判断文档是否过期的唯一线索
- **只要更新了组件使用**（属性/插槽/事件/用法变更，或新增组件），除了更新对应的 `packages/{name}/README.md`，**必须同步更新 senti-ui 技能**：`references/components/{name}.md`（从 README 同步，仓库相对路径 `/packages/...` 改写为 jsdelivr 完整 URL）与 `references/components.md` 速查表（新组件要登记）
- **技能内示例代码必须 ofa.js API 优先**（「写法优先级」声明统一放在技能的 SKILL.md 中，组件文档不重复写）：ofa 页面场景一律用模板绑定语法（`{{xxx}}` / `attr:xxx`（布尔属性必须 `attr:`） / `sync:value` / `sync:open` / `on:click`）或 ofa 数据读写（`el.value` 等已反射的运行时状态）；纯 JS 场景用 ofa 实例 API（`$("sel").attr(name, value)`（设值传具体值、设裸属性传 `""`、移除传 `null`）、`$("sel").on("event", fn)`）。**不写 `setAttribute` / `removeAttribute` / `document.querySelector(...).addEventListener(...)` 等原生 DOM API**；确需提示"非 ofa 环境 / 自动化测试"的差异时，用文字说明而不是示例代码

## 临时文件

`.playwright-mcp/`（浏览器验证产生的快照/日志）已在 `.gitignore` 中忽略，不要提交。
