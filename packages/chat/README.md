# st-chat 对话组件

基于 ofa.js 的 AI 对话界面组件：`st-chat` 是对消息的包裹容器（滚动视口、头/底栏、空状态、回到底部），
`st-chat-message` 是单条消息气泡。支持三种数据流、流式输出、自动跟随滚动与新消息入场动画。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/chat/chat.html"></l-m>
```

`chat.html` 会自动加载 `chat-message.html`，不需要再单独引入。单独使用消息气泡时也可以：

```html
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/chat/chat-message.html"></l-m>
```

## 最小示例

```html
<st-chat style="height: 420px;" label="AI 对话">
  <div slot="header">Senti 助手</div>

  <st-chat-message from="assistant" name="Senti" time="14:20">
    你好，有什么可以帮你？
  </st-chat-message>
  <st-chat-message from="user" name="你" time="14:21">
    帮我写一段 ofa.js 页面。
  </st-chat-message>

  <div slot="footer">
    <st-input placeholder="输入消息…" aria-label="输入消息"></st-input>
  </div>
</st-chat>
```

## 结构：容器与消息分离

- `st-chat` 负责**包裹**：高度、滚动、自动跟随、头/底栏、空状态、回到底部按钮、可访问的 `role="log"` 滚动区
- `st-chat-message` 负责**单条消息**：左右对齐、头像、姓名/时间、气泡材质、状态、流式光标、动作区、入场动画
- 消息可以是 `st-chat` 的 light DOM 子元素，也可以由 `o-fill` 生成；容器通过 MutationObserver / ResizeObserver 跟随新增与流式变化，不要求直接子元素

`st-chat` 默认 `height: 100%`。要出现内部滚动，请由使用方给出明确高度（如 `style="height: 420px"`）；
不设高度时组件随内容自然撑开，自动滚动也不会触发。

## st-chat 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `auto-scroll` | `"auto" \| "always" \| "off"` | `"auto"` | 新内容到达时的跟随策略：`auto` 仅在用户停留在底部时跟随；`always` 总是跟随；`off` 不跟随（初始仍定位到底部） |
| `label` | string | 无 | 滚动区的可访问名称（转发为 `aria-label`） |

## st-chat 插槽

| 插槽 | 说明 |
|------|------|
| 默认 | 消息内容：`st-chat-message`、`o-fill`、`o-if` 等 |
| `header` | 吸顶头部；无内容时自动隐藏 |
| `footer` | 吸底底部（通常放输入框与发送按钮）；无内容时自动隐藏 |
| `empty` | 没有任何 `st-chat-message` 时的空状态；无内容时自动隐藏 |

## st-chat 运行时 API

| API | 说明 |
|-----|------|
| `el.messages` | 对象数组数据源（见下方「数据流 C」）。读返回当前数组，写会替换并重新渲染 |
| `el.scrollToEnd({ smooth = true })` | 滚动到底部并恢复跟随；`smooth: false` 立即到位。适用于外部按钮 / AI SDK 回调 |
| `scroll` 按钮（内部） | 用户滚上去阅读时出现，点击回到底部并把焦点交还滚动区 |

```js
const chat = document.querySelector("st-chat");
chat.messages = [
  { id: "u1", role: "user", content: "你好" },
  { id: "a1", role: "assistant", content: "你好，有什么可以帮你？" },
];
chat.scrollToEnd();
```

## st-chat-message 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `from` | `"assistant" \| "user" \| "system"` | `"assistant"` | 消息来源，决定左右对齐与气泡配色；`system` 为居中的轻量说明 |
| `name` | string | 无 | 发送者名称；与 `time` 一起为空时整个头部隐藏 |
| `time` | string | 无 | 时间文本（组件不做日期解析，直接显示） |
| `avatar` | string（URL） | 无 | 头像图片地址；也可用 `avatar` 插槽放自定义头像 |
| `status` | string | 无 | 气泡下方的状态文本（如「正在输入…」「发送失败」） |
| `streaming` | boolean | 无 | 流式输出中：显示闪烁光标；内容为空时改为三个呼吸点，并给气泡加 `aria-busy` |
| `error` | boolean | 无 | 错误态：气泡描边与状态文字使用 `--md-sys-color-error` |

## st-chat-message 插槽

| 插槽 | 说明 |
|------|------|
| 默认 | 消息正文（保留换行与长词换行） |
| `avatar` | 自定义头像；优先级高于 `avatar` 属性 |
| `actions` | 气泡下方操作区（复制、重试、重新生成等），无内容时自动隐藏；建议放 `st-button variant="text"` |

## 事件

组件不派发自定义事件。`actions` 插槽里的 `st-button` 等子元素自己的 `click` 会正常冒泡（composed）；
滚动区的 `scroll` 是原生事件；回到底部按钮由组件内部处理，不需要监听。

## 数据流（三种模式，按场景选择）

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

### B. ofa 页面状态 + `o-fill`（推荐）

消息数组放在页面 `data`，用 `o-fill` + `fill-key="id"` 渲染；流式更新时替换最后一条对象并保持 `id` 不变，
`o-fill` 会复用节点，文字更新不会重播入场动画。

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
        next.push({
          id: ++this.seq,
          from: "assistant",
          name: "Senti",
          content: delta,
          streaming: true,
        });
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

给宿主的 `messages` 属性赋值即可渲染**纯文本**消息。字段：

| 字段 | 说明 |
|------|------|
| `id` | 必填且稳定；参与 `fill-key`，变化会导致重播入场动画 |
| `from` / `role` | `user` / `assistant` / `system`，`role` 是兼容字段；缺省 `assistant` |
| `content` / `text` | 纯文本；保留换行，不解析 Markdown / HTML |
| `name` / `time` / `avatar` / `status` | 同标签属性 |
| `streaming` / `error` | 布尔值 |

```js
const chat = document.querySelector("st-chat");
chat.messages = [
  { id: "u1", role: "user", name: "你", content: "你好" },
  { id: "a1", role: "assistant", name: "Senti", content: "", streaming: true },
];
// 流式：替换数组，保持 id
chat.messages = chat.messages.map((m) =>
  m.id === "a1" ? { ...m, content: "你好，有什么", streaming: true } : m
);
```

富内容（Markdown 渲染结果、图表、按钮、图片、代码块）请用 light DOM / `o-fill` 模式，不要走 `messages` 纯文本模式。

## 自动滚动行为

- 默认 `auto`：只有用户停留在底部附近（32px 阈值）时才跟随新消息与流式文字；用户向上阅读时不会被拽回
- 用户滚上去后会出现回到底部按钮；点它恢复跟随
- `always`：无论用户在哪都跟随新内容（适合只看最新回答的场景）
- `off`：完全不自动跟随（初始仍定位到底部）；需要时调用 `el.scrollToEnd()`
- 内部用 ResizeObserver 跟随内容高度、MutationObserver 跟随消息增删与流式文字，不依赖轮询

## 动画

- **新消息入场**：`st-chat-message` 宿主使用 `st-chat-message-in`，从下方 `0.571em` 淡入并轻微放大；
  用户消息从右下方、系统消息从下方展开。时长 / 位移由皮肤 token 控制
- **流式光标**：`streaming` 时在正文尾部显示闪烁光标；正文为空时显示三个呼吸点
- **减少动态效果**：`prefers-reduced-motion: reduce` 下入场动画与光标动画压到近零；五套皮肤同时把 `--st-chat-enter-duration` 归零

## 透明容器（只保留气泡材质）

容器不强制有底色。`background` / `border` / `box-shadow` / `backdrop-filter` 都定义在 `:host` 上，直接写原生 CSS 即可覆盖；消息气泡的皮肤保持不变。容器透明**不会**自动让气泡透明——气泡仍按当前皮肤 / 默认 M3 材质渲染：

```html
<st-chat
  style="height: 420px; background: transparent; border: 0; box-shadow: none; backdrop-filter: none;"
