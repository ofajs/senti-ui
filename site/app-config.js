/**
 * site/app-config.js — 官网的 o-app / SCSR 配置
 *
 * 不声明 home：SCSR 约定首页就是当前 URL 的页面。
 * pageAnime：真实路径切换时做交叉淡出（0.24s），布局 header / footer 常驻；
 * 入场由 layout 的 ::slotted(o-page) 动画负责。这里刻意不用 transform：
 * 避免给 fixed 弹层/回到顶部创建 containing block，也避免两页内容错位。
 */
export const pageAnime = {
  current: { opacity: "1", transition: "opacity 0.24s ease" },
  next: { opacity: "0", transition: "opacity 0.24s ease" },
  previous: { opacity: "0", transition: "opacity 0.24s ease" },
};
