# AGENTS.md — Senti-UI 开发规则

本仓库是面向 AI 的 ofa.js 组件库。任何 Agent（或人）在本仓库新增/修改组件时，必须遵守以下规则。

## 入场必读

**第一次进入本仓库开发前，先加载 ofajs-docs 技能（Skill）阅读 ofa.js 框架文档**，才能开始开发；之后**开始任何工作前，先阅读 [CONTEXT.md](./CONTEXT.md)** 了解项目背景、核心理念、组件清单与当前状态；修改组件代码前，务必读 CONTEXT.md 中的「ofa.js 已知坑」。

## 核心设计原则

1. **语义用属性，外观用原生 CSS**
   - 属性只表达语义（状态、行为、类型），如 `disabled` / `loading` / `variant`
   - 禁止添加 `size` 类预设枚举属性，也**不要添加给使用者的自定义样式代理变量**（如 `--st-btn-height`）
   - **例外：皮肤 token**——`packages/skin/` 的 `--st-*` 是**皮肤作者 API**，不是使用者预设。新组件必须把自己的材质视觉写成 `var(--st-xxx, 旧默认值)`（圆角/密度/描边/阴影/焦点环/动效等），并暴露必要的 `part`；使用者仍然只写原生 CSS。颜色永远不放进皮肤 token，继续消费 `--md-sys-color-*`
   - 视觉样式必须全部定义在 `:host` 上，让外部 `style="height: ...; border-radius: ..."` 直接覆盖原生属性生效；交互语义（点击/键盘/焦点）由内部一个透明的原生元素承载（`.native` 模式，见 st-button）
   - 例外一：M3 规范内明确定义的类型（如按钮的 filled/outlined/text）可作为属性
   - 例外二：**`color` 属性**——值是 M3 角色名或 color 模块的自定义变量名（语义引用，不是样式预设），组件配对消费 `--md-sys-color-{name}/on-{name}` 或 `--{name}/--on-{name}`，实现与 color 工具的一键换色联动
   - **尺寸类默认值用 em**（height / padding / border-radius / gap 等）——AI 只改 `font-size` 即可整体等比缩放，需要精确值时也可单独覆写任一属性
   - **表单语义**：交互控件需要参与原生 `<form>` 时，用 `packages/form/form-proxy.js` 的 light DOM 代理控件承载 `name` / value / required / 校验；ofa 生成的类没有 formAssociated，不要假设内部 shadow 控件能提交表单。代理会破坏 `:host(:empty)`，标签显隐改用 `has-label` 属性
   - **无障碍是交付的一部分**：内部 `.native` 原生控件与 slot 文本是兄弟节点，必须用 `packages/a11y/a11y.js` 的 `syncAccessibleName(host, control, { fromSlot })` 同步可访问名称，并把宿主 `aria-label` / `title` 转发给内部控件；自绘弹层补 `role` 与展开/选中状态（select 的 combobox/listbox、menu 的 menu/menuitem），模态层补焦点陷阱/焦点归还/滚动锁。可点击容器的点击语义放宿主，不要用覆盖全卡的绝对定位 button（会挡住卡内按钮/链接）

2. **颜色只走 M3 角色**
   - 组件内禁止写死任何颜色值，一律消费 `--md-sys-color-*` 变量
   - 全局 token 由 `packages/color/st-color-init.js`（初始化模块）动态注入，页面统一引入它，不使用静态 CSS
   - hover/active 用 state layer（currentColor 半透明叠加，默认 8%/12%，可由 `--st-state-hover/press` 覆盖），disabled 默认 0.38 透明度（`--st-disabled-opacity`）——自动与任意配色协调，无需按组件发明变量

3. **文档即 API**
   - 每个组件的 README.md 必须自包含：依赖引入、属性表、插槽、事件、默认值清单、可运行示例
   - 不写营销性描述，只写 AI 使用时需要的事实

4. **无构建**
   - 纯静态：CDN 引入 ofa.js + `<l-m>` 按需加载组件，可直接部署
   - 不引入 Node/打包工具链

## 皮肤（材质层）规则