>
  <st-chat-message from="assistant">只有这条气泡有材质。</st-chat-message>
  <st-chat-message from="user">容器完全透明。</st-chat-message>
</st-chat>
```

想让气泡本身也呈毛玻璃效果，在外层加 `data-skin="apple"`（或任何自带气泡透明度的皮肤），或者单独覆盖气泡：

```css
#my-chat st-chat-message::part(bubble) {
  background: color-mix(in srgb, var(--md-sys-color-surface-container-high) 40%, transparent);
  backdrop-filter: blur(18px) saturate(180%);
}
```

如果保留 header / footer，它们的分隔线来自 `--st-chat-divider`；需要一并隐藏时可写
`st-chat::part(header) { border-bottom-color: transparent; }` /
`st-chat::part(footer) { border-top-color: transparent; }`（light DOM 场景）；跨 `o-page` shadow 时省略 header / footer，只留消息区即可。

## 默认值（直接覆盖即可）

| 项目 | 默认值 |
|------|--------|
| 容器高度 | `100%`（内部滚动需使用方给出高度） |
| 容器圆角 / 内边距 / 消息间距 | `var(--st-radius-lg)`（约 16px）/ `1em` / `0.857em` |
| 气泡圆角 / 指向角 / 内边距 | `1.143em` / `0.286em` / `0.714em 1em` |
| 气泡最大宽度 | `85%` |
| 头像尺寸 / 间距 | `2.286em` / `0.643em` |
| 字体 | `14px`（容器）；消息为 `1em`，容器改 `font-size` 时消息整体等比缩放 |
| 配色 | 用户 `primary-container` / 助手 `surface-container-high` / 系统透明 + `on-surface-variant` |

## 皮肤 token 与 part

材质 token（无皮肤时回退到上面的默认值）：`--st-chat-bg` / `--st-chat-border` / `--st-chat-radius` /
`--st-chat-shadow` / `--st-chat-backdrop-filter` / `--st-chat-padding` / `--st-chat-gap` /
`--st-chat-header-padding` / `--st-chat-footer-padding` / `--st-chat-header-bg` / `--st-chat-divider` /
`--st-chat-empty-padding` / `--st-chat-system-radius` / `--st-chat-assistant-bg` / `--st-chat-user-bg` /
`--st-chat-bubble-radius` / `--st-chat-bubble-tail-radius` / `--st-chat-bubble-padding` /
`--st-chat-bubble-border` / `--st-chat-bubble-shadow` / `--st-chat-bubble-backdrop-filter` /
`--st-chat-bubble-max-width` / `--st-chat-avatar-size` / `--st-chat-avatar-radius` / `--st-chat-avatar-gap` /
`--st-chat-avatar-bg` / `--st-chat-jump-bg` / `--st-chat-jump-border` / `--st-chat-jump-shadow` /
`--st-chat-enter-duration` / `--st-chat-enter-distance`。

皮肤只改材质、不改颜色；消息在 `st-chat` 的 shadow 内，通过 CSS 变量继承皮肤 token，
因此 **`data-skin` 写在 `st-chat` 外层容器上也生效**。

part：

| 组件 | part |
|------|------|
| `st-chat` | `viewport` / `list` / `header` / `footer` / `empty` / `scroll-button` |
| `st-chat-message` | `avatar` / `avatar-image` / `meta` / `name` / `time` / `bubble` / `content` / `actions` / `status` |

`::part()` 只在 light DOM 可达；跨 `o-page` / `o-app` shadow 时用 token。

## 注意事项与使用技巧

- **`from` 不是 ARIA role**：组件的可访问语义由内部 `role="log"` 滚动区和消息内容承担；不要给 `st-chat-message` 再写 `role="user"` 之类的无效角色
- **正文首尾空白会被忽略**：模板缩进留下的换行/空格会在 `pre-wrap` 下变成空行、撑高气泡，组件会在消息首次渲染 / slot 重新分配时裁掉内容首尾空白；正文内部换行与流式追加的尾随空格保留
- **数据模式只渲染纯文本**：`messages` / `o-fill` 用 `{{$data.content}}` 输出文本，不解析 HTML；富内容请写在消息标签的默认插槽里
- **流式更新保持 `id`**：`o-fill` 的 `fill-key` 依赖 `id`；数组整体替换但 `id` 不变时节点复用、只更新文字，入场动画不会重播
- **滚动位置不会被抢**：默认 `auto` 在用户向上阅读时不会自动跳到底部；需要强制跟随用 `auto-scroll="always"`
- **容器必须有高度**：默认 `height: 100%`，父级无高度时组件随内容撑开，`scrollHeight` 不会溢出，回到底部按钮也不会出现
- **`messages` 是运行时属性**：与 `st-input` 的 `value` 同范式，`setAttribute("messages", ...)` 无效；用 `el.messages = [...]`
- **头像可访问名称**：`avatar` 属性渲染的图片会用 `name` 作为 `alt`；纯装饰头像建议用 `avatar` 插槽自行控制
- **消息操作区**：`actions` 用 `st-button variant="text"`，不要放会撑高气泡的块级元素；messages 数组模式不支持 actions，富操作请用 light DOM
- **性能**：流式高频更新时只替换最后一条并保持 `id`，避免整表重建；不要在每个 token 上重建整个 `messages` 数组元素（数组本身可替换，节点由 `fill-key` 复用）

## 验证页面

`index.html`（直接访问 `/packages/chat/`），覆盖属性、插槽、三种数据流、流式、自动滚动、CSS/part、动画与 apple / shadcn 皮肤。
