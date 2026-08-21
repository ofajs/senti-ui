// toast.js —— 命令式消息提示（基于 st-snackbar），用法见 packages/snackbar/README.md
// const t = toast("已保存");               // 默认 3s 自动消失
// const t = await toast({ message, duration, color });  // duration: 0 = 不自动消失
// t.close();                                 // 手动关闭

let container = null;
let styleAdded = false;

const loaded = new Set();
const ensureComp = async (tag, src) => {
  if (customElements.get(tag)) return;
  if (!loaded.has(src)) {
    loaded.add(src);
    document.body.insertAdjacentHTML("beforeend", `<l-m src="${src}"></l-m>`);
  }
  await customElements.whenDefined(tag);
};

const addStyles = () => {
  if (styleAdded) return;
  styleAdded = true;
  const style = document.createElement("style");
  style.textContent = `
    .st-toast-container {
      position: fixed;
      left: 1.429em;
      bottom: 1.429em;
      max-width: 600px;
      z-index: 20000;
      display: flex;
      flex-direction: column;
      justify-content: flex-end;
      align-items: flex-start;
      pointer-events: none; /* 容器不挡交互，消息条自身恢复 */
    }
    .st-toast {
      pointer-events: auto;
      margin-top: 0.571em;
      animation: st-toast-in 0.3s cubic-bezier(0.2, 0, 0, 1);
    }
    .st-toast:first-child { margin-top: 0; }
    .st-toast.st-toast-out {
      animation: st-toast-out 0.3s ease forwards;
      pointer-events: none;
    }
    @keyframes st-toast-in {
      from { opacity: 0; transform: translate(-0.571em, 0.571em); }
      to { opacity: 1; transform: none; }
    }
    @keyframes st-toast-out {
      from { opacity: 1; }
      to { opacity: 0; transform: translate(-0.571em, 0.571em); }
    }
    @media (prefers-reduced-motion: reduce) {
      .st-toast, .st-toast.st-toast-out { animation-duration: 0.01ms; }
    }
  `;
  document.head.appendChild(style);
};

const initContainer = () => {
  if (container) return;
  container = document.createElement("div");
  container.className = "st-toast-container";
  document.body.appendChild(container);
};

export default async function toast(options) {
  let message = "";
  let duration = 3000;
  let color = null; // 默认反色底；传 M3 角色名则整条换色

  if (typeof options === "string") {
    message = options;
  } else if (typeof options === "object" && options) {
    message = options.message || options.content || "";
    duration = options.duration ?? options.time ?? 3000;
    color = options.color || null;
  }

  await ensureComp("st-snackbar", "/packages/snackbar/snackbar.html");
  await ensureComp("st-icon-button", "/packages/button/icon-button.html");
  addStyles();
  initContainer();

  const snackbarEl = document.createElement("st-snackbar");
  if (color) snackbarEl.setAttribute("color", color);
  // 文本走 textContent，天然防注入
  snackbarEl.textContent = message;

  // 关闭按钮：用小号 st-icon-button（font-size 缩小整体等比缩小，不撑高消息条）；
  // 颜色用 color 属性——默认反色底上 inverse-primary，彩色底上 on-角色色
  const closeBtn = document.createElement("st-icon-button");
  closeBtn.setAttribute("slot", "action");
  closeBtn.setAttribute("color", color ? `on-${color}` : "inverse-primary");
  closeBtn.setAttribute("title", "关闭");
  closeBtn.style.fontSize = "10px"; /* 40px 默认太大，10px → 约 28px */
  closeBtn.textContent = "✕";
  snackbarEl.appendChild(closeBtn);

  snackbarEl.setAttribute("open", "");
  snackbarEl.classList.add("st-toast"); // 挂载即播放滑入动画
  container.appendChild(snackbarEl);

  let closed = false;
  const close = () => {
    if (closed) return;
    closed = true;
    clearTimeout(timer);
    // 先播滑出动画再移除元素（不先 hide：display:none 会冻结动画，坑 #34），
    // 元素移除即消失，无需再单独隐藏 snackbar
    snackbarEl.classList.add("st-toast-out");
    setTimeout(() => snackbarEl.remove(), 320);
  };
  closeBtn.addEventListener("click", close);
  const timer = duration > 0 ? setTimeout(close, duration) : null;

  return { close, el: snackbarEl };
}

export { toast };
