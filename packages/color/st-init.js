/**
 * st-init.js — Senti-UI 项目初始化模块
 *
 * 取代静态的 css/st-m3.css：读取 color 工具保存在 localStorage 的配置
 * （种子色 / 角色覆盖 / 自定义变量，key 为 "st-color-config"），
 * 动态生成完整 M3 颜色体系并注入 <style>；无保存配置时使用默认种子色。
 * 体系含内置扩展角色 success（--md-sys-color-success 等 4 个配对 token，
 * 默认绿色、不随种子色变化，可在 color 工具或 overrides 中覆盖）。
 *
 * 用法（所有页面统一，代替原 <link rel="stylesheet" href="/css/st-m3.css">）：
 *   <script type="module" src="/packages/color/st-init.js"></script>
 *
 * 注意：颜色在 JS 执行后才生效，页面会有极短的未上色闪烁；
 *      依赖 CDN 上的 @material/material-color-utilities。
 */

import { applyTheme } from "./m3-theme.js";

const STORAGE_KEY = "st-color-config";
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
