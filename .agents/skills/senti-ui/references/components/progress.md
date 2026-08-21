# st-progress 进度指示组件

> **写法优先级**：本文档中的原生 JS 写法（`setAttribute` / `addEventListener` 等）仅适用于非 ofa 环境或自动化测试。在 ofa 页面（`<o-page>` / `<o-app>`）中必须优先用 ofa.js API：数据绑定 `{{xxx}}`、属性绑定 `attr:xxx=`（布尔属性必须 `attr:`，不能 `:prop`）、双向绑定 `sync:value` / `sync:open`、事件 `on:click` / `on:input`（根级直接写方法名）。详见 [../usage-patterns.md](../usage-patterns.md)。

基于 ofa.js 的进度指示，线形 / 环形两种形态，确定 / 不定两种模式。视觉在 `:host` 上（em 尺寸），无交互。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/progress/progress.html"></l-m>
```

## 语义属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `circular` | boolean | 无 | 环形（缺省为线形） |
| `indeterminate` | boolean | 无 | 不定进度（滑块/旋转动画）；设置了它 `value` 被忽略 |
| `value` | number（0-100） | 无 | 确定进度；**缺省 value 且无 indeterminate 时自动视为不定** |
| `color` | M3 角色名 / 自定义变量名 | 无 | 进度色换角色色（默认 primary） |

```html
<st-progress value="60"></st-progress>
<st-progress indeterminate></st-progress>
<st-progress circular value="75"></st-progress>
<st-progress circular indeterminate color="error"></st-progress>
```

## 默认值（直接覆盖即可）

| 属性 | 默认值 |
|------|--------|
| 线形轨道 | 高 `0.286em`（4px），`surface-container-highest` 底，圆角同高 |
| 线形不定 | 30% 宽滑块 1.2s 循环 |
| 环形 | `2.857em`（40px）直径，stroke `0.286em`，圆头 |
| 环形不定 | 1.4s 旋转 |
| `font-size` | `14px`（改之等比缩放；线形宽度用 width/style 控制） |

## 注意事项与使用技巧

- `value` 是普通标签属性（外部配置驱动），改 `setAttribute("value", "80")` 即时更新（确定态有线形 0.3s 平滑过渡）
- 不定模式：`indeterminate` 属性，或不写 `value`
- `prefers-reduced-motion` 下动画趋零

`index.html`（直接访问 `https://cdn.jsdelivr.net/gh/ofajs/senti-ui@main/packages/progress/`）。
