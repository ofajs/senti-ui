/**
 * m3-theme.js — 从种子色自动生成 Material Design 3 颜色体系
 *
 * 基于 Google 官方 @material/material-color-utilities（HCT 色彩空间算法），CDN 引入，无构建。
 *
 * 用法：
 *   import { generateM3Theme, themeToCss, applyTheme } from "./m3-theme.js";
 *   applyTheme("#6750A4");                     // 生成并应用到当前文档（动态 <style> 注入变量）
 *   const css = themeToCss("#6750A4");         // 生成完整 CSS 文本（可直接保存为静态主题文件）
 *   const theme = generateM3Theme("#6750A4");  // 拿到 { light: {...}, dark: {...} } 结构化数据
 *
 * 除 M3 核心角色外，默认注入内置扩展角色 success（--md-sys-color-success 等 4 个配对 token，
 * 默认绿色、不随种子色变化，可通过 overrides.success 覆盖）。
 */

import {
  themeFromSourceColor,
  argbFromHex,
  hexFromArgb,
  Cam16,
  Hct,
} from "./vendor/material-color-utilities.js"; // 本地 vendored 单文件 bundle（源自 jsdelivr +esm，自包含无外部依赖）

// M3 系统变量名顺序（token 清单）
export const TOKEN_NAMES = [
  "primary", "onPrimary", "primaryContainer", "onPrimaryContainer",
  "secondary", "onSecondary", "secondaryContainer", "onSecondaryContainer",
  "tertiary", "onTertiary", "tertiaryContainer", "onTertiaryContainer",
  "error", "onError", "errorContainer", "onErrorContainer",
  "success", "onSuccess", "successContainer", "onSuccessContainer",
  "surface", "onSurface", "surfaceVariant", "onSurfaceVariant",
  "surfaceContainerLowest", "surfaceContainerLow", "surfaceContainer",
  "surfaceContainerHigh", "surfaceContainerHighest",
  "outline", "outlineVariant",
  "inverseSurface", "inverseOnSurface", "inversePrimary",
];

const toKebab = (name) =>
  "--md-sys-color-" + name.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());

// 支持手动覆盖的核心角色及其配对 token（on-* / *-container / on-*-container）
// 值为 [角色名, on角色名, 容器名, on容器名]
export const OVERRIDABLE_ROLES = {
  primary: ["primary", "onPrimary", "primaryContainer", "onPrimaryContainer"],
  secondary: ["secondary", "onSecondary", "secondaryContainer", "onSecondaryContainer"],
  tertiary: ["tertiary", "onTertiary", "tertiaryContainer", "onTertiaryContainer"],
  error: ["error", "onError", "errorContainer", "onErrorContainer"],
};

// 内置扩展角色（M3 核心规范之外、组件语义常用色）：不随种子色变化，
// 默认由固定种子色按 M3 tone 规则推导四配对 token，可被 overrides 同名键覆盖
export const EXTENDED_ROLES = {
  success: "#006E1C",
};

// M3 tone 规则：light [角色, on, container, onContainer] / dark 同序
const TONES = {
  light: [40, 100, 90, 10],
  dark: [80, 20, 30, 90],
};

// surface-container 五层 tone（npm 版 scheme 缺这几个 getter，从 neutral 色调盘推导）
const SURFACE_TONES = {
  light: { surfaceContainerLowest: 100, surfaceContainerLow: 96, surfaceContainer: 94, surfaceContainerHigh: 92, surfaceContainerHighest: 90 },
  dark: { surfaceContainerLowest: 4, surfaceContainerLow: 10, surfaceContainer: 12, surfaceContainerHigh: 17, surfaceContainerHighest: 22 },
};

// 从一个自定义颜色推导它在某 scheme 下的 4 个配对 token（保持色相/色度，只按 M3 tone 调明度）
// 注意：CDN 版本中 Hct.from(int) 解析异常，须先用 Cam16 提取色相/色度；不同版本方法名不同，做兼容
function deriveRoleTokens(hex, scheme) {
  const camFromArgb = Cam16.fromInt || Cam16.fromArgb;
  const cam = camFromArgb(argbFromHex(hex));
  return TONES[scheme].map((tone) =>
    hexFromArgb(Hct.from(cam.hue, cam.chroma, tone).toInt())
  );
}

/**
 * 生成完整的 M3 颜色体系
 * @param {string} seedHex 种子色，如 "#6750A4"
 * @param {Object<string, string>} [overrides] 手动指定的角色颜色，如 { primary: "#B3261E" }，
 *        可选键：primary / secondary / tertiary / error / success（success 为内置扩展角色，
 *        覆盖其默认绿色）；未指定的角色继续由种子色生成（success 恢复默认种子色）
 * @returns {{ light: Object<string, string>, dark: Object<string, string> }}
 */
