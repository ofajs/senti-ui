/**
 * site/theme-presets.js — 官网演示层的「主题预设」管理器
 *
 * 皮肤系统（packages/skin/）只换材质，不碰颜色。但官网的材质卡是“主题”
 * 而不是纯皮肤：每套材质配一套官方配色，点选时由这里一起套用，并按材质
 * 记住各自的颜色配置，切回来时恢复。深浅模式是**全局设置**，不随主题切换。
 *
 * - `setSkin("cyberpunk")` / `<html data-skin>` 仍然只换材质
 * - 官网皮肤页与 header 菜单走 applyThemePreset()，才会同时换配色
 * - 每个材质的配色存在 `st-theme-palettes`，M3 的槽位承接用户原本的颜色
 */

import { applyTheme, normalizeContrast, themeToCss } from "../packages/color/m3-theme.js";
import { getThemeMode } from "../packages/color/st-theme-mode.js";
import { getSkin, setSkin } from "../packages/skin/st-skin.js";

const SLOTS_KEY = "st-theme-palettes";
const LEGACY_BACKUP_KEY = "st-cyberpunk-backup";
const COLOR_KEY = "st-color-config";
const CSS_KEY = "st-theme-css";
const DEFAULT_SEED = "#0061A4";
const ROLES = ["primary", "secondary", "tertiary", "error", "success"];

/**
 * 各材质的官方配色。M3 的槽位会承接用户原本的颜色，这里的蓝色只是首次兜底。
 * Apple / Windows 取各自平台的系统蓝，shadcn 取 zinc 近黑，Cyberpunk 取荧光绿 + 提亮方向。
 */
export const THEME_PRESETS = Object.freeze({
  m3: Object.freeze({ seed: "#0061A4", overrides: {}, customs: [] }),
  apple: Object.freeze({ seed: "#007AFF", overrides: {}, customs: [] }),
  windows: Object.freeze({ seed: "#0078D4", overrides: {}, customs: [] }),
  shadcn: Object.freeze({
    seed: "#18181B",
    // 生成器对近黑种子会回退到默认蓝；这里把三个品牌角色显式钉成 zinc 灰阶
    overrides: Object.freeze({ primary: "#18181B", secondary: "#3F3F46", tertiary: "#52525B" }),
    customs: [],
  }),
  cyberpunk: Object.freeze({
    // 荧光绿终端：近黑底 + 亮绿角色色（contrastTone: bright），而非传统的洋红/青
    seed: "#D6FE78",
    overrides: Object.freeze({}),
    customs: [],
    contrast: 1,
    contrastTone: "bright",
  }),
});

const isHex = (value) => /^#[0-9a-f]{6}$/i.test(String(value || ""));

/** 对比度配置收敛为 m3-theme 的形状；全相等时压成数字，读起来更短 */
const compactContrast = (value) => {
  const normalized = normalizeContrast(value);
  if (!normalized) return 0;
  const values = Object.values(normalized);
  if (values.every((v) => v === values[0])) return values[0];
  // 保留 default，UI 的“整体对比度”滑杆才有值可显示（normalizeContrast 已把它展开到各键）
  if (value && typeof value === "object" && value.default != null) {
    normalized.default = Math.max(0, Math.min(1, Number(value.default) || 0));
  }
  return normalized;
};

/** 把任意来源的颜色配置收敛成 m3-theme 能消费的形状 */
export function normalizeColorConfig(raw) {
  const source = raw && typeof raw === "object" ? raw : {};
  const overrides = {};
  for (const role of ROLES) {
    const value = source.overrides?.[role];
    if (isHex(value)) overrides[role] = String(value).toLowerCase();
  }
  const customs = Array.isArray(source.customs)
    ? source.customs
        .filter((c) => c && c.name && isHex(c.color))
        .map((c) => ({ name: String(c.name).trim(), color: String(c.color).toLowerCase() }))
    : [];
  return {
    seed: isHex(source.seed) ? String(source.seed).toLowerCase() : DEFAULT_SEED,
    overrides,
    customs,
    contrast: compactContrast(source.contrast),
    contrastTone: source.contrastTone === "bright" ? "bright" : "deep",
  };
}

