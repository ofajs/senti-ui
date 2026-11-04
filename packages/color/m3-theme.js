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

const roleTokenNames = (role) => {
  const cap = role[0].toUpperCase() + role.slice(1);
  return [role, "on" + cap, role + "Container", "on" + cap + "Container"];
};

// M3 tone 规则：light [角色, on, container, onContainer] / dark 同序
const ROLE_TONES = {
  light: [40, 100, 90, 10],
  dark: [80, 20, 30, 90],
};
const ROLE_TOKEN_TYPES = ["role", "on", "container", "onContainer"];

// 库内 scheme 的 error 在深色下 onErrorContainer 取 tone 80（其余角色 90），
// 这里保持一致，避免默认输出与旧版本漂移
const ROLE_TONE_EXCEPTIONS = {
  error: { dark: { 3: 80 } },
};

// 中性 token 的 tone 表与对比度类型（surface-container 五层 scheme 里没有，从 neutral 色盘推导）
const NEUTRAL_TOKEN_TONES = {
  surface: { palette: "neutral", light: 99, dark: 10, type: "surface" },
  onSurface: { palette: "neutral", light: 10, dark: 90, type: "onSurface" },
  surfaceVariant: { palette: "neutralVariant", light: 90, dark: 30, type: "surfaceVariant" },
  onSurfaceVariant: { palette: "neutralVariant", light: 30, dark: 80, type: "onSurfaceVariant" },
  surfaceContainerLowest: { palette: "neutral", light: 100, dark: 4, type: "surfaceContainer" },
  surfaceContainerLow: { palette: "neutral", light: 96, dark: 10, type: "surfaceContainer" },
  surfaceContainer: { palette: "neutral", light: 94, dark: 12, type: "surfaceContainer" },
  surfaceContainerHigh: { palette: "neutral", light: 92, dark: 17, type: "surfaceContainer" },
  surfaceContainerHighest: { palette: "neutral", light: 90, dark: 22, type: "surfaceContainer" },
  outline: { palette: "neutralVariant", light: 50, dark: 60, type: "outline" },
  outlineVariant: { palette: "neutralVariant", light: 80, dark: 30, type: "outlineVariant" },
  inverseSurface: { palette: "neutral", light: 20, dark: 90, type: "inverseSurface" },
  inverseOnSurface: { palette: "neutral", light: 95, dark: 20, type: "inverseOnSurface" },
  inversePrimary: { palette: "primary", light: 80, dark: 40, type: "inversePrimary" },
};

// 对比度增强（contrast 0–1）的 tone 偏移：值为对比度 = 1 时相对标准 M3 tone 的增量。
// 角色色在深浅两种模式下都往“更饱和的深色调”走；深色模式同时压暗表面，
// 于是明度对比基本保持、彩色饱和对比明显增强（霓虹 / 游戏类主题需要的观感）。
const CONTRAST_DELTAS = {
  light: {
    role: -10,
    on: 0,
    container: -8,
    onContainer: -8,
    surface: 1,
    surfaceContainer: 0,
    onSurface: -8,
    surfaceVariant: 4,
    onSurfaceVariant: -10,
    outline: -12,
    outlineVariant: -8,
    inverseSurface: -4,
    inverseOnSurface: 3,
    inversePrimary: 0,
  },
  dark: {
    role: -14,
    on: -8,
    container: -8,
    onContainer: 8,
    surface: -8,
    surfaceContainer: -5,
    onSurface: 8,
    surfaceVariant: -8,
    onSurfaceVariant: 10,
    outline: 16,
    outlineVariant: 10,
    inverseSurface: 5,
    inverseOnSurface: -4,
    inversePrimary: 0,
  },
};

// 对比度可按角色单独设置；neutral 控制 surface / outline 等中性色，custom 控制自定义变量
export const CONTRAST_ROLES = ["primary", "secondary", "tertiary", "error", "success"];
const CONTRAST_KEYS = [...CONTRAST_ROLES, "neutral", "custom"];

const clampTone = (tone) => Math.max(0, Math.min(100, tone));
const clamp01 = (value) => Math.max(0, Math.min(1, Number(value) || 0));

/**
 * 规范化对比度参数：
 * - 数字：0–1，统一作用于全部角色 / 中性色 / 自定义变量
 * - 对象：{ default?, primary?, secondary?, tertiary?, error?, success?, neutral?, custom? }
 *   未指定的键回退到 default（缺省 0）；因此 { primary: 1 } 只增强主色
 * @returns {Object<string, number>|null}
 */
export function normalizeContrast(contrast) {
  const numeric =
    typeof contrast === "string" && contrast.trim() !== ""
      ? Number(contrast)
      : contrast;
  if (typeof numeric === "number") {
    const value = clamp01(numeric);
    return Object.fromEntries(CONTRAST_KEYS.map((key) => [key, value]));
  }
  if (contrast && typeof contrast === "object") {
    const fallback = clamp01(contrast.default);
    return Object.fromEntries(
      CONTRAST_KEYS.map((key) => [
        key,
        contrast[key] == null ? fallback : clamp01(contrast[key]),
      ])
    );
  }
  return null;
}

