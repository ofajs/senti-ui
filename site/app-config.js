/**
 * 页面切换动画的唯一配置点（两级 layout 不写切页动画 CSS）。
 * 前进：新页从下方 16px 上移淡入，旧页上移 16px 淡出；后退方向相反。
 *
 * 改这里的注意事项：
 * - 三态只写 opacity / transform，别写 transition：ofa 先写 next、rAF+5ms 后再写
 *   current，起点态一旦带 transition，入场过渡会被反向合并成 0 时长（直接跳到位）。
 *   过渡时长由 ofa 自动注入 `all .3s`。
 * - current.transform 必须是 "none"（不是 translateY(0)）：identity transform 也会
 *   让 o-page 成为页内 position: fixed 后代的包含块，弹层会相对页面错位。
 * - previous 的位移会让离场页先被 absolute 定位再平移，slot 外层仍需 position: relative。
 * - 这里没有 prefers-reduced-motion 降级；需要时改成 getter 返回另一组态。
 */
export const pageAnime = {
  current: { opacity: "1", transform: "none" },
  next: { opacity: "0", transform: "translateY(16px)" },
  previous: { opacity: "0", transform: "translateY(-16px)" },
};
