# st-skeleton 加载占位组件

基于 ofa.js 的纯展示骨架屏占位块：内容加载前以灰块呼吸动画占位，加载完成后用真实内容替换节点。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/skeleton/skeleton.html"></l-m>
```

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `shape` | `text` \| `circle` \| `rect` | `text` | `text` 整行文字占位 / `circle` 正圆（头像占位）/ `rect` 大块（卡片/图占位） |

宽高不设属性：**一律原生 CSS 属性覆盖**（`width` / `height` / `font-size` 等比缩放）。

```html
<!-- 文字行占位（默认整行 1em 高） -->
<st-skeleton></st-skeleton>
<!-- 头像占位 -->
<st-skeleton shape="circle"></st-skeleton>
<!-- 卡片占位 -->
<st-skeleton shape="rect" style="width: 240px;"></st-skeleton>
<!-- 组合成"联系人卡片"骨架 -->
<div style="display:flex; gap:12px; align-items:center;">
  <st-skeleton shape="circle" style="width:48px;height:48px;"></st-skeleton>
  <div style="flex:1; display:grid; gap:8px;">
    <st-skeleton style="width: 40%;"></st-skeleton>
    <st-skeleton style="width: 80%;"></st-skeleton>
  </div>
</div>
```

## 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| text | `width: 100%` / `height: 1em` / 圆角 `0.286em` |
| circle | `2.286em × 2.286em`（32px@14px）正圆，inline-block |
| rect | `width: 100%` / `height: 4.286em`（60px）/ 圆角 `0.571em` |
| 配色 | `surface-container-highest` 底，呼吸动画 opacity 1 ↔ 0.45 |
| 动画时长 | `1.6s` ease-in-out 循环 |

## 注意事项与使用技巧

- **无交互语义**：不可聚焦、无事件、无 color 属性（占位块颜色不承载语义）；对读屏完全透明，无需 aria
- 宽高都是宿主自身 CSS 属性，直接 `style="width: 60%; height: 0.857em"` 覆写；circle 的尺寸用 `width`+`height`（或 `font-size` 等比）
- `prefers-reduced-motion: reduce` 下动画自动静止（停在第一帧）；皮肤可经 `--st-skeleton-duration` 归零或 `--st-skeleton-color` 换材质
- 数据到达后直接用真实内容替换 `<st-skeleton>` 节点（ofa 页面里通常配合数据状态变量 `o-if` 切换骨架/内容）
- 动画是 opacity 呼吸而非横向扫光：无背景依赖，放在任意底色上都不会穿帮

## 验证页面

`index.html`（直接访问 `/packages/skeleton/`）。