export function generateM3Theme(seedHex, overrides = {}) {
  const theme = themeFromSourceColor(argbFromHex(seedHex));
  const pick = (scheme, surfaceTones) => {
    const out = {};
    for (const name of TOKEN_NAMES) {
      if (scheme[name] === undefined) continue; // 扩展角色不在 M3 scheme 上，下面单独推导
      out[name] = hexFromArgb(scheme[name]);
    }
    for (const [name, tone] of Object.entries(surfaceTones)) {
      out[name] = hexFromArgb(theme.palettes.neutral.tone(tone));
    }
    const mode = scheme === theme.schemes.light ? "light" : "dark";
    // 应用手动覆盖：从自定义色按 M3 tone 规则推导角色及其配对 token
    for (const [role, tokens] of Object.entries(OVERRIDABLE_ROLES)) {
      if (!overrides[role]) continue;
      const derived = deriveRoleTokens(overrides[role], mode);
      tokens.forEach((token, i) => (out[token] = derived[i]));
    }
    // 内置扩展角色：overrides 里有则用之，否则用默认种子色
    for (const [role, defaultHex] of Object.entries(EXTENDED_ROLES)) {
      const cap = role[0].toUpperCase() + role.slice(1);
      const tokens = [role, "on" + cap, role + "Container", "on" + cap + "Container"];
      const derived = deriveRoleTokens(overrides[role] || defaultHex, mode);
      tokens.forEach((token, i) => (out[token] = derived[i]));
    }
    return out;
  };
  return { light: pick(theme.schemes.light, SURFACE_TONES.light), dark: pick(theme.schemes.dark, SURFACE_TONES.dark) };
}

/**
 * 规范化自定义变量名：确保以 -- 开头、kebab-case（如 "brandRed" → "--brand-red"）
 */
function normalizeVarName(name) {
  let n = String(name).trim().replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
  if (!n.startsWith("--")) n = "--" + n.replace(/^-+/, "");
  return n;
}

/**
 * 展开自定义颜色变量：按 M3 tone 规则推导配对 token（与核心角色同规则）
 * 如 brand → --brand / --on-brand / --brand-container / --on-brand-container
 * 浅色 tone [40, 100, 90, 10]，深色 tone [80, 20, 30, 90]
 * @returns {{ light: Object<string,string>, dark: Object<string,string> }}
 */
export function expandCustoms(customs) {
  const light = {}, dark = {};
  for (const [name, hex] of Object.entries(customs || {})) {
    if (!name || !/^#[0-9a-fA-F]{6}$/.test(hex)) continue;
    const base = normalizeVarName(name);
    const names = [
      base,                          // 角色
      base.replace(/^--/, "--on-"),  // on-角色
      base + "-container",           // 角色-container
      base.replace(/^--/, "--on-") + "-container", // on-角色-container
    ];
    const lt = deriveRoleTokens(hex, "light");
    const dk = deriveRoleTokens(hex, "dark");
    names.forEach((n, i) => { light[n] = lt[i]; dark[n] = dk[i]; });
  }
  return { light, dark };
}

const customLines = (expandedScheme) =>
  Object.entries(expandedScheme || {}).map(([n, hex]) => `  ${n}: ${hex.toLowerCase()};`);

/**
 * 生成完整主题 CSS 文本（浅色 + 深色两个块）
 * @param {string} seedHex 种子色
 * @param {Object<string, string>} [overrides] 手动指定的角色颜色（见 generateM3Theme）
 * @param {Object<string, string>} [customs] 自定义颜色变量，如 { brand: "#FF0000" }，
 *        会按 M3 规则展开为 on/container 配对 token（浅色 + 深色）
 * @returns {string} CSS 文本
 */
export function themeToCss(seedHex, overrides, customs) {
  const { light, dark } = generateM3Theme(seedHex, overrides);
  const expanded = expandCustoms(customs);
  const block = (scheme, extra) =>
    TOKEN_NAMES.map((n) => `  ${toKebab(n)}: ${scheme[n].toLowerCase()};`).concat(customLines(extra)).join("\n");
  return `:root,\nhtml.st-light {\n  color-scheme: light;\n${block(light, expanded.light)}\n}\n\nhtml.st-dark {\n  color-scheme: dark;\n${block(dark, expanded.dark)}\n}\n`;
}

/**
 * 生成 M3 体系并直接应用到当前文档
 * 通过动态 <style> 注入变量，即时生效（含深色模式）
 * @param {string} seedHex 种子色
 * @param {Object<string, string>} [overrides] 手动指定的角色颜色（见 generateM3Theme）
 * @param {Object<string, string>} [customs] 自定义颜色变量（见 themeToCss）
 * @returns {{ light: Object, dark: Object }} 生成的体系
 */
export function applyTheme(seedHex, overrides, customs) {
  const { light, dark } = generateM3Theme(seedHex, overrides);
  const expanded = expandCustoms(customs);
  // 动态 <style> 整体注入（含深色选择器）
  let tag = document.getElementById("st-dynamic-theme");
  if (!tag) {
    tag = document.createElement("style");
    tag.id = "st-dynamic-theme";
    document.head.appendChild(tag);
  }
  const m3Lines = (scheme, extraScheme, indent) =>
    TOKEN_NAMES.map((n) => `${indent}${toKebab(n)}: ${scheme[n]};`)
      .concat(customLines(extraScheme).map((l) => indent + l.trim()))
      .join("\n");
  tag.textContent = `:root {\n${m3Lines(light, expanded.light, "  ")}\n}\nhtml.st-dark {\n${m3Lines(dark, expanded.dark, "  ")}\n}\n@media (prefers-color-scheme: dark) {\n  html:not(.st-light) {\n${m3Lines(dark, expanded.dark, "    ")}\n  }\n}`;
  return { light, dark };
}
