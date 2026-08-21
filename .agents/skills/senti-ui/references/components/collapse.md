# st-collapse 折叠容器组件

基于 ofa.js 的高度过渡折叠容器。内容高度由 ResizeObserver 跟随，展开/收起带 M3 emphasized 高度动画（0.3s）。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/collapse/collapse.html"></l-m>
```

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `hide` | boolean | 无 | 折叠收起（高度 0 + overflow hidden）；移除即展开（带动画） |

```js
collapse.setAttribute("hide", "");   // 收起
collapse.removeAttribute("hide");    // 展开
```

## 插槽

- 默认插槽：任意内容（内容尺寸变化自动跟随调整高度）

## 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| 过渡 | 切换 `hide` 时 `height 0.3s cubic-bezier(0.2, 0, 0, 1)`（M3 emphasized）；内容尺寸变化（ResizeObserver 跟随）瞬时无过渡——否则嵌套折叠时外层会追赶内层动画产生迟缓拖尾 |

无事件；高度动画纯 CSS，内容完全透传（无样式注入）。

## 注意事项与使用技巧

- `hide` 用 `setAttribute` / `removeAttribute` 切换，展开/收起各 0.3s（M3 emphasized）
- 内容高度变化（含嵌套折叠引起的）由 ResizeObserver 瞬时跟随，无过渡——这是特性：嵌套折叠时外层逐帧同步内层，不会拖尾
- 不要给 collapse 内内容的 margin 依赖外层高度（内容用 absolute 量高，顶部留 0.1px 防 margin 折叠）
- 配合 st-list-item 的 sublist 使用时无需手动管理
`index.html`（直接访问 `https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/collapse/`）。
