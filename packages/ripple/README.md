# st-ripple 波纹组件

点击波纹：放在任意 `position: relative` 的父元素内，点击父元素区域会产生从点击处扩散的波纹（M3 pressed state 效果）。波纹色为 `currentColor`（28% 不透明度），自动跟随文字色，与任意配色协调。

## 依赖引入（使用前必须）

```html
<script src="https://cdn.jsdelivr.net/gh/ofajs/ofa.js/dist/ofa.min.mjs" type="module"></script>
<l-m src="/packages/ripple/ripple.html"></l-m>
```

组件内部已 `import "../color/st-init.js"`，自动注入颜色体系。

## 基本用法

```html
<div style="position: relative; width: 200px; height: 100px; background: var(--md-sys-color-primary); color: var(--md-sys-color-on-primary);">
  点我试试
  <st-ripple></st-ripple>
</div>
```

要求：父元素 `position: relative`（或 absolute）。波纹色 = 父元素的文字色（currentColor，12% 不透明度）。

## 行为说明

- **鼠标/触摸点击**：波纹从点击坐标扩散，覆盖整个父元素（直径 = 点击点到最远角的距离 × 2），约 0.35 秒扩散并淡出
- **键盘激活**（Enter/Space 触发的 click，无坐标）：波纹从中心扩散
- 组件本身 `pointer-events: none`，不影响父元素交互；嵌入其他组件 shadow DOM 时自动监听其宿主元素

## 在组件内使用（st-button 即此用法）

```html
<template component>
  <style> :host { position: relative; /* ... */ } </style>
  <st-ripple></st-ripple>
  <!-- 组件内容 -->
  <script>
    import "../ripple/ripple.html"; // 需先加载，或用 <l-m src="../ripple/ripple.html"></l-m>
  </script>
</template>
```

## 验证页面

`index.html` 为打开即看的完整示例（直接访问 `/packages/ripple/`）。
