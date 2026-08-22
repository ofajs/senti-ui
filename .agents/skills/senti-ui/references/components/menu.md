# st-menu / st-menu-item 下拉菜单组件

基于 ofa.js 的下拉菜单。`trigger` 插槽为触发器；菜单项写在 light DOM 的 `st-menu-item`；面板 fixed 定位自动翻转避让视口，弹层不随祖先 overflow 裁剪。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/menu/menu.html"></l-m>
```

## 语义属性（st-menu）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `align` | `"left" \| "right"` | `"right"` | 面板与触发器的水平对齐 |

## 运行时状态（st-menu）

- `open`：**ofa data，非标签属性**。JS 控制用 `el.open`（ofa 实例）或真实点击 trigger 切换；面板打开时点击菜单项/外部/Escape 自动关闭。

## 事件（st-menu）

- `open` / `close`：面板打开/关闭时派发（`bubbles` + `composed`）
- 菜单项点击：`st-menu-item` 的 `click` 正常冒泡，面板监听后自动关闭

## 语义属性（st-menu-item）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `disabled` | boolean | 无 | 禁用：0.38 透明度、阻断点击 |

## 插槽（st-menu-item）

- `prefix` / 默认（文字）/ `suffix`（快捷键提示等）

分隔线：菜单项之间放原生 `<hr>`。

## 默认值（st-menu 面板，直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| min-width | `8em`（= 112px，且不小于触发器宽度） |
| padding / 圆角 | `0.286em` / `0.857em`（= 12px） |
| 底色 | `surface-container` |
| max-height | `80vh`（内部滚动） |
| 打开/关闭动画 | 缩放淡入 0.2s / 淡出 0.15s（M3 emphasized） |
| menu-item padding / 圆角 | `0.714em 0.857em` / `0.571em` |
| `font-size` | `14px` |

## 示例

```html
<st-menu>
  <st-button slot="trigger" variant="outlined">操作 ▾</st-button>
  <st-menu-item><span slot="prefix">✏️</span>编辑<span slot="suffix">⌘E</span></st-menu-item>
  <st-menu-item disabled><span slot="prefix">🗑</span>删除</st-menu-item>
  <hr>
  <st-menu-item>关于</st-menu-item>
</st-menu>
```

## 注意事项与使用技巧

- `open` 是运行时状态（ofa data，非标签属性）：ofa 页面用 `sync:open="menuOpen"` 双向绑定（选中后自动关闭会回写）；JS 触发用真实点击 trigger
- trigger 必须放 `slot="trigger"`；菜单项点击后面板自动关闭，item 的 click 正常冒泡供业务监听
- 面板 fixed 定位自动翻转避让视口、min-width 不小于触发器宽度，不受祖先 overflow 裁剪
- 点击外部关闭用 composedPath 判断（坑 #21），滚动/resize 时自动重定位
- `align="left"` 面板左对齐触发器，默认右对齐
`index.html`（直接访问 `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/menu/`）。
