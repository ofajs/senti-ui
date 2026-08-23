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

- `prefix` / 默认（文字）/ `suffix`（快捷键提示等）/ `sub-menu`（放 `st-menu` 子菜单，见下文）

分隔线：菜单项之间放原生 `<hr>`。

## 多级子菜单

子菜单写在某个 `st-menu-item` 的 **`sub-menu` 插槽**内：该 item 仍是列表中的普通一项（宽度铺满面板），自动显示 `▸` 箭头、hover 展开子菜单。可以任意深度嵌套。

```html
<st-menu>
  <st-button slot="trigger" variant="outlined">操作 ▾</st-button>
  <st-menu-item>新建</st-menu-item>
  <st-menu-item>
    导出为
    <st-menu slot="sub-menu">
      <st-menu-item>PDF</st-menu-item>
      <st-menu-item>
        图片
        <st-menu slot="sub-menu">
          <st-menu-item>PNG</st-menu-item>
          <st-menu-item>SVG</st-menu-item>
        </st-menu>
      </st-menu-item>
    </st-menu>
  </st-menu-item>
</st-menu>
```

行为：

- 带 sub-menu 的 item **hover 展开**（120ms 延时）/**移出 300ms 后收起**，面板定位在该 item **右侧**（右侧空间不足自动翻转到左侧），点击该 item 也可开合；`▸` 箭头自动显示（无需手写 suffix）
- 鼠标移到同级其他菜单项时，未选中的兄弟子菜单自动收起
- **选中任意层级的菜单项 → 整条链全部关闭**（click 冒泡到各级面板）
- Escape 只关闭最内层，逐次向外
- 父菜单关闭时级联关闭所有子孙菜单

## 命令式右键菜单（context-menu.js）

传定位信息 + items 数组，直接生成挂 body 的定位菜单（用完即毁），`await` 得到点击的 item id；点空白 / Escape 取消返回 `null`。

```js
import contextMenu from "https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/menu/context-menu.js";

// 第一个参数：带定位信息的事件（自动 preventDefault + 取 clientX/Y），或 { x, y } 坐标
const id = await contextMenu(e, [
  { id: "cut", label: "剪切", prefix: "✂️" },
  { id: "copy", label: "复制", suffix: "⌘C" },
  { separator: true },
  {
    id: "sort", label: "排序", children: [   // children 为子菜单（可嵌套），父项点击只开合不选中
      { id: "sort-name", label: "按名称" },
      { id: "sort-size", label: "按大小" },
    ],
  },
  { id: "del", label: "删除", disabled: true },
]);
// id → "cut" / "sort-size" 等；取消 → null
```

items 结构：`{ id, label, prefix?, suffix?, disabled?, children? }`（叶子项的 id 即返回值）与 `{ separator: true }` 分隔线。定位自动翻转避让视口；组件按需注入 `<l-m>`，无需预引入。

### 移动端

- 触屏子菜单**点击开合**（无 hover；滑动不会误触展开）
- 长按呼出：`contextMenu.longPress(el, items, onSelect?)` —— 在 `el` 上按住约 500ms 打开菜单（触屏指针专用，桌面仍用右键）；滑动超 10px / 提前抬起 / 取消则中止；会吞掉长按触发的系统 contextmenu 与抬起 click。返回取消函数（调用即解绑）。

```js
const off = contextMenu.longPress(el, [
  { id: "copy", label: "复制" },
  { id: "del", label: "删除" },
], (id) => { /* id 或 null */ });
```

## 右键菜单（openAt）

不需要 trigger，JS 在 `contextmenu` 事件里调 `openAt(x, y)` 在光标处打开，面板自动翻转避让视口（右侧/下方空间不足翻到光标左/上方）。与多级子菜单可组合使用。

```html
<div on:contextmenu="onCtx">右键区域</div>
<st-menu id="ctxMenu">
  <st-menu-item>剪切</st-menu-item>
  <st-menu-item>复制</st-menu-item>
</st-menu>
```

```js
// ofa 页面模块
onCtx(e) {
  e.preventDefault(); // 阻止浏览器默认右键菜单
  this.shadow.$("#ctxMenu").openAt(e.clientX, e.clientY);
}
```

行为：已在别处打开时再次右键会重新定位；关闭（选中/外部点击/Escape）后 `_anchorPoint` 自动清除，不影响后续 trigger 定位。

## 默认值（st-menu 面板，直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| min-width | `6em`（= 84px，宽度由内容决定，不跟随触发器宽度） |
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
- 面板 fixed 定位自动翻转避让视口、宽度由内容决定（min-width 6em 兜底），不受祖先 overflow 裁剪
- 点击外部关闭用 composedPath 判断（坑 #21），滚动/resize 时自动重定位
- `align="left"` 面板左对齐触发器，默认右对齐
- 多级子菜单：`st-menu` 放在 item 的 `sub-menu` 插槽内（见上文），箭头自动显示
- 右键菜单：不放 trigger，`on:contextmenu` 里 `e.preventDefault()` 后调 `openAt(e.clientX, e.clientY)`（见上文）

## 验证页面

`index.html`（直接访问 `/packages/menu/`）。
