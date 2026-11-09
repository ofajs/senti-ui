# st-avatar 头像组件

基于 ofa.js 的纯展示头像：文字缩写 / 图片 / 图标三种内容来源，圆形，M3 配色。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui/packages/avatar/avatar.html"></l-m>
```

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `src` | url | 无 | 图片地址（优先级最高；设置了则覆盖插槽内容） |
| `alt` | string | 无 | 图片替代文本；同时作为宿主 `aria-label` |
| `color` | M3 角色名 / 自定义变量名 | 无 | 配色（默认 `secondary-container` 底 / `on-secondary-container` 字） |

内容来源优先级：`src` 图片 > `image` 插槽（img / svg / iconify-icon）> 默认插槽文字缩写。

```html
<!-- 文字缩写 -->
<st-avatar>Y</st-avatar>
<st-avatar>Yao</st-avatar>
<!-- 图片 -->
<st-avatar src="https://example.com/a.png" alt="用户头像"></st-avatar>
<!-- 图标（image 插槽） -->
<st-avatar><iconify-icon slot="image" icon="mdi:account"></iconify-icon></st-avatar>
<!-- 语义色 -->
<st-avatar color="primary">AI</st-avatar>
```

## 插槽

| 插槽 | 说明 |
|------|------|
| 默认 | 文字缩写（纯文本，自动居中） |
| `image` | 自由内容（img / svg / iconify-icon，自动 0.857em） |

## part

| part | 说明 |
|------|------|
| `image` | 内部 `<img class="img">`（src 属性渲染的图片） |

## 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| 尺寸 | `2.286em × 2.286em`（32px@14px），正圆 `border-radius: 50%` |
| 文字字号 | `0.5em`（随宿主 font-size 等比） |
| 配色 | `secondary-container` 底 / `on-secondary-container` 字，500 字重 |
| 图片 | `object-fit: cover` 铺满圆内 |

## 注意事项与使用技巧

- **无 size 属性**：改宿主 `font-size` 整体等比缩放，或直接 `style="width:48px;height:48px"` 覆写
- 纯装饰头像请在使用处加 `aria-hidden="true"`；有含义的头像写 `alt`（自动转发为宿主 `aria-label`）或宿主 `aria-label`
- `color` 是语义引用不是预设：写角色名（primary/error…）或 color 模块自定义变量名，与换色工具联动
- 与 `st-list-item` 配合：放 `prefix` 插槽里做联系人列表；与 `st-badges` 配合可钉在线状态点
- 图片加载失败无兜底占位，重要场景自行在 `image` 插槽放带 `onerror` 的元素

## 验证页面

`index.html`（直接访问 `/packages/avatar/`）。
