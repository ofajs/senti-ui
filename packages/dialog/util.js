// util.js —— 命令式对话框核心工厂（基于 st-dialog）
// alert / confirm / prompt 均在此基础上构建；用法见 README.md

// 确保依赖组件已加载（无构建环境：按需注入 <l-m>，l-m 自带去重场景下这里手动判断）
const loaded = new Set();
const ensureComp = async (tag, src) => {
  if (customElements.get(tag)) return;
  if (!loaded.has(src)) {
    loaded.add(src);
    document.body.insertAdjacentHTML("beforeend", `<l-m src="${src}"></l-m>`);
  }
  await customElements.whenDefined(tag);
};

const ensureDeps = () =>
  Promise.all([
    ensureComp("st-dialog", "/packages/dialog/dialog.html"),
    ensureComp("st-button", "/packages/button/button.html"),
  ]);

const escapeHtml = (str) => {
  if (typeof str !== "string") return str;
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
};

/**
 * 创建 st-dialog 并挂载到 body（命令式，用完即毁）
 * @param {object} cfg
 *   - headline: 标题文本
 *   - body: 正文 HTML（已由调用方转义）
 *   - actions: [{ label, kind: "ok"|"cancel", variant, color }]，kind 用于结果映射
 * @param {object} hooks - { onOk(dialog, resolve, closeDialog), onOpened(dialog) }
 * @returns {Promise} resolve(结果值)
 */
const createDialog = async (cfg, hooks = {}) => {
  await ensureDeps();
  return new Promise((resolve) => {
    const dialog = document.createElement("st-dialog");
    dialog.setAttribute("auto-close", "");
    dialog.setAttribute("data-st-util", ""); // 命令式实例标记（页面常驻对话框区分）
    if (cfg.headline) {
      const h = document.createElement("h2");
      h.slot = "headline";
      h.textContent = cfg.headline;
      dialog.appendChild(h);
    }
    if (cfg.body) {
      const tpl = document.createElement("template");
      tpl.innerHTML = cfg.body.trim();
      dialog.append(...tpl.content.childNodes);
    }
    const actionsBox = document.createElement("div");
    actionsBox.slot = "actions";
    actionsBox.style.display = "flex";
    actionsBox.style.justifyContent = "flex-end";
    actionsBox.style.gap = "0.571em";
    let settled = false;
    const finish = (val) => {
      if (settled) return;
      settled = true;
      resolve(val);
    };
    const closeDialog = () => {
      // st-dialog 的 open 兼容属性路径（内部 MutationObserver 同步 data）
      dialog.removeAttribute("open");
      setTimeout(() => dialog.remove(), 350); // 等退出动画播完再销毁
    };

    (cfg.actions || []).forEach((act) => {
      const btn = document.createElement("st-button");
      btn.setAttribute("variant", act.variant || (act.kind === "cancel" ? "text" : "filled"));
      if (act.color) btn.setAttribute("color", act.color);
      btn.textContent = act.label;
      btn.addEventListener("click", () => {
        if (act.kind === "ok" && hooks.onOk) {
          hooks.onOk({ dialog, finish, closeDialog });
        } else {
          finish(act.value !== undefined ? act.value : act.kind === "ok");
          closeDialog();
        }
      });
      actionsBox.appendChild(btn);
    });
    dialog.appendChild(actionsBox);

    // 遮罩点击 / Escape（st-dialog 的 auto-close 行为）→ 未选择即关闭
    dialog.addEventListener("close", () => {
      finish(null);
      closeDialog();
    });

    document.body.appendChild(dialog);
    requestAnimationFrame(() => {
      dialog.setAttribute("open", "");
      hooks.onOpened?.({ dialog });
    });
  });
};

export { escapeHtml, createDialog };
