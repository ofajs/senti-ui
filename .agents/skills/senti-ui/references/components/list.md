# st-list / st-list-item 列表组件

> **写法优先级**：ofa 页面（`<o-page>` / `<o-app>`）中优先用模板绑定语法：数据绑定 `{{xxx}}`、属性绑定 `attr:xxx="expr"`（布尔属性必须 `attr:`，不能 `:prop`）、双向绑定 `sync:value` / `sync:open`、事件 `on:click` / `on:input`（根级直接写方法名）。纯 JS 场景用 ofa 实例 API：`$("sel").attr(name, value)`（布尔属性 true 添加 / false 移除）、`$("sel").on("event", fn)`。不要写 `setAttribute` / `document.querySelector(...).addEventListener(...)` 等原生 DOM API。详见 [../usage-patterns.md](../usage-patterns.md)。

基于 ofa.js 的列表容器与列表项。`st-list` 纵向排布子项；`st-list-item` 承载内容、点击与折叠子列表。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/list/list.html"></l-m>
```

（`st-list` 内部已加载 `list-item.html`，`st-list-item` 也可单独引入。）

## 语义属性（st-list-item）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `button` | boolean | 无 | 可点击项：hover/active state layer + 波纹 + click 事件 |
| `disabled` | boolean | 无 | 禁用：0.38 透明度、阻断交互 |
| `collapsible` | boolean | 无 | 可折叠项：显示展开箭头，点击切换 `expanded` |
| `expanded` | boolean | 无 | 子列表展开（配合 `collapsible`） |

## 插槽（st-list-item）

- `prefix` / `suffix`：前置/后置内容（icon 等，`on-surface-variant` 色）
- 默认插槽：正文；子元素加 `secondary` 属性显示为副文本（小号灰字）
- `sublist`：子列表（通常放 `st-list`；`collapsible` 时折叠动画展开）

`st-list` 内分隔线直接放原生 `<hr>`。

## 事件（st-list-item）

- `click`：点击 `button` 项时自然冒泡到宿主（原生 DOM 行为，`composed`）。`disabled` 项原生阻断、无 click；折叠项点击只切换 `expanded`，不派发 click。

## 嵌套缩进

子列表（`sublist`）每一层自动缩进 1em（随 `font-size` 等比），**通过列表项内部的占位元素实现**——不是给子列表加 margin，所以每一行的点击区 / hover / 波纹仍然是整行宽，不会出现交互区被挤压错位的问题。缩进深度由组件按祖先 `st-list` 层数自动计算（二级缩进 1em、三级 2em…）。

每层缩进量可整体调整：在外层容器上覆盖 `--st-list-step`（默认 `1em`）。

```html
<!-- 每层缩进 2em -->
<st-list style="--st-list-step: 2em;"> ... </st-list>
```

## 默认值（st-list-item，直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| min-height | `3em`（= 42px） |
| padding | `0.5em 1em` |
| 圆角 | 首尾项 `1.143em`、中间项 `0.5em`（自动） |
| prefix/suffix 间距 | `1em` / `0.571em` |
| `font-size` | `14px` |
| hover/active | state layer（currentColor 8%/12%） |

## 示例

```html
<st-list>
  <st-list-item button><span slot="prefix">📥</span>收件箱<span slot="suffix">12</span></st-list-item>
  <st-list-item button><span slot="prefix">📤</span>已发送</st-list-item>
  <hr>
  <st-list-item collapsible expanded>
    <span slot="prefix">📁</span>文件夹
    <st-list slot="sublist">
      <st-list-item button>工作</st-list-item>
      <st-list-item button>生活</st-list-item>
    </st-list>
  </st-list-item>
</st-list>
```

## 注意事项与使用技巧

- 嵌套缩进自动逐级累加（每层 1em），由**行内占位元素**实现——不要给 sublist 加 margin/padding 左缩进（会挤压交互区）
- 每层缩进量用 `--st-list-step` 调整（如 `style="--st-list-step: 2em;"` 写在外层 st-list 上）
- `button` 项的 click 是原生冒泡（composed）；plain 项点击也会自然冒泡（普通 DOM 行为）；`disabled` 项原生阻断无 click；折叠项点击只切换 `expanded` 不派发 click
- 副文本：子元素加 `secondary` 属性；分隔线直接放 `<hr>`
- 折叠动画：二级及以上折叠时外层逐帧跟随（瞬时），属正常表现
`index.html`（直接访问 `https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/list/`）。
