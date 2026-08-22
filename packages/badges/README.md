# st-badges 徽标组件

基于 ofa.js 的徽标。默认插槽放被标记元素（icon-button 等），徽标钉在其右上角。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/badges/badges.html"></l-m>
```

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | number \| string | 无 | 数字徽标（超过 `max` 显示 `max+`）；非数字字符串原样展示（如 `NEW`）；缺省为小圆点 |
| `max` | number | `99` | 数字封顶 |
| `color` | M3 角色名 / 自定义变量名 | 无 | 徽标配色（默认 `error` 红） |

```html
<!-- 用在普通按钮上 -->
<st-badges value="3"><st-button>收件箱</st-button></st-badges>
<!-- 用在图标按钮上 -->
<st-badges><st-icon-button title="通知">🔔</st-icon-button></st-badges>
<st-badges value="8"><st-icon-button title="消息">✉️</st-icon-button></st-badges>
<st-badges value="120"><st-icon-button title="更多">📬</st-icon-button></st-badges>  <!-- 显示 99+ -->
```

## 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| 数字徽标 | `1.429em × 1.429em`（20px）胶囊，`0.786em`（11px）600 字重 |
| 圆点 | `0.429em`（6px），无 value 时 |
| 配色 | `error` 底 / `on-error` 字（color 属性换角色） |
| 位置 | 右上角外偏 `0.214em`（圆点贴角） |

## 注意事项与使用技巧

- 徽标 `pointer-events: none`，不挡被标记元素的点击
- 数字变化直接 `setAttribute("value", ...)`；ofa 页面绑定 `attr:value="count"` 
- value 为非数字字符串时按文字徽标展示（不封顶、不换底色尺寸）

## 验证页面

`index.html`（直接访问 `/packages/badges/`）。
