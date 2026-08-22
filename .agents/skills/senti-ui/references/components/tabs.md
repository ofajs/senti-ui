# st-tab-bar / st-tab-item 标签栏组件

基于 ofa.js 的顶部标签栏。子项写在 light DOM 的 `st-tab-item`，`active` 属性标记当前项（由外部逻辑切换）；底部指示条自动动画跟随 active 项（M3 emphasized 0.3s，尺寸变化时瞬时重定位）。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/tabs/tab-bar.html"></l-m>
```

## 语义属性（st-tab-item）

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `active` | boolean | 无 | 当前项：文字 primary 色，指示条跟随 |
| `disabled` | boolean | 无 | 禁用：0.38 透明度、阻断点击 |

## 插槽（st-tab-item）

- `icon`：图标
- 默认插槽：标签文字

## 事件（st-tab-item）

- `click`：用户点击时冒泡到宿主（`bubbles` + `composed`），active 切换由外部处理：

```js
$("st-tab-bar").on("click", (e) => {
  const item = e.target.closest("st-tab-item");
  if (!item || item.hasAttribute("disabled")) return;
  $("st-tab-bar").querySelectorAll("st-tab-item").forEach((t) => t.attr("active", null));
  item.attr("active", "");
});
```

## 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| tab 高度 | `3.429em`（= 48px） |
| 文字 | `0.929em`（13px）/ 500 字重，active 为 primary 色 |
| 栏底边线 | `1px solid outline-variant` |
| 指示条 | `0.143em`（2px）primary 色 |
| hover/active | state layer（currentColor 8%/12%） |
| `font-size` | `14px` |

## 示例

```html
<st-tab-bar>
  <st-tab-item active><span slot="icon">📧</span>邮件</st-tab-item>
  <st-tab-item><span slot="icon">📞</span>通话</st-tab-item>
  <st-tab-item disabled><span slot="icon">💬</span>聊天</st-tab-item>
</st-tab-bar>
```

## 注意事项与使用技巧

- `active` 由**外部逻辑**切换（组件不自动管理）：ofa 页面用 `attr:active="current === i"` 表达式绑定 + `on:click` 改数据即可
- 指示条动画自动跟随 active 项（M3 emphasized 0.3s）；容器尺寸变化时瞬时重定位
- disabled 项原生阻断点击、无事件冒泡；icon 用 `slot="icon"`
- 计算属性（如当前标签文字）放 proto 上的 `get`，不要放模块顶层（会加载失败且报错被吞）
`index.html`（直接访问 `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/tabs/`）。
