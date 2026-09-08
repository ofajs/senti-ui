/**
 * st-theme-mode.js — Senti-UI 全局主题模式（auto / light / dark）
 *
 * 模式偏好持久化在 localStorage（key "st-theme-mode"，与 "st-color-config"
 * 同模式）：值为 "light" / "dark" 时在 <html> 上挂 st-light / st-dark 类
 * 强制主题；值缺失或 "auto" 时不挂类，CSS 的
 * @media (prefers-color-scheme: dark) { html:not(.st-light) } 通道
 * 让主题跟随系统。
 *
 * 首帧同步挂类由 st-boot.js 完成（本模块是 module，加载晚于首帧）；
 * 本模块负责：初始化兜底挂类、跨窗口实时同步（storage 事件——
 * 同源其他窗口写入 localStorage 时当前窗口自动跟随）、以及对外
 * 的 setThemeMode / getThemeMode API。
 *
 * 本模块由 st-color-init.js 引入；st-boot.js 一定会在首帧后加载
 * st-color-init.js，因此引入 st-boot 或任一 st-* 组件的页面都具备
 * 全局主题模式能力，无需各自添加兼容代码。
 */

export const THEME_MODE_KEY = "st-theme-mode";

const readMode = () => {
  try {
    return localStorage.getItem(THEME_MODE_KEY) || "auto";
  } catch {
    return "auto";
  }
};

/** 把主题模式应用到当前文档（<html> 挂/去 st-light、st-dark 类） */
export function applyThemeMode(mode) {
  const classes = document.documentElement.classList;
  classes.remove("st-light", "st-dark");
  if (mode === "light") classes.add("st-light");
  else if (mode === "dark") classes.add("st-dark");
}

/** 读取当前主题模式：auto / light / dark */
export function getThemeMode() {
  return readMode();
}

/**
 * 切换并持久化主题模式（localStorage 键 "st-theme-mode"）。
 * 同源其他窗口经 storage 事件自动跟随（见模块底部监听器）。
 */
export function setThemeMode(mode) {
  try {
    localStorage.setItem(THEME_MODE_KEY, mode);
  } catch {}
  applyThemeMode(mode);
}

// 兜底：st-boot.js 已在首帧前同步挂类，这里重复应用一次以防
// 页面未经 st-boot 引入本模块（组件自动加载路径）
applyThemeMode(readMode());

// 跨窗口实时同步：storage 事件只在同源其他文档写入时触发，
// 本窗口切换由 setThemeMode 自己即时应用
window.addEventListener("storage", (e) => {
  if (e.key === THEME_MODE_KEY) {
    applyThemeMode(e.newValue || "auto");
  }
});
