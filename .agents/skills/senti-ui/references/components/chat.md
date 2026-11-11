# st-chat 对话组件

基于 ofa.js 的 AI 对话界面：`st-chat` 包裹消息（滚动、自动跟随、头/底栏、空状态、回到底部），
`st-chat-message` 是单条消息气泡。支持三种数据流、流式输出与新消息入场动画。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/chat/chat.html"></l-m>
```

`chat.html` 会自动加载 `chat-message.html`。只单独使用消息气泡时：

```html
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/chat/chat-message.html"></l-m>
```

## 结构

- `st-chat`：消息包裹容器。滚动视口、`header` / `footer` / `empty` 插槽、回到底部按钮、`role="log"` 可访问滚动区
- `st-chat-message`：单条消息。左右对齐、头像、姓名/时间、气泡材质、状态、流式光标、动作区、入场动画
- 消息可写在 `st-chat` 的 light DOM，也可以由 `o-fill` 生成；容器不要求消息是直接子元素
- **必须给容器高度**（如 `style="height: 420px"`）才会出现内部滚动；默认 `height: 100%`

## st-chat 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `auto-scroll` | `"auto" \| "always" \| "off"` | `"auto"` | `auto` 仅用户贴底时跟随；`always` 总是跟随；`off` 不跟随（初始仍定位底部） |
| `label` | string | 无 | 滚动区可访问名称（`aria-label`） |

## st-chat 插槽

| 插槽 | 说明 |
|------|------|
| 默认 | 消息内容（`st-chat-message` / `o-fill` / `o-if`） |
| `header` | 吸顶头部；空时自动隐藏 |
| `footer` | 吸底底部（输入框 + 发送按钮等）；空时自动隐藏 |
| `empty` | 没有任何消息时的空状态；空时自动隐藏 |

## st-chat 运行时 API

| API | 说明 |
|-----|------|
| `el.messages` | 对象数组数据源（规则见「数据流 C」）；读当前数组、写替换渲染 |
| `el.scrollToEnd({ smooth = true })` | 滚到底部并恢复跟随；`smooth: false` 立即到位 |
| 内部 `scroll-button` | 用户上滚阅读时出现，点击回到底部并把焦点交还滚动区 |

```js
const chat = $("st-chat").ele; // 运行时属性/方法在原生元素上
chat.messages = [
  { id: "u1", role: "user", content: "你好" },
  { id: "a1", role: "assistant", content: "你好，有什么可以帮你？" },
];
chat.scrollToEnd();
```

## st-chat-message 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `from` | `"assistant" \| "user" \| "system"` | `"assistant"` | 来源：左右对齐与气泡配色；`system` 为居中轻量说明 |
| `name` | string | 无 | 发送者名称；与 `time` 都为空时头部隐藏 |
| `time` | string | 无 | 时间文本，组件不解析日期 |
| `avatar` | string（URL） | 无 | 头像图片；也可用 `avatar` 插槽 |
| `status` | string | 无 | 气泡下方状态文本（「正在输入…」「发送失败」） |
| `streaming` | boolean | 无 | 流式输出：正文尾部闪烁光标；内容为空时显示三个呼吸点，气泡带 `aria-busy` |
| `error` | boolean | 无 | 气泡描边与状态文字使用 `error` 角色色 |

## st-chat-message 插槽

| 插槽 | 说明 |
|------|------|
| 默认 | 消息正文（保留换行与长词换行） |
| `avatar` | 自定义头像；优先于 `avatar` 属性 |
| `actions` | 气泡下方操作区（复制 / 重试等），空时隐藏；建议用 `st-button variant="text"` |

## 数据流（三种，按场景选择）

### A. 静态 / light DOM 组合

```html
<st-chat style="height: 360px;">
  <st-chat-message from="system">今天 14:20</st-chat-message>
  <st-chat-message from="assistant" name="Senti" time="14:20">
    <st-avatar slot="avatar">S</st-avatar>
    你好，我是 Senti。
    <div slot="actions"><st-button variant="text">复制</st-button></div>
  </st-chat-message>
  <st-chat-message from="user" name="你" time="14:21">帮我写一段代码。</st-chat-message>
