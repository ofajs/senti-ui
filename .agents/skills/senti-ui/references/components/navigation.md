# st-nav-bar / st-nav-item 导航栏组件

> **写法优先级**：ofa 页面（`<o-page>` / `<o-app>`）中优先用模板绑定语法：数据绑定 `{{xxx}}`、属性绑定 `attr:xxx="expr"`（布尔属性必须 `attr:`，不能 `:prop`）、双向绑定 `sync:value` / `sync:open`、事件 `on:click` / `on:input`（根级直接写方法名）。纯 JS 场景用 ofa 实例 API：`$("sel").attr(name, value)`（布尔属性 true 添加 / false 移除）、`$("sel").on("event", fn)`。不要写 `setAttribute` / `document.querySelector(...).addEventListener(...)` 等原生 DOM API。详见 [../usage-patterns.md](../usage-patterns.md)。

基于 ofa.js 的底部导航栏（M3 navigation bar）。子项写在 light DOM 的 `st-nav-item`，`active` 属性标记当前项（由外部逻辑切换）；药丸形高亮背景自动动画跟随 active 项（M3 emphasized 0.3s）。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/navigation/nav-bar.html"></l-m>
```

## 语义属性（st-nav-item）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `active` | boolean | 无 | 当前项：药丸背景 secondary-container 跟随，文字 on-secondary-container |
| `disabled` | boolean | 无 | 禁用：0.38 透明度、阻断点击 |

## 插槽（st-nav-item）

- `icon`：图标
- 默认插槽：标签文字（12px）

## 事件（st-nav-item）

- `click`：用户点击时冒泡到宿主（`bubbles` + `composed`），active 切换由外部处理（写法同 st-tab-bar，见 tabs README）。

## 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| item padding | `0.857em 1em` |
| icon 药丸区 | `4em × 2.286em`（= 56×32px），圆角 `2em` |
| 图标字号 | `1.714em`（24px）；标签 `0.857em`（12px） |
| active 药丸 | `secondary-container` 底色，导航栏内绝对定位动画跟随 |
| 未选中色 | `on-surface-variant` |
| hover/active | state layer（currentColor 8%/12%，药丸范围内） |
| `font-size` | `14px` |

## 示例

```html
<st-nav-bar>
  <st-nav-item active><span slot="icon">🏠</span>首页</st-nav-item>
  <st-nav-item><span slot="icon">🔍</span>发现</st-nav-item>
  <st-nav-item><span slot="icon">👤</span>我的</st-nav-item>
</st-nav-bar>
```

## 注意事项与使用技巧

- `active` 由**外部逻辑**切换（同 st-tab-bar）：`attr:active="current === i"` + `on:click` 改数据
- 药丸高亮自动动画跟随 active 项（对齐子项内部 icon 区域）；无 active 项时药丸隐藏
- 底部导航场景给宿主加 `position: fixed; bottom: 0; left: 0; right: 0`
- disabled 项原生阻断点击；icon 用 `slot="icon"`（24px 建议尺寸）
`index.html`（直接访问 `https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/navigation/`）。
