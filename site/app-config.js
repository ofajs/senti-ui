/**
 * site/app-config.js — 官网的 o-app / SCSR 配置
 *
 * 不声明 home：SCSR 约定首页就是当前 URL 的页面。
 * pageAnime：真实路径切换时，子页做方向感淡入 + 轻微位移（布局 header / 侧栏常驻）。
 */
const ease = "cubic-bezier(0.32, 0.72, 0, 1)";
const motion = `opacity 0.3s ${ease}, transform 0.3s ${ease}`;

export const pageAnime = {
  current: {
    opacity: "1",
    transform: "translateX(0)",
    transition: motion,
  },
  next: {
    opacity: "0",
    transform: "translateX(28px)",
    transition: motion,
  },
  previous: {
    opacity: "0",
    transform: "translateX(-28px)",
    transition: motion,
  },
};
