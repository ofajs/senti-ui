// a11y.js — 组件共用的无障碍基础设施（无构建，按相对路径 import）
//
// 1. syncAccessibleName：把宿主上的 aria-label / aria-labelledby / title（或默认插槽文本）
//    同步到 shadow 内真正的原生控件上。内部控件与 slot 内容是兄弟节点，没有这一步时
//    无障碍树里会出现一个没有名字的 button/checkbox/input（screen reader 只读“按钮”）。
// 2. lockScroll / unlockScroll：模态层打开时锁背景滚动（引用计数，支持叠加）。
// 3. getDeepActiveElement / collectFocusable / trapTab：对话框的焦点陷阱。

const FOCUSABLE_SELECTOR =
  'a[href], area[href], button, input, textarea, select, summary, iframe, [tabindex], [contenteditable="true"]';

const isVisible = (el) => {
  if (!el) return false;
  if (el.hidden || el.getAttribute("aria-hidden") === "true") return false;
  return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
};

/**
 * 把可访问名称同步到内部原生控件。
 * @param {HTMLElement} host 组件宿主
 * @param {HTMLElement} control shadow 内承载语义的原生控件
 * @param {{ fromSlot?: boolean, excludeSlots?: string[] }} [opts]
 *   fromSlot=true 时，宿主没有显式 label 就用默认插槽文本；
 *   excludeSlots 列出不参与名称计算的命名插槽（如 split-button 的 menu）
 * @returns {() => void} 清理函数（在 detached 中调用）
 */
export function syncAccessibleName(host, control, opts = {}) {
  if (!host || !control) return () => {};
  const { fromSlot = false, excludeSlots = [] } = opts;
  let last = null;

  const resolve = () => {
    const explicit = resolveAccessibleName(host, "");
    if (explicit) return explicit;
    if (fromSlot) {
      return [...host.childNodes]
        .filter(
          (node) =>
            !(
              node.nodeType === 1 &&
              excludeSlots.includes(node.getAttribute("slot"))
            )
        )
        .map((node) => node.textContent || "")
        .join(" ")
        .replace(/\s+/g, " ")
        .trim();
    }
    return "";
  };

  const apply = () => {
    const label = resolve();
    if (label === last) return;
    last = label;
    if (label) control.setAttribute("aria-label", label);
    else control.removeAttribute("aria-label");
  };

  apply();
  const observer = new MutationObserver(apply);
  observer.observe(host, {
    attributes: true,
    attributeFilter: ["aria-label", "aria-labelledby", "title"],
    childList: true,
    subtree: true,
    characterData: true,
  });
  return () => observer.disconnect();
}

/** 把宿主自身的 aria-label / aria-labelledby / title 解析成纯文本（用于需要自己写 label 的场景） */
export function resolveAccessibleName(host, fallback = "") {
  if (!host) return fallback;
  const labelledby = host.getAttribute("aria-labelledby");
  if (labelledby) {
    const root = host.getRootNode();
    const text = labelledby
      .split(/\s+/)
      .filter(Boolean)
      .map((id) => {
        const el =
          (root.getElementById && root.getElementById(id)) ||
          document.getElementById(id);
        return el ? el.textContent.trim() : "";
      })
      .filter(Boolean)
      .join(" ");
    if (text) return text;
  }
  return (host.getAttribute("aria-label") || host.getAttribute("title") || fallback).trim();
}

let scrollLocks = 0;
let previousOverflow = "";
let previousPaddingRight = "";

/** 锁背景滚动（引用计数，对话框可叠加） */
export function lockScroll() {
  if (scrollLocks++ > 0) return;
  previousOverflow = document.body.style.overflow;
  previousPaddingRight = document.body.style.paddingRight;
  const gap = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = "hidden";
  if (gap > 0) {
    const current = parseFloat(getComputedStyle(document.body).paddingRight) || 0;
    document.body.style.paddingRight = `${current + gap}px`;
  }
}

/** 解锁背景滚动（与 lockScroll 成对调用） */
export function unlockScroll() {
  if (scrollLocks === 0) return;
  if (--scrollLocks > 0) return;
  document.body.style.overflow = previousOverflow;
  document.body.style.paddingRight = previousPaddingRight;
}

/** 穿透 shadow root 找到真正持有焦点的元素 */
export function getDeepActiveElement() {
  let active = document.activeElement;
  while (active && active.shadowRoot && active.shadowRoot.activeElement) {
    active = active.shadowRoot.activeElement;
  }
  return active;
}

/** 收集宿主内（含 slotted 自定义组件的 shadow）按 DOM 顺序可 Tab 的元素 */
export function collectFocusable(host) {
  const out = [];
  const add = (el) => {
    if (!el || el.disabled || el.tabIndex < 0 || !isVisible(el)) return;
    if (!out.includes(el)) out.push(el);
  };
  // 遍历所有后代（不能只查 FOCUSABLE_SELECTOR）：st-button 这类自定义元素
  // 宿主本身没有 tabindex，真正的焦点元素在它的 shadow 里
  for (const el of host.querySelectorAll("*")) {
    if (el.shadowRoot) {
      const inner = [...el.shadowRoot.querySelectorAll(FOCUSABLE_SELECTOR)].filter(
        (node) => node.tabIndex >= 0 && !node.disabled && isVisible(node)
      );
      if (inner.length) {
        inner.forEach(add);
        continue;
      }
    }
    if (el.matches && el.matches(FOCUSABLE_SELECTOR)) add(el);
  }
  return out;
}

/**
 * 处理 Tab / Shift+Tab，使焦点在 host 内循环。
 * @returns {boolean} 是否已处理（处理过时事件已 preventDefault）
 */
export function trapTab(host, event) {
  if (event.key !== "Tab") return false;
  const list = collectFocusable(host);
  if (!list.length) return false;
  const active = getDeepActiveElement();
  const index = list.indexOf(active);
  if (index === -1) {
    event.preventDefault();
    (event.shiftKey ? list[list.length - 1] : list[0]).focus();
    return true;
  }
  if (!event.shiftKey && index === list.length - 1) {
    event.preventDefault();
    list[0].focus();
    return true;
  }
  if (event.shiftKey && index === 0) {
    event.preventDefault();
    list[list.length - 1].focus();
    return true;
  }
  return false;
}
