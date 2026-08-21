// prompt.js —— 输入对话框（st-input + 确认 + 取消），基于 st-dialog
// 用法：
//   const val = await prompt("请输入新密码");           // → 输入值 / null（取消、遮罩、Escape）
//   const val = await prompt({ title, message, placeholder, value, yes, cancel });
import { escapeHtml, createDialog } from "./util.js";

const ensureInput = async () => {
  if (!customElements.get("st-input")) {
    document.body.insertAdjacentHTML("beforeend", `<l-m src="/packages/input/input.html"></l-m>`);
  }
  await customElements.whenDefined("st-input");
};

export default async function prompt(options) {
  let message = "";
  let title = "";
  let yesText = "确定";
  let cancelText = "取消";
  let placeholder = "";
  let defaultValue = "";

  if (typeof options === "string") {
    message = options;
  } else if (typeof options === "object" && options) {
    title = options.title || "";
    message = options.message || options.content || "";
    yesText = options.yes || "确定";
    cancelText = options.cancel || "取消";
    placeholder = options.placeholder || "";
    defaultValue = options.value || "";
  }

  await ensureInput();
  const result = await createDialog(
    {
      headline: title,
      body: `
        ${message ? `<p style="margin:0 0 0.857em; line-height:1.7; color: inherit;">${escapeHtml(message)}</p>` : ""}
        <st-input class="st-prompt-input" placeholder="${escapeHtml(placeholder)}" default-value="${escapeHtml(defaultValue)}" style="width:100%; box-sizing:border-box;"></st-input>`,
      actions: [
        { label: cancelText, kind: "cancel", value: null },
        { label: yesText, kind: "ok" },
      ],
    },
    {
      onOk: ({ dialog, finish, closeDialog }) => {
        finish(dialog.querySelector(".st-prompt-input").value);
        closeDialog();
      },
      onOpened: ({ dialog }) => {
        const input = dialog.querySelector(".st-prompt-input");
        const native = input.shadowRoot.querySelector("input");
        native.addEventListener("keydown", (e) => {
          if (e.key === "Enter") dialog.querySelector('st-button[variant="filled"]').shadowRoot.querySelector("button").click();
        });
        // st-dialog 打开后自身会把焦点移到面板容器（open watch 的 rAF 聚焦），
        // 输入框聚焦须排在其后，否则会被抢回
        setTimeout(() => {
          native.focus();
          native.select(); // 选中默认值方便覆盖输入
        }, 60);
      },
    }
  );
  // 取消/遮罩的 false 统一转为 null（匹配原生 window.prompt 行为）
  return result === false ? null : result;
}
