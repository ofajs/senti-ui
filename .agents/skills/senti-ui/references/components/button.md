# st-button 按钮组件（含 st-button-group / st-split-button / st-icon-button）

本包包含四个相关组件：`st-button` 按钮、`st-button-group` 按钮组、`st-split-button` 分裂按钮、`st-icon-button` 图标按钮，引入语句共用一个目录。基于 ofa.js。语义由属性表达，外观直接用**原生 CSS 属性**定制（没有 size 类预设，也不需要自定义 CSS 变量；`color` 属性是 M3 角色/自定义变量名的语义引用）。

组件的视觉样式全部定义在宿主元素（`:host`）上，`st-button` 本身就是一个普通的可样式化元素——`style` 写什么就生效什么。内部有一个透明的原生 `<button>` 负责语义（点击/键盘/焦点/disabled）。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/button/button.html"></l-m>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/button/button-group.html"></l-m>   <!-- st-button-group -->
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/button/split-button.html"></l-m>   <!-- st-split-button -->
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/button/icon-button.html"></l-m>     <!-- st-icon-button -->
```

组件内部已 `import "../color/st-color-init.js"`，加载按钮时会自动注入 `--md-sys-color-*` 颜色体系（多次 import 不冲突，模块按 URL 去重）；若你的部署不含 color 包，则需自行定义这些变量。

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `"filled" \| "outlined" \| "text"` | `"filled"` | M3 规范的三种按钮类型 |
| `color` | M3 角色名 / 自定义变量名 | 无 | 语义配色，见下文 |
| `disabled` | boolean | 无 | 禁用：0.38 透明度、阻断点击、无 hover 态 |
| `loading` | boolean | 无 | 显示旋转 spinner 并自动禁用点击 |
| `type` | `"button" \| "submit" \| "reset"` | `"button"` | 转发给内部原生 button |

设置/取消布尔属性示例：`<st-button loading>...</st-button>`；JS 中请用 attribute 方式（直接改 property 不触发更新）：

```js
$("st-button").attr("loading", "");   // 设为裸属性；移除用 null
$("st-button").attr("loading", null);
```

## color 属性（与 color 模块联动）

`color` 接受 **M3 角色名**（`primary` / `secondary` / `tertiary` / `error` / `success` 等）或 **color 工具里定义的自定义变量名**，并与 `variant` 自由组合，配色按 M3 规范随 variant 生效。`success` 是 color 体系内置的扩展角色（M3 核心规范之外的补充语义色），默认绿色、不随种子色变化，可在 color 工具中覆盖：

| `color` + variant | 背景 | 文字 | 边框 |
|-------------------|------|------|------|
| `filled`（默认） | 角色色 | on-角色色 | 无 |
| `outlined` | 透明 | 角色色 | 角色色 |
| `text` | 透明 | 角色色 | 无 |

```html
<st-button color="error">Delete</st-button>
<st-button color="error" variant="outlined">Delete</st-button>
<st-button color="error" variant="text">Delete</st-button>

<!-- success 为内置扩展角色（默认绿色，token 由 st-color-init.js 自动注入，无需配置） -->
<st-button color="success">保存</st-button>

<!-- 自定义：先在 color 工具添加变量 brand（会生成 --brand / --on-brand 等配对 token 并存入 localStorage），
     所有引入 st-color-init.js 的同域页面即可使用 -->
<st-button color="brand">Brand 按钮</st-button>
```

这正是"一键换色"：在 color 工具里改种子色 / 调整 brand 颜色，所有 `color="brand"` 的按钮全站跟随变化。未定义的名称回退到 primary。需要更自由的效果仍用原生 style。

## 插槽

- 默认插槽：按钮文字内容
- `prefix` / `suffix`：前置/后置图标等内容

```html
<st-button><span slot="prefix">🔍</span>Search</st-button>
```

## 事件

点击事件直接在 `<st-button>` 上监听（内部原生 button 会转发）：

```js
$("st-button").on("click", () => {});
```

## 外观定制：直接写原生 CSS 属性

**没有预设，也不需要变量**。尺寸、圆角、字体、配色全部用标准 CSS 属性表达：

尺寸类默认值全部用 em——**改 `font-size` 即可整体等比缩放**（高度/圆角/内边距随之联动）：

```html
<st-button style="font-size: 12px;">Scale 12px</st-button>
<st-button style="font-size: 16px;">Scale 16px</st-button>
<st-button style="font-size: 20px;">Scale 20px</st-button>

