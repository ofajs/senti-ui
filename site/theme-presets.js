/**
 * site/theme-presets.js — 官网演示层的「主题预设」管理器
 *
 * 皮肤系统（packages/skin/）只换材质，不碰颜色。但官网的材质卡是“主题”
 * 而不是纯皮肤：每套材质配一套官方配色（Cyberpunk 还带深色），点选时
 * 由这里一起套用，并按材质记住各自的颜色配置，切回来时恢复。
 *
 * - `setSkin("cyberpunk")` / `<html data-skin>` 仍然只换材质
 * - 官网皮肤页与 header 菜单走 applyThemePreset()，才会同时换配色
 * - 每个材质的配色存在 `st-theme-palettes`，M3 的槽位承接用户原本的颜色
 */

import { applyTheme, themeToCss } from "../packages/color/m3-theme.js";
import { applyThemeMode, getThemeMode, setThemeMode } from "../packages/color/st-theme-mode.js";
import { getSkin, setSkin } from "../packages/skin/st-skin.js";

const SLOTS_KEY = "st-theme-palettes";
const LEGACY_BACKUP_KEY = "st-cyberpunk-backup";
const COLOR_KEY = "st-color-config";
const CSS_KEY = "st-theme-css";
const MODE_KEY = "st-theme-mode";
const DEFAULT_SEED = "#0061A4";
const ROLES = ["primary", "secondary", "tertiary", "error", "success"];
const MODES = ["auto", "light", "dark"];

/**
 * 各材质的官方配色。M3 的槽位会承接用户原本的颜色，这里的蓝色只是首次兜底。
 * Apple / Windows 取各自平台的系统蓝，shadcn 取 zinc 近黑，Cyberpunk 取洋红 + 青。
 */
export const THEME_PRESETS = Object.freeze({
  m3: Object.freeze({ seed: "#0061A4", overrides: {}, customs: [], mode: null }),
  apple: Object.freeze({ seed: "#007AFF", overrides: {}, customs: [], mode: null }),
  windows: Object.freeze({ seed: "#0078D4", overrides: {}, customs: [], mode: null }),
  shadcn: Object.freeze({
    seed: "#18181B",
    // 生成器对近黑种子会回退到默认蓝；这里把三个品牌角色显式钉成 zinc 灰阶
    overrides: Object.freeze({ primary: "#18181B", secondary: "#3F3F46", tertiary: "#52525B" }),
    customs: [],
    mode: null,
  }),
  cyberpunk: Object.freeze({
    seed: "#FF2E97",
    overrides: Object.freeze({ tertiary: "#00E5FF" }),
    customs: [],
    mode: "dark",
  }),
});

const isHex = (value) => /^#[0-9a-f]{6}$/i.test(String(value || ""));
const isMode = (value) => MODES.includes(value);

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
  applyTheme(normalized.seed, normalized.overrides, customs);
  try {
    localStorage.setItem(COLOR_KEY, JSON.stringify(normalized));
    localStorage.setItem(CSS_KEY, themeToCss(normalized.seed, normalized.overrides, customs));
  } catch {}
  return normalized;
};

const applyMode = (mode) => {
  if (mode === "auto") {
    try {
      localStorage.removeItem(MODE_KEY);
    } catch {}
    applyThemeMode("auto");
  } else {
    setThemeMode(mode);
  }
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
    slots.m3 = { config, mode: isMode(backup.mode) ? backup.mode : "auto" };
    writeSlots(slots);
  }
  try {
    localStorage.removeItem(LEGACY_BACKUP_KEY);
  } catch {}
  return slots;
};

/**
 * 切换主题：保存当前材质的颜色/模式，套用目标材质的槽位或官方默认配色。
 * 返回最终的颜色配置与模式，皮肤页用它同步改色面板。
 */
export function applyThemePreset(name) {
  const id = THEME_PRESETS[name] ? name : "m3";
  const current = activeSkin();
  const currentConfig = readActiveConfig();
  const currentMode = getThemeMode();
  const slots = migrateLegacyBackup(readSlots());

  // 重复点击当前主题：不重置用户已经调过的颜色
  if (current === id && currentConfig) {
    return { skin: id, config: currentConfig, mode: currentMode };
  }

  if (current !== id) {
    slots[current] = {
      config: currentConfig || presetConfig(current),
      mode: currentMode,
    };
  }

  const slot = slots[id];
  const config = slot?.config ? normalizeColorConfig(slot.config) : presetConfig(id);
  const mode = isMode(slot?.mode) ? slot.mode : THEME_PRESETS[id].mode || currentMode;

  if (current !== id) writeSlots(slots);
  const applied = writeActiveConfig(config);
  applyMode(mode);
  setSkin(id);
  return { skin: id, config: applied, mode };
}
