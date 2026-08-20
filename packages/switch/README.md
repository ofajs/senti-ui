# st-switch 开关组件

基于 ofa.js 的开关组件。语义由属性表达，视觉默认值全用 em，交互由内部透明原生 `<input type="checkbox">` 承载（点击/Space 键盘/焦点）。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="/packages/switch/switch.html"></l-m>
```

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `checked` | boolean | 无 | 开启（轨道变 primary、拇指滑到右侧并缩小） |
| `disabled` | boolean | 无 | 禁用：0.38 透明度、阻断交互 |
| `color` | M3 角色名 / 自定义变量名 | 无 | 开启态轨道色（拇指自动用 on-角色色） |

JS 修改状态用 attribute 方式：`el.setAttribute("checked", "")` / `el.removeAttribute("checked")`。

## 插槽

- 默认插槽：标签文字（无内容时自动隐藏标签）

## 事件

- `change`：用户交互切换时派发（`bubbles` + `composed`），切换后 `checked` 属性已同步。

## 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| 轨道尺寸 | `3.286em × 2em`（= 46×28px @ 14px，M3 比例） |
| 轨道边框 | `0.143em solid outline`，开启态为开启色 |
| 拇指尺寸 | 未选中 `1.571em`（22px）/ 选中 `1.143em`（16px，M3 选中缩小） |
| 拇指位移 | 选中时右移 `1.714em`（M3 emphasized 0.2s） |
| 标签间距 | `0.857em` |
| `font-size` | `14px` |
| 开启态轨道 | `primary`（`color` 属性时为对应角色色），拇指 `on-primary` |

## 注意事项与使用技巧

- `checked` 是标签属性：JS 用 `setAttribute` / `removeAttribute`；ofa 页面绑定用 `attr:checked="expr"`
- 交互由内部透明原生 checkbox 承载（覆盖整个组件，点文字也能切换），Space 键盘可用
- `color` 属性只影响开启态轨道/拇指色，未选中态恒为 outline/surface 系
- 拇指选中时会缩小（M3 规范），不要用外部 style 强行改拇指尺寸
## 验证页面

`index.html`（直接访问 `/packages/switch/`）。
