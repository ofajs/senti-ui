/**
 * site/app-config.js — 官网首页的 o-app 配置（SCSR 模式）
 *
 * 不声明 home：SCSR 约定首页就是当前 URL 的页面，由 scsr 收编为 o-page。
 * 这里只保留页面切换的淡入淡出；单页站点实际不会触发路由切换，
 * 后续新增 site/*.html 真实页面时会直接生效。
 */
export const pageAnime = {
  current: { opacity: "1", transition: "opacity 0.18s ease" },
  next: { opacity: "0", transition: "opacity 0.18s ease" },
  previous: { opacity: "0", transition: "opacity 0.18s ease" },
};