// 从一个颜色的色相/色度按给定 tone 推导配对 token（保持色相/色度，只按 M3 tone 调明度）
// 注意：CDN 版本中 Hct.from(int) 解析异常，须先用 Cam16 提取色相/色度；不同版本方法名不同，做兼容。
// 必须从源色（或调色板）重新取 tone，不能把已生成的 token 直接平移 tone：
// 深色角色色在 tone 80 时色度已被色域裁到很低，平移后只会得到发灰的同色，无法恢复霓虹感。
function deriveRoleTokensAtTones(hex, tones) {
  const camFromArgb = Cam16.fromInt || Cam16.fromArgb;
  const cam = camFromArgb(argbFromHex(hex));
  return tones.map((tone) =>
    hexFromArgb(Hct.from(cam.hue, cam.chroma, clampTone(tone)).toInt())
  );
}

function roleTones(mode, role, contrast, applyException = true) {
  const tones = ROLE_TONES[mode].slice();
  if (applyException) {
    const exception = ROLE_TONE_EXCEPTIONS[role]?.[mode];
    if (exception) {
      for (const [index, tone] of Object.entries(exception)) tones[index] = tone;
    }
  }
  return tones.map((tone, index) =>
    clampTone(tone + CONTRAST_DELTAS[mode][ROLE_TOKEN_TYPES[index]] * contrast)
  );
}

// M3 音调盘的标准 tone 采样点（0 = 黑，100 = 白）
export const TONE_STEPS = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 98, 99, 100];

/**
 * 生成 M3 音调盘（tonal palettes）
 * - 传种子色字符串：输出标准 Primary / Secondary / Tertiary / Neutral / Neutral variant 五条盘
 * - 传角色色对象：输出当前实际角色色（含 overrides）的盘；标准角色用 Primary / Secondary /
 *   Tertiary / Error / Success 标签，自定义变量用变量名作标签，适合官网色块模式与角色面板对齐
 * 每条盘包含 0–100 共 14 个 tone。
 * @param {string|Object<string,string>} source 种子色，或 { primary, secondary, tertiary, error, success }
 * @returns {Array<{key: string, label: string, color: string, tones: Array<{tone: number, hex: string}>}>}
 */
