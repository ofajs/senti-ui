# st-radio 单选按钮组件

基于 ofa.js 的单选按钮组件。语义由属性表达，视觉默认值全用 em，交互由内部透明原生 `<input type="radio">` 承载（点击/键盘/焦点）。

**同组互斥**：原生 radio 的 name 分组不跨 shadow root，组件用 `name` 属性作为分组键，选中时自动取消**同一树作用域**（document 或同一个 o-page shadow root）内同 `name` 的其他 `st-radio`。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/radio/radio.html"></l-m>
```

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `name` | string | 无 | 分组键（同一树作用域内互斥），同时作为表单字段名 |
| `checked` | boolean | 无 | 选中（圆点放大入场，`color` 属性时为对应角色色） |
| `disabled` | boolean | 无 | 禁用：0.38 透明度、阻断交互 |
| `color` | M3 角色名 / 自定义变量名 | 无 | 选中态描边/圆点色 |
| `value` / `required` | string / boolean | `"on"` / 无 | 表单提交值 / 同组必选 |

## 插槽

- 默认插槽：标签文字（无内容时自动隐藏标签）

## 事件

- `change`：用户选中时派发（`bubbles` + `composed`）。被取消选中的兄弟项**不**派发。

## 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| 圆圈尺寸 | `1.571em`（= 22px） |
| 边框 | `0.143em solid on-surface-variant`，选中态 primary |
| 选中圆点 | `0.714em`（= 10px），弹性入场 0.2s（M3 emphasized） |
| 标签间距 | `0.857em` |
| `font-size` | `14px` |

## 示例

```html
<st-radio name="fruit" checked>苹果</st-radio>
<st-radio name="fruit">香蕉</st-radio>
<st-radio name="fruit" disabled>樱桃（禁用）</st-radio>
```

## 注意事项与使用技巧

- **同组互斥靠 `name` 属性**：原生 radio 分组不跨 shadow root，组件在同一树作用域 + 同一 form owner 内查询同 `name` 的 `st-radio` 手动互斥——不再要求写在同一个父容器里，两个独立 `<form>` 互不影响
- 被取消选中的兄弟项**不**派发 change，只有被点击的项派发
- `checked` / `disabled` 用 attribute 方式修改；`color` 只影响选中态描边/圆点色
- 无标签内容时标签区自动隐藏
`index.html`（直接访问 `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/radio/`）。

- 同名分组按「同一树作用域 + 同一 form owner」隔离，两个独立 `<form>` 中的同名项互不影响
- 键盘：组内 roving tabindex + `←/↑/→/↓` 循环移动并选中
- 无障碍：默认插槽文字会成为内部 radio 的可访问名称，也可用宿主 `aria-label` 覆盖

## 表单

支持 `name` / `value`（默认 `"on"`）/ `required`；同组代理 radio 按 `name` 提交选中项的 `value`。