const readJson = (key) => {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
};

const readActiveConfig = () => {
  const raw = readJson(COLOR_KEY);
  return raw && typeof raw === "object" ? normalizeColorConfig(raw) : null;
};

const readSlots = () => {
  const raw = readJson(SLOTS_KEY);
  return raw && typeof raw === "object" && !Array.isArray(raw) ? raw : {};
};

const writeSlots = (slots) => {
  try {
    localStorage.setItem(SLOTS_KEY, JSON.stringify(slots));
  } catch {}
};

const presetConfig = (skin) =>
  normalizeColorConfig(THEME_PRESETS[skin] || THEME_PRESETS.m3);

const activeSkin = () => {
  const attr = document.documentElement.dataset.skin;
  if (THEME_PRESETS[attr]) return attr;
  const stored = getSkin();
  return THEME_PRESETS[stored] ? stored : "m3";
};

const writeActiveConfig = (config) => {
  const normalized = normalizeColorConfig(config);
  const customs = Object.fromEntries(normalized.customs.map((c) => [c.name, c.color]));
  const options = { contrast: normalized.contrast };
  applyTheme(normalized.seed, normalized.overrides, customs, options);
  try {
    localStorage.setItem(COLOR_KEY, JSON.stringify(normalized));
    localStorage.setItem(
      CSS_KEY,
      themeToCss(normalized.seed, normalized.overrides, customs, options)
    );
  } catch {}
  return normalized;
};

/** 兼容上一版 Cyberpunk 单独备份：把备份迁移成 M3 槽位 */
const migrateLegacyBackup = (slots) => {
  const backup = readJson(LEGACY_BACKUP_KEY);
  if (!backup || typeof backup !== "object") return slots;
  if (!slots.m3) {
    let config = presetConfig("m3");
    if (typeof backup.color === "string") {
      try {
        config = normalizeColorConfig(JSON.parse(backup.color));
      } catch {}
    }
    slots.m3 = { config };
    writeSlots(slots);
  }
  try {
    localStorage.removeItem(LEGACY_BACKUP_KEY);
  } catch {}
  return slots;
};

/**
 * 切换主题：保存当前材质的颜色配置，套用目标材质的槽位或官方默认配色。
 * 深浅模式是全局设置，切换主题不会改变它；返回值里的 mode 只是当前全局模式。
 */
export function applyThemePreset(name) {
  const id = THEME_PRESETS[name] ? name : "m3";
  const current = activeSkin();
  const currentConfig = readActiveConfig();
  const currentMode = getThemeMode();
  const slots = migrateLegacyBackup(readSlots());

  const preset = presetConfig(id);
  // 对比度不跨材质记忆：切到/点回某套主题时，始终回到该主题的默认对比度。
  // 种子色、角色覆盖与自定义颜色仍按材质槽位记忆。
  const withPresetContrast = (config) => ({
    ...(config || preset),
    contrast: preset.contrast,
    contrastTone: preset.contrastTone,
  });

  // 重复点击当前主题：保留用户调过的种子色/角色色，但对比度回默认
  if (current === id && currentConfig) {
    const applied = writeActiveConfig(withPresetContrast(currentConfig));
    return { skin: id, config: applied, mode: currentMode };
  }

  if (current !== id) {
    slots[current] = { config: currentConfig || presetConfig(current) };
  }

  const slot = slots[id];
  const base = slot?.config ? normalizeColorConfig(slot.config) : preset;
  const config = withPresetContrast(base);

  if (current !== id) writeSlots(slots);
  const applied = writeActiveConfig(config);
  setSkin(id);
  return { skin: id, config: applied, mode: currentMode };
}
