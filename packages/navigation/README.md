# st-nav-bar / st-nav-item / st-nav-layout 导航组件

基于 ofa.js 的导航组件族（M3）：`st-nav-bar` + `st-nav-item` 底部导航栏（可切纵向侧栏模式），`st-nav-layout` 响应式布局容器。子项写在 light DOM 的 `st-nav-item`，`active` 属性标记当前项（由外部逻辑切换）；药丸形高亮背景自动动画跟随 active 项（M3 emphasized 0.3s）。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="/packages/navigation/nav-bar.html"></l-m>
<l-m src="/packages/navigation/nav-layout.html"></l-m>
```

## 语义属性

### st-nav-bar

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `vertical` | boolean | 无 | 子项排列方向：横向一行（默认，底部导航栏）/ 纵向一列（侧栏/rail） |

只控制 bar 自身排列方向，**不会修改子项**；item 文字位置由各 item 自己的 `parallel` 属性决定，两者独立组合：默认（底部 + 文字在下）、`vertical`（侧栏 + 文字在下）、item 加 `parallel`（文字在右）、`vertical` + item `parallel`（抽屉形态）。

### st-nav-item

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `active` | boolean | 无 | 当前项：药丸背景 secondary-container 跟随，文字 on-secondary-container |
| `disabled` | boolean | 无 | 禁用：0.38 透明度、阻断点击 |
| `parallel` | boolean | 无 | 文字位置：icon 下方（默认，药丸 56×32）/ icon 右边（icon 药丸 32×32、active 背景与 state layer 覆盖整行） |

### st-nav-layout

无语义属性，断点固定（如需其他断点直接在外层用原生 CSS container query / media query 自行布局）：以**自身宽度**（container query，不是视口）切换三档：

| 容器宽度 | 布局 |
|------|------|
| `< 768px` | 导航在底部（nav-bar 默认形态）：icon 上 / 文字下，药丸 56×32 |
| `768 – 1023px` | 导航仍在底部，各 item **自动挂 `parallel`**：切横排（icon 左、文字右）、active 整行药丸背景 |
| `≥ 1024px` | 导航移到左侧窄 rail，bar **自动挂 `vertical`** 且各 item 摘 `parallel`：icon 上 / 文字下（药丸 56×32），宽度跟随内容不随屏宽加宽 |

## 插槽

### st-nav-item

- `icon`：图标
- 默认插槽：标签文字（12px）

### st-nav-layout

- `nav`：放 `st-nav-bar`（建议只放一个）
- 默认插槽：内容区（可滚动，`overflow: auto`）

## 事件（st-nav-item）

- `click`：用户点击时冒泡到宿主（`bubbles` + `composed`），active 切换由外部处理（写法同 st-tab-bar，见 tabs README）。

## 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| item padding | `0.857em 1em` |
| icon 药丸区 | `4em × 2.286em`（= 56×32px），圆角 `2em` |
| 图标字号 | `1.714em`（24px）；标签 `0.857em`（12px） |
| active 药丸 | `secondary-container` 底色，导航栏内绝对定位动画跟随 |
| 未选中色 | `on-surface-variant` |
| hover/active | state layer（currentColor 8%/12%，药丸范围内） |
| `font-size` | `14px` |
| bar 底色 | `surface-container`（直接覆盖 `background` 即可换色） |
| vertical 模式 | item 形态与横向一致（icon 上 / 文字下，药丸 56×32）；bar 纵向 gap `0.143em`、内边距 `0.286em` |
| parallel 模式 | item padding `0.5em 1em`、icon 药丸 `2.286em × 2.286em`（32×32）、标签 `1em` 左距 `0.857em`；active 药丸与 state layer / 波纹覆盖整行 |

## 示例

```html
<!-- 底部导航 -->
<st-nav-bar>
  <st-nav-item active><span slot="icon">🏠</span>首页</st-nav-item>
  <st-nav-item><span slot="icon">🔍</span>发现</st-nav-item>
  <st-nav-item><span slot="icon">👤</span>我的</st-nav-item>
</st-nav-bar>

<!-- 纵向侧栏（手动，常配合固定定位使用） -->
<st-nav-bar vertical style="position: fixed; left: 0; top: 0; bottom: 0;">
  <st-nav-item active><span slot="icon">📥</span>收件箱</st-nav-item>
  <st-nav-item><span slot="icon">📤</span>已发送</st-nav-item>
</st-nav-bar>

<!-- 响应式布局：按容器宽度自动切换底部导航 / 左侧窄 rail -->
<st-nav-layout style="height: 100vh;">
  <st-nav-bar slot="nav">
    <st-nav-item active><span slot="icon">🏠</span>首页</st-nav-item>
    <st-nav-item><span slot="icon">🔍</span>发现</st-nav-item>
    <st-nav-item><span slot="icon">👤</span>我的</st-nav-item>
  </st-nav-bar>
  <main>内容区</main>
</st-nav-layout>
```

## 注意事项与使用技巧

- `active` 由**外部逻辑**切换（同 st-tab-bar）：`attr:active="current === i"` + `on:click` 改数据
- 药丸高亮自动动画跟随 active 项（对齐子项内部 icon 区域）；无 active 项时药丸隐藏；**vertical 切换时药丸也会自动重定位**（ResizeObserver 监听 bar 尺寸）
- 底部导航场景给宿主加 `position: fixed; bottom: 0; left: 0; right: 0`
- disabled 项原生阻断点击；icon 用 `slot="icon"`（24px 建议尺寸）
- `vertical` 写在 `st-nav-bar`（排列方向），`parallel` 写在各 `st-nav-item` 上（文字位置），分属两层不要写错
- `st-nav-layout` 会按断点自动修正两者（bar 的 `vertical` + 各 item 的 `parallel`）；手动使用时无需 layout
- `st-nav-layout` 的高度依赖外部给定（`height: 100vh` / flex 子项等），`height: 100%` 不生效时空高
- `st-nav-layout` 断点看的是**布局容器自身宽度**（container query），不是视口宽度——放在窄面板里即使窗口很宽也走底部形态
## 验证页面

`index.html`（直接访问 `/packages/navigation/`）。
