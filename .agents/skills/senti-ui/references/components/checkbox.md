# st-checkbox 复选框组件

基于 ofa.js 的复选框组件。语义由属性表达，视觉默认值全用 em（改宿主 `font-size` 等比缩放），交互由内部透明原生 `<input type="checkbox">` 承载（点击/Space 键盘/焦点）。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/checkbox/checkbox.html"></l-m>
```

组件内部已 `import "../color/st-init.js"`，自动注入 `--md-sys-color-*` 颜色体系。

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `checked` | boolean | 无 | 选中（选中态底色 primary，`color` 属性时为对应角色色） |
| `indeterminate` | boolean | 无 | 不确定态（横线），用户点击后自动退出 |
| `disabled` | boolean | 无 | 禁用：0.38 透明度、阻断交互 |
| `color` | M3 角色名 / 自定义变量名 | 无 | 选中态底色/描边/对勾色（如 `color="error"`） |

JS 修改状态用 attribute 方式：`el.setAttribute("checked", "")` / `el.removeAttribute("checked")`。

## 插槽

- 默认插槽：标签文字（无内容时自动隐藏标签）

## 事件

- `change`：用户交互切换时派发（`bubbles` + `composed`），切换后 `checked` 属性已同步：

```js
el.addEventListener("change", (e) => {
  console.log(e.target.hasAttribute("checked"));
});
```

## 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| 复选框尺寸（宽高） | `1.571em`（= 22px @ 14px） |
| 边框 | `0.143em solid on-surface-variant`，选中/不确定态为选中色 |
| 圆角 | `0.286em`（= 4px） |
| 标签与框间距 | `0.857em`（= 12px） |
| `font-size` | `14px`（宿主上改，全面板等比缩放） |
| 选中态底色 | `primary`（`color` 属性时为对应角色色），对勾 `on-primary` |
| 对勾动画 | stroke 描边入场 0.16s |

## 注意事项与使用技巧

- `checked` / `indeterminate` 是标签属性：JS 用 `setAttribute` / `removeAttribute`（直接改 property 不生效）；ofa 页面绑定用 `attr:checked="expr"`
- 用户点击会自动退出 `indeterminate` 并切换为选中态（M3 行为）
- 交互由内部透明原生 checkbox 承载（覆盖整个组件，点文字也能切换），Space 键盘可用
- 无标签内容时（`:empty`）标签区自动隐藏
- `color` 属性只影响选中态配色，未选中态边框恒为 on-surface-variant
`index.html`（直接访问 `https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/checkbox/`）。
