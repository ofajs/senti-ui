# st-card 卡片容器组件

基于 ofa.js 的卡片容器。M3 三种 variant，插槽内容自由组合；`interactive` 提供可点击形态。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/card/card.html"></l-m>
```

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `"elevated" \| "filled" \| "outlined"` | `"elevated"` | M3 三类型（阴影 / 容器底色 / 描边） |
| `interactive` | boolean | 无 | 可点击：hover 抬升 + 波纹 + click 冒泡（内部原生 button 承载键盘/焦点） |

## 插槽

- 默认插槽：任意内容（标题/正文/图片/按钮自由组合）

```html
<st-card>
  <h4>标题</h4>
  <p>正文……</p>
</st-card>
```

## 事件

- `click`：`interactive` 卡片被点击时自然冒泡到宿主（composed），`on:click` 监听即可

## 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| padding / 圆角 | `1em` / `0.857em`（12px） |
| 底色 | elevated: `surface-container-low` / filled: `surface-container-highest` / outlined: 透明 |
| 阴影 | elevated: M3 level 1；interactive hover 抬升 level 2 + 上移 1px |
| 描边 | outlined: `1px solid outline-variant` |
| `font-size` | `14px`（改之等比缩放；宽高用原生 width/height） |

## 注意事项与使用技巧

- `interactive` 时整卡可点、Tab 聚焦有焦圈、Enter/Space 激活；非 interactive 是纯容器
- 卡内放按钮等交互元素时避免包 interactive（点击内部按钮会同时冒泡出卡片 click）
- 媒体区直接 `<img>` + `style="margin: -1em -1em 1em; width: calc(100% + 2em); display:block;"` 铺满

## 验证页面

`index.html`（直接访问 `/packages/card/`）。
