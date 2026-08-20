# st-list / st-list-item 列表组件

基于 ofa.js 的列表容器与列表项。`st-list` 纵向排布子项；`st-list-item` 承载内容、点击与折叠子列表。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="/packages/list/list.html"></l-m>
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

## 验证页面

`index.html`（直接访问 `/packages/list/`）。