<!-- 也可单独覆写任一属性 -->
<st-button style="font-size: 12px; border-radius: 8px; height: 32px;">Compact 覆写</st-button>

<!-- 换配色：直接用 M3 角色 -->
<st-button style="background: var(--md-sys-color-error); color: var(--md-sys-color-on-error);">Delete</st-button>

<!-- 浮起效果（M3 elevated）：box-shadow 也是原生的 -->
<st-button style="border: none; box-shadow: 0 1px 3px rgba(0,0,0,0.3); background: var(--md-sys-color-secondary-container); color: var(--md-sys-color-on-secondary-container);">Elevated</st-button>
```

### 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| `height` | `2.857em`（= 40px @ 14px 字号，M3 标准） |
| `min-width` | `3.429em`（= 48px） |
| `padding` | `0 1.429em`（= 20px = 圆角半径，文字刚好落在圆角转弯处；三种 variant 尺寸一致） |
| `border-radius` | `1.429em`（= 20px，M3 full 圆角即高度的一半） |
| `font-size` / `font-weight` | `14px` / `500` |
| `gap`（内容与图标间距） | `0.571em`（= 8px） |
| `background` | filled: primary / outlined、text: 透明 |
| `color` | filled: on-primary / outlined、text: primary |
| `border` | outlined: `1px solid outline` / 其余: 透明 |

### 内建行为（不需要写、也覆盖不掉的）

- hover / active：M3 state layer（currentColor 8% / 12% 半透明叠加，自动与文字颜色协调）
- 点击波纹：内嵌 st-ripple 组件（从点击处扩散，键盘激活时从中心扩散），波纹色 currentColor
- 键盘焦点：focus-visible 时显示 `on-surface` 色 2px 外圈（不用 currentColor——浅色页面上白字按钮的白色外圈不可见）
- loading spinner：尺寸 `1.2em` 随 font-size 缩放，颜色 currentColor

## 三种 variant 的默认配色

| variant | 背景 | 内容 | 边框 |
|---------|------|------|------|
| `filled` | primary | on-primary | 无 |
| `outlined` | 透明 | primary | outline |
| `text` | 透明 | primary | 无 |

设置 `color` 属性后，配色按上文「color 属性」一节的表分派。

## 主题

`st-color-init.js` 注入的颜色体系默认跟随系统深浅色；强制指定：`<html class="st-light">` 或 `<html class="st-dark">`。

## st-button-group 按钮组

纵向无关、横向排布子 `st-button`：自动处理分组圆角（首尾外圆角 1.429em、中间 0.5em）。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `connected` | boolean | 无 | 连体：间距归零、相邻边圆角归零 |
| `full-width` | boolean | 无 | 占满一行（`width: 100%`），子按钮等分（`flex: 1`） |

```html
<st-button-group connected>
  <st-button>新建</st-button>
  <st-button variant="outlined">编辑</st-button>
  <st-button color="error" variant="outlined">删除</st-button>
</st-button-group>
```

子按钮自身的 variant / color / disabled 各自独立设置；点击事件在各自按钮上监听。

## st-split-button 分裂按钮

主操作区（默认插槽）+ 箭头区（展开菜单）二合一。点主区触发主操作（`click` 冒泡到宿主，普通按钮用法一致）；点箭头展开 `menu` 插槽中的菜单（建议放 `st-menu-item`，分隔线 `<hr slot="menu">`）。

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `variant` | `"filled" \| "outlined" \| "text"` | `"filled"` | 同 st-button 三种类型 |
| `color` | M3 角色名 / 自定义变量名 | 无 | 同 st-button 语义配色 |
| `disabled` | boolean | 无 | 禁用整组（主区 + 箭头区原生阻断） |
| `menu-align` | `"left" \| "right"` | `"right"` | 面板与按钮的水平对齐 |

- `open` 是**运行时状态（data）**：ofa 页面用 `sync:open="xxx"` 双向绑定（选中菜单项 / 点外部 / Escape 自动关闭会回写）；兼容 `setAttribute` / `removeAttribute`
- 插槽：`prefix`（主区前置图标）/ 默认（主操作文字）/ `menu`（菜单内容）
- 事件：主区 `click`（冒泡 composed，业务监听它做主操作）、`open` / `close`（菜单开合）；菜单项自身的 `click` 正常冒泡供业务分发
- 面板 fixed 定位自动翻转避让视口，与 st-menu 行为一致；键盘：主区 Enter/Space 触发主操作、箭头区 Enter/Space 开合

```html
<st-split-button on:click="send">
  发送
  <span slot="prefix">📤</span>
  <st-menu-item slot="menu" on:click="sendTo('email')">发送到邮箱</st-menu-item>
  <st-menu-item slot="menu" on:click="sendTo('cloud')">发送到云盘</st-menu-item>
