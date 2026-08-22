# st-slider 滑块组件

基于 ofa.js 的滑块。语义由属性表达，交互由内部透明原生 `input[type=range]` 承载（拖拽、键盘 ←→/Home/End、焦点），视觉默认值全用 em。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/slider/slider.html"></l-m>
```

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `min` / `max` / `step` | number | `0` / `100` / `1` | 取值范围与步进，转发内部原生 range |
| `default-value` | string | 无 | 初始值（标签属性，attached 时读取一次） |
| `disabled` | boolean | 无 | 禁用：0.38 透明度、阻断交互 |
| `color` | M3 角色名 / 自定义变量名 | 无 | 激活轨道与拇指换角色色（默认 primary） |

## 运行时状态

- `value`：**data（非标签属性）**，`el.value` 读写；ofa 页面绑定用 `attr:value="xxx"`（注意是标签属性反射，组件内部同步）。`setAttribute("value")` 无效，初始值用 `default-value`

## 事件

- `input`：拖动过程中实时派发（`bubbles` + `composed`）
- `change`：松手 / 键盘提交时派发

## 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| 宽 / 高 | `13.571em × 2.857em`（190×40px 触控高度） |
| 轨道 | 高 `0.286em`（4px）两端半圆，**左右各内缩拇指半径**（M3：拇指中心行走在轨道端点上）；未激活 `surface-container-highest` |
| 拇指 | `1.429em`（20px）角色色圆点 |
| 数值气泡 | 拖动 / 键盘聚焦时显示在拇指上方（角色色底 + on-角色色字 + 小三角，M3 value indicator） |
| `font-size` | `14px`（改之全面板等比缩放） |

## 注意事项与使用技巧

- `value` 是运行时状态：JS 用 `el.value`，`setAttribute("value")` 无效
- 键盘：Tab 聚焦（焦圈画在拇指上）、`←/→` 步进、`Home/End` 到两端
- watch 异步生效：`setAttribute` 改 min/max 后下一帧才更新视觉

## 验证页面

`index.html`（直接访问 `/packages/slider/`）。
