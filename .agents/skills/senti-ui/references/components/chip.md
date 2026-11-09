# st-chip 筹选小片组件

基于 ofa.js 的 chip（M3 assist / filter / input 三形态）：紧凑的入口小片，用于筛选、标签选择与可移除项。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/chip/chip.html"></l-m>
```

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `assist` \| `filter` \| `input` | `assist` | M3 三形态：assist（可点击入口）/ filter（可选中，点击切换）/ input（不可点击，仅清除） |
| `selected` | 运行时状态（data） | `false` | 仅 filter 态有意义。**内部点击会修改，用 `sync:selected` 双向绑定或 `el.selected` 读写**；外部 `setAttribute("selected", "")` 兼容（反向同步进 data） |
| `removable` | boolean | 无 | 显示尾部 ✕ 清除按钮，点击派发 `remove` 事件（`variant` 不限，通常配 `input`） |
| `disabled` | boolean | 无 | 整体降透明、阻断交互与聚焦 |
| `color` | M3 角色名 / 自定义变量名 | 无 | 选中态配色（默认 `secondary-container` 配对；设了 `color` 则用该角色的容器配对） |

## 事件

| 事件 | 说明 |
|------|------|
| `click` | assist / filter 点击（原生冒泡） |
| `change` | filter 选中切换后派发（`bubbles` + `composed`），`el.selected` 读当前态 |
| `remove` | 点击 ✕ 后派发（`bubbles` + `composed`）；**组件不自动移除自己**，由使用方删除节点 |

```html
<!-- assist：入口小片 -->
<st-chip>帮助</st-chip>
<!-- filter：可选中 -->
<st-chip variant="filter">音乐</st-chip>
<st-chip variant="filter" selected>初始选中</st-chip>
<!-- input：可移除标签 -->
<st-chip variant="input" removable on:remove="removeTag">标签 A</st-chip>
<!-- 语义色选中态 -->
<st-chip variant="filter" color="success" selected>通过</st-chip>
<!-- 前置图标 + 尾部插槽 -->
<st-chip><iconify-icon icon="mdi:magnify"></iconify-icon>搜索</st-chip>
<st-chip variant="input" removable>消息 <span slot="suffix">12</span></st-chip>
```

## 插槽

| 插槽 | 说明 |
|------|------|
| 默认 | 前置内容（文字 / 图标；svg / img / iconify-icon 自动 1.286em） |
| `suffix` | 尾部内容（如计数徽标，显示在 ✕ 之前） |

## part

| part | 说明 |
|------|------|
| `remove` | 尾部 ✕ 清除按钮 |

## 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| 高度 | `2em`（28px），padding `0 0.786em`，圆角 pill |
| 字号 | `14px`（宿主 font-size 等比缩放） |
| 配色 | assist/filter 未选中：`surface-container-low` 底（filter 为透明底）+ `on-surface-variant` 字 + outline-variant 描边；选中：`secondary-container` 底 / `on-secondary-container` 字 |
| 勾选位 | filter 选中时前置 1.143em 对勾，弹性入场动画 |
| 清除按钮 | 尾部 1.286em 圆形 ghost button，hover 有 state layer |

## 注意事项与使用技巧

- **`selected` 是运行时状态（data，非 attrs）**：内部点击会改它，外部 JS 用 `el.selected = true` 或 `setAttribute("selected", "")`（兼容路径）读写；ofa 页面用 `sync:selected="xxx"` 双向绑定
- **点击 ✕ 不会触发 chip 自身的 click / 选中切换**，只派发 `remove`；组件不自动移除节点，收到 `remove` 事件后由使用方删除（ofa 页面 `on:remove="removeTag"` 里操作数据）
- 可点击形态（assist / filter）由宿主自身承载交互语义（role=button / tabindex=0 / Enter·Space 激活 / focus ring，同 st-card interactive 范式）；`variant="input"` 不可点击、不参与 Tab
- filter 选中态消费 `--st-accent` / `--st-on-accent`（color 属性写入），皮肤可经 `--st-chip-selected-bg/color` 改材质呈现
- 内嵌波纹（assist / filter 点击有波纹），与 st-button / st-card 一致
- 弹层无、无表单代理：chip 不参与 `<form>` 提交；需要"选中的标签组提交"场景自行维护选中集合

## 验证页面

`index.html`（直接访问 `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/chip/`）。