</st-split-button>
```

### st-split-button 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| 高度 / 圆角 / 字号 | `2.857em` / `1.429em` / `14px`（与 st-button 一致） |
| 主区 padding | `0 1.429em` |
| 箭头区 | 正方形（aspect-ratio 1/1），与主区分界线 currentColor 40% |
| 面板 | 与 st-menu 面板一致（min-width 8em、圆角 0.857em、surface-container 底） |

## st-icon-button 图标按钮

圆形图标按钮（默认插槽放单个图标，建议 22px 左右的 svg/emoji/图标字体）。四种 M3 类型：

| `variant` | 背景 | 图标色 | 边框 |
|-----------|------|--------|------|
| `standard`（默认） | 透明 | `on-surface-variant` | 无 |
| `filled` | `primary` | `on-primary` | 无 |
| `tonal` | `secondary-container` | `on-secondary-container` | 无 |
| `outlined` | 透明 | `on-surface-variant` | `outline` |

其他属性：`color`（M3 角色名，按上表同款语义换色——filled 用角色色/on-角色色，tonal 用 container 配对，outlined/standard 用角色色作前景与描边）、`disabled`（0.38 透明度、阻断交互）。

```html
<st-icon-button title="收藏">⭐</st-icon-button>
<st-icon-button variant="filled">✅</st-icon-button>
<st-icon-button variant="tonal" color="error">🗑</st-icon-button>
<st-icon-button variant="outlined" disabled>⚙️</st-icon-button>
```

- `click` 事件直接在宿主监听（内部原生 button 转发），`Tab` 聚焦 / `Enter`/`Space` 激活
- 记得配 `title` 或 `aria-label` 提供无障碍名称（图标按钮没有文字）
- 默认值：`2.857em × 2.857em`（40×40px @ 14px）、圆形（`border-radius: 50%`）、图标 `1.571em`（22px）——改宿主 `font-size` 整体等比缩放

## 注意事项与使用技巧

- **给 st-button 换色必须用它的 `color` 属性，不能写内联 `style="color: ..."`**——内联色会被组件自身的配色逻辑（applyColor）覆盖；放在反色/彩色容器（如 snackbar）里时用 `color="inverse-primary"` / `color="on-error"` 这类角色名
- `variant` 运行时切换用 `attr:variant="expr"` 绑定（ofa 页面内），JS 里用 `setAttribute`（直接改 property 不触发更新）
- 布尔属性（disabled/loading）在 JS 里用 `setAttribute` / `removeAttribute`，ofa 页面里绑定用 `attr:loading="busy"`（`:prop` 会把 false 序列化成属性字符串导致永远禁用）
- `setAttribute` 触发组件 watch 是异步的（下一轮微任务），设置后同步读状态会得到旧值
- loading 态自动阻断点击，不需要再叠加 disabled
- **st-button-group 的圆角在 attached 后由 JS 按位置设置**（内联在子按钮上）——不用 `::slotted(:first-child)` 位置选择器（ofa 升级/重排 light DOM 时序下不可靠）；外部不要给子按钮单独写 `border-radius`，需整体定制在 group 宿主上覆盖字号即可等比缩放；子项增删（slotchange）自动重算
- **st-split-button 点主区 = 主操作（click），点箭头 = 开菜单**，两者互不干扰；菜单项点击后面板自动关闭并截断冒泡，不会误触发主操作
- st-split-button 的菜单项来自 `st-menu-item`（split-button 内部已加载，无需额外引入）
- **st-icon-button 必须配 `title` / `aria-label`**（无文字，缺名称时屏幕阅读器读不出用途）；其 color 分派多了 tonal 分支（container 配对色）
`index.html` 为打开即看的完整示例，可作视觉验收用（直接访问 `https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/button/`）。
