// confirm.js —— 确认对话框（确认 + 取消），基于 st-dialog
// 用法：
//   const ok = await confirm("确定删除吗？");           // → true / false / null（遮罩、Escape）
//   const ok = await confirm({ title, message, yes, cancel, color }); // color 如 "error" 用于危险操作
import { escapeHtml, createDialog } from "./util.js";

export default async function confirm(options) {
  let message = "";
  let title = "";
  let yesText = "确定";
  let cancelText = "取消";
  let color = null;

  if (typeof options === "string") {
    message = options;
  } else if (typeof options === "object" && options) {
    title = options.title || "";
    message = options.message || options.content || "";
    yesText = options.yes || "确定";
    cancelText = options.cancel || "取消";
    color = options.color || null;
  }

  return createDialog({
    headline: title,
    body: `<p style="margin:0; line-height:1.7; color: inherit;">${escapeHtml(message)}</p>`,
    actions: [
      { label: cancelText, kind: "cancel", value: false },
      { label: yesText, kind: "ok", color },
    ],
  });
}