</st-chat>
```

### B. ofa 页面状态 + o-fill（推荐）

```html
<st-chat style="height: 440px;">
  <o-fill :value="messages" fill-key="id">
    <st-chat-message
      attr:from="$data.from"
      attr:name="$data.name"
      attr:time="$data.time"
      attr:streaming="$data.streaming ? '' : null"
      attr:error="$data.error ? '' : null"
      >{{$data.content}}</st-chat-message
    >
  </o-fill>
</st-chat>
```

流式更新时替换最后一条对象并**保持 `id`**（`fill-key` 复用节点，不重播入场动画）：

```js
export default async () => ({
  data: { messages: [], seq: 0 },
  proto: {
    append(delta) {
      const next = this.messages.slice();
      const last = next[next.length - 1];
      if (last && last.streaming) {
        next[next.length - 1] = { ...last, content: last.content + delta };
      } else {
        next.push({ id: ++this.seq, from: "assistant", name: "Senti", content: delta, streaming: true });
      }
      this.messages = next;
    },
    finish() {
      const next = this.messages.slice();
      next[next.length - 1] = { ...next[next.length - 1], streaming: false };
      this.messages = next;
    },
  },
});
```

### C. `st-chat.messages` 对象数组 API（非 ofa 环境 / AI SDK 接入）

给宿主 `messages` 属性赋值即可渲染**纯文本**消息；富内容仍用 light DOM。

| 字段 | 说明 |
|------|------|
| `id` | 必填且稳定；参与 `fill-key`，变化会重播入场动画 |
| `from` / `role` | `user` / `assistant` / `system`；`role` 为兼容字段，缺省 `assistant` |
| `content` / `text` | 纯文本，保留换行，不解析 Markdown / HTML |
| `name` / `time` / `avatar` / `status` | 同标签属性 |
| `streaming` / `error` | 布尔值 |

```js
const chat = $("st-chat").ele;
chat.messages = [
  { id: "u1", role: "user", name: "你", content: "你好" },
  { id: "a1", role: "assistant", name: "Senti", content: "", streaming: true },
];
// 流式：替换数组，保持 id
chat.messages = chat.messages.map((m) =>
  m.id === "a1" ? { ...m, content: "你好，有什么", streaming: true } : m
);
```

## 自动滚动

- `auto`（默认）：用户距底部 32px 内才跟随新消息与流式文字；上滚阅读时不会被拽回
- 用户上滚后出现回到底部按钮；点击恢复跟随
- `always`：总是跟随；`off`：不自动跟随（初始仍到底部）
- 用 ResizeObserver + MutationObserver 跟随内容高度、消息增删与流式文字；不轮询
- 外部需要强制定位时调用 `scrollToEnd()`

## 动画与流式状态

- 新消息入场：从下方 `0.571em` 淡入并轻微放大；用户/助手/系统使用不同 transform-origin
- `streaming`：正文尾部闪烁光标；正文为空时改为三个呼吸点
- `prefers-reduced-motion: reduce` 下入场与光标动画压到近零；五套皮肤同时把 `--st-chat-enter-duration` 归零
- 流式更新只改最后一条并保持 `id`，不要重建整表元素

## 默认值（直接覆盖）

| 项目 | 默认值 |
|------|--------|
| 容器高度 | `100%`（要内部滚动需使用方给高度） |
| 容器圆角 / 内边距 / 消息间距 | `var(--st-radius-lg)`（约 16px）/ `1em` / `0.857em` |
| 气泡圆角 / 指向角 / 内边距 / 最大宽度 | `1.143em` / `0.286em` / `0.714em 1em` / `85%` |
| 头像尺寸 / 间距 | `2.286em` / `0.643em` |
| 字体 | 容器 `14px`；消息 `1em`（容器改 `font-size` 整体等比缩放） |
| 配色 | 用户 `primary-container` / 助手 `surface-container-high` / 系统透明 + `on-surface-variant` |

## 皮肤 token 与 part

材质 token：`--st-chat-bg` / `--st-chat-border` / `--st-chat-radius` / `--st-chat-shadow` /
`--st-chat-backdrop-filter` / `--st-chat-padding` / `--st-chat-gap` / `--st-chat-header-padding` /
`--st-chat-footer-padding` / `--st-chat-header-bg` / `--st-chat-divider` / `--st-chat-empty-padding` / `--st-chat-assistant-bg` /
`--st-chat-user-bg` / `--st-chat-bubble-radius` / `--st-chat-bubble-tail-radius` / `--st-chat-bubble-padding` /
`--st-chat-bubble-border` / `--st-chat-bubble-shadow` / `--st-chat-bubble-backdrop-filter` /
`--st-chat-bubble-max-width` / `--st-chat-avatar-size` / `--st-chat-avatar-radius` / `--st-chat-avatar-gap` /
`--st-chat-avatar-bg` / `--st-chat-system-radius` / `--st-chat-jump-bg` / `--st-chat-jump-border` /
`--st-chat-jump-shadow` / `--st-chat-enter-duration` / `--st-chat-enter-distance`。

皮肤只改材质不改颜色；消息在 `st-chat` 的 shadow 内，通过 CSS 变量继承，
**`data-skin` 写在 `st-chat` 外层容器上也生效**。

part：

| 组件 | part |
|------|------|
| `st-chat` | `viewport` / `list` / `header` / `footer` / `empty` / `scroll-button` |
| `st-chat-message` | `avatar` / `avatar-image` / `meta` / `name` / `time` / `bubble` / `content` / `actions` / `status` |

`::part()` 只在 light DOM 可达；跨 `o-page` / `o-app` shadow 时用 token。

## 注意事项与使用技巧

- **`from` 不是 ARIA role**：不要给消息写 `role="user"` 之类的无效角色；可访问语义由 `role="log"` 滚动区与消息内容承担
- **正文首尾空白会被忽略**：模板缩进留下的换行/空格会在 `pre-wrap` 下变成空行、撑高气泡，组件在消息首次渲染 / slot 重新分配时裁掉首尾空白；正文内部换行与流式追加的尾随空格保留
- **数据模式只渲染纯文本**：`messages` / `o-fill` 用文本插值，不解析 HTML；Markdown 渲染结果、图表、按钮等富内容写在默认插槽
- **流式保持 `id`**：`o-fill` 的 `fill-key` 依赖 `id`；数组替换但 `id` 不变时复用节点、不重播入场动画
- **滚动位置不会被抢**：默认 `auto` 在用户上滚阅读时不会跳到底部；需要强制跟随用 `auto-scroll="always"`
- **容器必须有高度**：默认 `height: 100%`；父级无高度时组件随内容撑开，内部滚动与回到底部按钮都不会出现
- **`messages` 是运行时属性**：`setAttribute("messages", ...)` 无效，用 `el.messages = [...]`
- **头像可访问名称**：`avatar` 属性渲染的图片用 `name` 作 `alt`；纯装饰头像用 `avatar` 插槽自行控制
- **操作区**：`actions` 里用 `st-button variant="text"`，不要放块级元素撑高气泡；数据数组模式不支持 actions，富操作走 light DOM
- **性能**：流式高频更新只替换最后一条并保持 `id`；不要每条 token 都重建所有消息节点

## 验证页面

直接访问 `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/chat/`，覆盖属性、插槽、三种数据流、流式、自动滚动、CSS/part、动画与 apple / shadcn 皮肤。
