// alert.js —— 警告对话框（仅确认按钮），基于 st-dialog
// 用法：
//   const ok = await alert("操作成功");                 // → true（确认）/ null（遮罩、Escape）
//   const ok = await alert({ title, message, ok, color });
import { escapeHtml, createDialog } from "./util.js";

export default async function alert(options) {
  let message = "";
  let title = "";
  let okText = "确定";
  let color = null;

  if (typeof options === "string") {
    message = options;
  } else if (typeof options === "object" && options) {
    title = options.title || "";
    message = options.message || options.content || "";
    okText = options.ok || options.yes || "确定";
    color = options.color || null;
  }

  return createDialog(
    {
      headline: title,
      body: `<p style="margin:0; line-height:1.7; color: inherit;">${escapeHtml(message)}</p>`,
      actions: [{ label: okText, kind: "ok", color }],
    },
    {
      onOk: ({ finish, closeDialog }) => {
        finish(true);
        closeDialog();
      },
    }
  );
}
