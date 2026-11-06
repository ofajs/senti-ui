# st-switch 开关组件

基于 ofa.js 的开关组件。语义由属性表达，视觉默认值全用 em，交互由内部透明原生 `<input type="checkbox">` 承载（点击/Space 键盘/焦点）。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/switch/switch.html"></l-m>
```

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `checked` | boolean | 无 | 开启（轨道变 primary、拇指滑到右侧并缩小） |
| `disabled` | boolean | 无 | 禁用：0.38 透明度、阻断交互 |
| `color` | M3 角色名 / 自定义变量名 | 无 | 开启态轨道色（拇指自动用 on-角色色） |
| `name` / `value` / `required` | string / string / boolean | 无 / `"on"` / 无 | 原生表单字段 |

纯 JS 修改状态用 ofa API：`$("st-switch").attr("checked", "")` / `$("st-switch").attr("checked", null)`（设置裸属性传 `""`，移除传 `null`，设值直接传值）。

## 插槽

- 默认插槽：标签文字（无内容时自动隐藏标签）

## 事件

- `change`：用户交互切换时派发（`bubbles` + `composed`），切换后 `checked` 属性已同步。

## 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| 轨道尺寸 | `3.714em × 2.286em`（= 52×32px @ 14px） |
| 轨道边框 | `0.143em（2px）solid outline`，浅灰底 `surface-container-highest` |
| 拇指尺寸 | `1.714em`（24px）；未选中 `scale(0.6)` 收缩、outline 灰，选中复原、`on-primary` 白 + 对勾 |
| 拇指动效 | 0.3s `cubic-bezier(0.4, 0, 0.2, 1)` 位移+缩放；对勾 stroke 描边入场 0.16s |
| 开启态轨道 | 背景色过渡为角色色实心填充（描边同色，无缝过渡），颜色为 `primary` / `color` 角色色 |
| 标签间距 | `0.857em` |
| `font-size` | `14px` |

## 注意事项与使用技巧

- `checked` 是标签属性：JS 用 `setAttribute` / `removeAttribute`；ofa 页面绑定用 `attr:checked="expr"`
- 交互由内部透明原生 checkbox 承载（覆盖整个组件，点文字也能切换），Space 键盘可用
- `color` 属性只影响开启态轨道/拇指色，未选中态恒为 outline/surface 系
- 精致动效三件套：拇指未选中收缩/选中复原 + 平移、选中背景色过渡填满轨道（描边与底色同色过渡）、拇指内对勾描边入场
- 不要用外部 style 强行改拇指尺寸；选中态填充由背景色过渡实现，皮肤可换半透明/毛玻璃
`index.html`（直接访问 `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/switch/`）。

- 内部原生 checkbox 带 `role="switch"`，读屏器按“开关”播报
- 无障碍：默认插槽文字会成为内部控件的可访问名称（读屏器按 switch 播报），也可用宿主 `aria-label` 覆盖

## 表单

支持 `name` / `value`（默认 `"on"`）/ `required`；开启时提交 `value`，`reset` 回到初始状态。