export function generateTonalPalettes(source) {
  if (source && typeof source === "object") {
    const labels = {
      primary: "Primary",
      secondary: "Secondary",
      tertiary: "Tertiary",
      error: "Error",
      success: "Success",
    };
    return Object.entries(source)
      .filter(([, color]) => /^#[0-9a-fA-F]{6}$/.test(color || ""))
      .map(([key, color]) => ({
        key,
        label: labels[key] || key,
        color: color.toLowerCase(),
        tones: toneStrip(color),
      }));
  }

  const theme = themeFromSourceColor(argbFromHex(source));
  return [
    ["primary", "Primary"],
    ["secondary", "Secondary"],
    ["tertiary", "Tertiary"],
    ["neutral", "Neutral"],
    ["neutralVariant", "Neutral variant"],
  ].map(([key, label]) => {
    const palette = theme.palettes[key];
    return {
      key,
      label,
      color: hexFromArgb(palette.tone(40)).toLowerCase(),
      tones: TONE_STEPS.map((tone) => ({
        tone,
        hex: hexFromArgb(palette.tone(tone)).toLowerCase(),
      })),
    };
  });
}

// 从一个具体颜色提取色相/色度，再按 tone 采样；用于角色色盘（不受 seed 归一化影响）
function toneStrip(hex) {
  const argb = argbFromHex(hex);
  const cam = Cam16.fromInt ? Cam16.fromInt(argb) : Cam16.fromArgb(argb);
  return TONE_STEPS.map((tone) => ({
    tone,
    hex: hexFromArgb(Hct.from(cam.hue, cam.chroma, tone).toInt()).toLowerCase(),
  }));
}

/**
 * 生成完整的 M3 颜色体系
 * @param {string} seedHex 种子色，如 "#6750A4"
 * @param {Object<string, string>} [overrides] 手动指定的角色颜色，如 { primary: "#B3261E" }，
 *        可选键：primary / secondary / tertiary / error / success（success 为内置扩展角色，
 *        覆盖其默认绿色）；未指定的角色继续由种子色生成（success 恢复默认种子色）
 * @param {{ contrast?: number|Object }} [options] 对比度增强，见 normalizeContrast；
 *        数字 0–1 统一增强，或按角色对象（{ primary: 1, secondary: .5, neutral: 1 }）
 * @returns {{ light: Object<string, string>, dark: Object<string, string> }}
 */
export function generateM3Theme(seedHex, overrides = {}, options = {}) {
  const theme = themeFromSourceColor(argbFromHex(seedHex));
  const contrast = normalizeContrast(options.contrast);
  const pick = (mode) => {
    const out = {};
    const neutralContrast = contrast ? contrast.neutral : 0;

    // 中性色：从 neutral / neutralVariant 色盘取 tone，对比度通过 tone 偏移表达
    for (const [name, meta] of Object.entries(NEUTRAL_TOKEN_TONES)) {
      const tone = clampTone(
        meta[mode] + CONTRAST_DELTAS[mode][meta.type] * neutralContrast
      );
      out[name] = hexFromArgb(theme.palettes[meta.palette].tone(tone));
    }

    // 核心四角色：未覆盖时从色盘重新取 tone（色度随 tone 自动取到色域上限），
    // 覆盖时从覆盖色推导，保证与旧版默认输出一致
    for (const role of ["primary", "secondary", "tertiary", "error"]) {
      const tokens = roleTokenNames(role);
      const roleContrast = contrast ? contrast[role] : 0;
      if (overrides[role]) {
        const derived = deriveRoleTokensAtTones(
          overrides[role],
          roleTones(mode, role, roleContrast, false)
        );
        tokens.forEach((token, i) => (out[token] = derived[i]));
        continue;
      }
      const palette = theme.palettes[role];
      const tones = roleTones(mode, role, roleContrast);
      tokens.forEach((token, i) => {
        out[token] = hexFromArgb(palette.tone(tones[i]));
      });
    }

    // 内置扩展角色：overrides 里有则用之，否则用默认种子色
    const successContrast = contrast ? contrast.success : 0;
    const successDerived = deriveRoleTokensAtTones(
      overrides.success || EXTENDED_ROLES.success,
      roleTones(mode, "success", successContrast, false)
    );
    roleTokenNames("success").forEach((token, i) => (out[token] = successDerived[i]));

    return out;
  };
  return { light: pick("light"), dark: pick("dark") };
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
 * @param {Object<string,string>} customs 自定义变量
 * @param {{ contrast?: number|Object }} [options] 对比度增强；custom 键（或整体数字）控制自定义变量
 * @returns {{ light: Object<string,string>, dark: Object<string,string> }}
 */
export function expandCustoms(customs, options = {}) {
  const contrast = normalizeContrast(options.contrast);
  const customContrast = contrast ? contrast.custom : 0;
  const tonesFor = (mode) =>
    ROLE_TONES[mode].map((tone, i) =>
      clampTone(tone + CONTRAST_DELTAS[mode][ROLE_TOKEN_TYPES[i]] * customContrast)
    );
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
    const lt = deriveRoleTokensAtTones(hex, tonesFor("light"));
    const dk = deriveRoleTokensAtTones(hex, tonesFor("dark"));
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
 * @param {{ contrast?: number|Object }} [options] 对比度增强（见 generateM3Theme）
 * @returns {string} CSS 文本
 */
export function themeToCss(seedHex, overrides, customs, options) {
  const { light, dark } = generateM3Theme(seedHex, overrides, options);
  const expanded = expandCustoms(customs, options);
  const block = (scheme, extra) =>
    TOKEN_NAMES.map((n) => `  ${toKebab(n)}: ${scheme[n].toLowerCase()};`).concat(customLines(extra)).join("\n");
  return `:root,\nhtml.st-light {\n  color-scheme: light;\n${block(light, expanded.light)}\n}\n\nhtml.st-dark {\n  color-scheme: dark;\n${block(dark, expanded.dark)}\n}\n\n${darkMediaBlock(block(dark, expanded.dark), "  ")}\n`;
}

/**
 * 深色跟随系统 media 块（themeToCss 与 applyTheme 共用，防止两条生成路径漂移）：
 * decls 为深色块的声明文本（含各自缩进），indent 为块内声明所需的额外缩进
 */
function darkMediaBlock(decls, indent) {
  return `@media (prefers-color-scheme: dark) {\n  html:not(.st-light) {\n    color-scheme: dark;\n${decls.split("\n").map((l) => indent + l).join("\n")}\n  }\n}`;
}

/**
 * 生成 M3 体系并直接应用到当前文档
 * 通过动态 <style> 注入变量，即时生效（含深色模式）
 * @param {string} seedHex 种子色
 * @param {Object<string, string>} [overrides] 手动指定的角色颜色（见 generateM3Theme）
 * @param {Object<string, string>} [customs] 自定义颜色变量（见 themeToCss）
 * @param {{ contrast?: number|Object }} [options] 对比度增强（见 generateM3Theme）
 * @returns {{ light: Object, dark: Object }} 生成的体系
 */
export function applyTheme(seedHex, overrides, customs, options) {
  const { light, dark } = generateM3Theme(seedHex, overrides, options);
  const expanded = expandCustoms(customs, options);
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
  tag.textContent = `:root {\n  color-scheme: light;\n${m3Lines(light, expanded.light, "  ")}\n}\nhtml.st-dark {\n  color-scheme: dark;\n${m3Lines(dark, expanded.dark, "  ")}\n}\n${darkMediaBlock(`  color-scheme: dark;\n${m3Lines(dark, expanded.dark, "  ")}`, "  ")}`;
  return { light, dark };
}