- 皮肤只改材质（圆角、密度、边框、阴影、毛玻璃、焦点环、动效、波纹），**不改颜色**；所有皮肤消费同一套 `--md-sys-color-*`，种子色 / error / success / 深浅色必须继续生效
- 皮肤 CSS **只声明 `[data-skin="名称"]` 作用域下的 token**，不写 `st-button { ... }` 宿主选择器、不依赖 `::part`：组件常见于 `o-page` / `o-app` 的 shadow 内，文档树选择器与 part 都跨不进去，CSS 变量才是可靠通道（详见 CONTEXT 坑 #43/#47）
- 皮肤规则不要用 `@layer` 包裹（会输给 shadow 内未分层的 `:host`，见坑 #44）
- 新增/修改组件视觉时：可换肤的属性一律加 token 回退（不加载皮肤必须与当前外观完全一致）；token 命名遵循 `packages/skin/README.md` 的分组，补文档并在验收页展示至少一套非 M3 皮肤
- 需要暴露内部元素时用 `part="kebab-case"` 并在 README 登记；但不要把 part 当作换肤的必要机制

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
packages/skin/    # 皮肤系统（材质 token + st-skin.js；颜色仍只来自 color 模块）
```

- 组件标签：`st-` 前缀（`st-button`）
- 组件的 Style API 就是原生 CSS 属性本身：在 README 中列出各属性的默认值清单，不发明变量

## 新增组件流程

1. 在 `packages/{name}/` 创建组件、README、index.html、page.html 四件套
2. 组件视觉按皮肤 token 约定书写（`var(--st-*, 旧默认值)`），颜色只走 M3 角色；需要外部定制的内部元素加 `part`
3. 在 `CONTEXT.md` 组件清单表中登记（标签、引入语句、文档链接），并在 `packages/skin/README.md` 补本组件消费的 token / part 行
4. 在验收页展示至少一套非 M3 皮肤（`data-skin="apple"` / `windows` / `shadcn`）下的样子
5. 用 `npm run dev` 起服务（禁缓存），浏览器验证验收页（含换肤与深浅色），确认无误才算完成

## 坑的沉淀规则

开发中踩到 ofa.js / CDN / 缓存 / 浏览器兼容等任何坑并解决后，**必须**在解决当时就把这条经验沉淀到 [CONTEXT.md](./CONTEXT.md) 的「ofa.js 已知坑」章节（保持一条一坑：现象 + 原因 + 正确写法），防止下次重复踩坑、重复排查。非 ofa.js 类的坑（如部署、测试工具）可在该章节后另起小节存放。

## senti-ui 技能（.agents/skills/senti-ui/）维护规则

- 技能内的文件引用（含 SKILL.md 与 references/ 内的文档互链）**必须用相对地址，且不得超出技能目录**——该目录以后会被整体导出为技能发布到其他地方，超出目录的引用在导出后会失效（组件引入的 jsdelivr CDN URL 属于运行时地址，不受此限制）
- SKILL.md frontmatter 的 `version` **与仓库 release 版本号保持一致**（如 `1.0.5` 对应 tag `v1.0.5`），发版时用 `npm run bump [patch|minor|major|x.y.z]` 一键同步 package.json + SKILL.md 并自动打包技能（`scripts/bump.mjs`）——技能内的 jsdelivr URL 不锁版本、始终跟随最新 tag，version 是消费方判断文档是否过期的唯一线索
- **只要更新了组件使用**（属性/插槽/事件/用法变更，或新增组件），除了更新对应的 `packages/{name}/README.md`，**必须同步更新 senti-ui 技能**：`references/components/{name}.md`（从 README 同步，仓库相对路径 `/packages/...` 改写为 jsdelivr 完整 URL）与 `references/components.md` 速查表（新组件要登记）
- **技能同步必须在改动完成的当次主动完成，不等用户提醒**：同步不是可选的收尾动作，而是组件改动交付定义的一部分——README 更新后没同步技能 = 任务未完成。同步完成后要自查两件事：① 技能内所有 import / l-m 路径都是 jsdelivr 完整 URL（README 里惯用的 `/packages/...` 仓库相对路径直接复制过来即违规）；② 新增的命令式工具（`*.js` 导出的函数，如 context-menu.js / toast.js / alert.js）也要在技能中登记完整用法（`references/components/{name}.md` 专节 + `components.md` 速查行），与组件本体同等对待
- **技能内示例代码必须 ofa.js API 优先**（「写法优先级」声明统一放在技能的 SKILL.md 中，组件文档不重复写）：ofa 页面场景一律用模板绑定语法（`{{xxx}}` / `attr:xxx`（布尔属性必须 `attr:`） / `sync:value` / `sync:open` / `on:click`）或 ofa 数据读写（`el.value` 等已反射的运行时状态）；纯 JS 场景用 ofa 实例 API（`$("sel").attr(name, value)`（设值传具体值、设裸属性传 `""`、移除传 `null`）、`$("sel").on("event", fn)`）。**不写 `setAttribute` / `removeAttribute` / `document.querySelector(...).addEventListener(...)` 等原生 DOM API**；确需提示"非 ofa 环境 / 自动化测试"的差异时，用文字说明而不是示例代码

## 临时文件

`.playwright-mcp/`（浏览器验证产生的快照/日志）已在 `.gitignore` 中忽略，不要提交。
