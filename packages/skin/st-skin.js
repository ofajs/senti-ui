/**
 * st-skin.js — Senti-UI 皮肤切换模块（材质层，不改变语义与行为）
 *
 * 皮肤只改“材质/形态”（圆角、密度、边框、阴影、毛玻璃、动效、波纹），
 * 颜色仍然全部来自 M3 角色变量（--md-sys-color-*），因此换肤不会破坏
 * 种子色 / error / success 等语义配色。
 *
 * 用法：
 *   import { setSkin, getSkin, registerSkin } from "/packages/skin/st-skin.js";
 *   setSkin("apple");        // 持久化到 localStorage("st-skin") + 切 <html data-skin>
 *   getSkin();               // 当前皮肤名
 *   registerSkin("my", "/my/skin.css"); // 注册自定义皮肤（文件规则见 README.md）
 *
 * 约定：皮肤 CSS 内部的所有规则都写在 [data-skin="名称"] 作用域下，
 * 因此切换时只需改 <html data-skin>，多套皮肤 CSS 可以同时存在、互不污染。
 *
 * 首帧建议：已知固定皮肤时，在 <html data-skin="apple"> 上直接写死，并在
 * head 静态引入对应 CSS，可避免模块加载后的一次样式切换。
 */

export const SKIN_KEY = "st-skin";

const LINK_ID = "st-skin-css";

// 内置皮肤：文件与本模块同目录，jsdelivr / 本地路径均可用
const registry = new Map([
  ["m3", new URL("./m3.css", import.meta.url).href],
  ["apple", new URL("./apple.css", import.meta.url).href],
  ["shadcn", new URL("./shadcn.css", import.meta.url).href],
]);

const readStored = () => {
  try {
    return localStorage.getItem(SKIN_KEY) || "";
  } catch {
    return "";
  }
};

/** 注册自定义皮肤：name 为皮肤名，href 为 CSS 地址（相对当前页或绝对地址） */
export function registerSkin(name, href) {
  if (!name || !href) return;
  registry.set(name, new URL(href, document.baseURI).href);
  if (getSkin() === name) applySkin(name);
}

/** 读取当前皮肤名（优先 localStorage，其次 <html data-skin>，兜底 m3） */
export function getSkin() {
  const stored = readStored();
  if (stored && registry.has(stored)) return stored;
  const attr = document.documentElement.dataset.skin;
  return attr && registry.has(attr) ? attr : "m3";
}

const ensureLink = (href) => {
  let link = document.getElementById(LINK_ID);
  if (!link) {
    link = document.createElement("link");
    link.id = LINK_ID;
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }
  if (link.getAttribute("href") !== href) link.setAttribute("href", href);
};

/**
 * 应用皮肤（不写 localStorage）：切 <html data-skin>，并按需注入皮肤 CSS。
 * 未注册的名称回退到 m3。
 */
export function applySkin(name) {
  const skin = registry.has(name) ? name : "m3";
  document.documentElement.dataset.skin = skin;
  const href = registry.get(skin);
  if (href) ensureLink(href);
  return skin;
}

/** 切换并持久化皮肤（同源其他窗口经 storage 事件自动跟随） */
export function setSkin(name) {
  const skin = applySkin(name);
  try {
    localStorage.setItem(SKIN_KEY, skin);
  } catch {}
  return skin;
}

// 初始化：localStorage 优先；页面若已静态写死 data-skin 则尊重它
applySkin(readStored() || document.documentElement.dataset.skin || "m3");

// 跨窗口同步：storage 事件只在同源其他文档写入时触发
window.addEventListener("storage", (e) => {
  if (e.key === SKIN_KEY && e.newValue) applySkin(e.newValue);
});
