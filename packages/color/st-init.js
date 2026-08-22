/**
 * st-init.js — Senti-UI 项目初始化模块
 *
 * 读取 color 工具保存在 localStorage 的配置（种子色 / 角色覆盖 / 自定义变量，
 * key 为 "st-color-config"），动态生成完整 M3 颜色体系并注入 <style>；
 * 无保存配置时使用默认种子色。
 * 体系含内置扩展角色 success（--md-sys-color-success 等 4 个配对 token，
 * 默认绿色、不随种子色变化，可在 color 工具或 overrides 中覆盖）。
 *
 * 用法（所有页面统一）：
 *   <head> 内尽早引入同步引导（消除刷新闪色）：
 *     <script src="/packages/color/st-boot.js"></script>
 *   再引入本模块：
 *     <script type="module" src="/packages/color/st-init.js"></script>
 *
 * 闪色治理（与 st-boot.js 配合）：本模块生成主题后会把 CSS 文本缓存到
 * localStorage（key "st-theme-css"），st-boot.js 在下次刷新时同步注入该缓存，
 * 颜色零延迟；首次访问由 st-boot 引入静态兜底 st-default.css。
 */

import { applyTheme, themeToCss } from "./m3-theme.js";

const STORAGE_KEY = "st-color-config";
const CSS_CACHE_KEY = "st-theme-css";
const DEFAULT_SEED = "#0061A4";

let config = { seed: DEFAULT_SEED, overrides: {}, customs: [] };
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
  if (saved && /^#[0-9a-fA-F]{6}$/.test(saved.seed || "")) {
    config = {
      seed: saved.seed,
      overrides: saved.overrides || {},
      customs: Array.isArray(saved.customs) ? saved.customs : [],
    };
  }
} catch {}

// customs 数组 → 生成器所需对象（与 color 工具页一致）
const customsObj = Object.fromEntries(
  config.customs
    .filter((c) => c && c.name && c.name.trim() && /^#[0-9a-fA-F]{6}$/.test(c.color || ""))
    .map((c) => [c.name.trim(), c.color])
);

export const themeConfig = config;
export const theme = applyTheme(config.seed, config.overrides, customsObj);

// 缓存生成的主题 CSS（themeToCss 输出含 :root / html.st-light / html.st-dark 完整块），
// 供 st-boot.js 下次刷新同步注入（写缓存失败不影响当前页）
try {
  localStorage.setItem(CSS_CACHE_KEY, themeToCss(config.seed, config.overrides, customsObj));
} catch {}
