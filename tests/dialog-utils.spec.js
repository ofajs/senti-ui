import { test, expect } from "@playwright/test";

// 命令式工具（alert / confirm / prompt）基于 st-dialog
async function ready(page) {
  await page.goto("/tests/fixtures/dialog.html");
  await page.waitForFunction(
    () => window.__stDialogUtilsReady && document.querySelector("#dlg-basic")?.shadowRoot?.querySelector(".panel"),
    { timeout: 20_000 }
  );
}

// 当前命令式对话框实例（body 下最后一个 st-dialog）
const lastDialog = () =>
  page.evaluate(() => {
    const dialogs = document.body.querySelectorAll("st-dialog");
    return dialogs[dialogs.length - 1];
  });

test("alert：确认返回 true，遮罩返回 null，对话框用完即毁", async ({ page }) => {
  await ready(page);
  await page.evaluate(() => { window.__p = window.alert({ title: "提示", message: "操作成功" }); });

  await page.waitForFunction(
    () => document.querySelector('st-dialog[data-st-util]')?.hasAttribute("open")
  );
  // 点确认按钮（actions 插槽里的 filled st-button）
  await page.evaluate(() => {
    const d = document.querySelector('st-dialog[data-st-util]');
    d.querySelector('st-button[variant="filled"]').shadowRoot.querySelector("button").click();
  });
  expect(await page.evaluate(() => window.__p)).toBe(true);
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => document.querySelectorAll('st-dialog[data-st-util]').length)).toBe(0);

  // 遮罩关闭 → null
  await page.evaluate(() => { window.__p = window.alert("再试一次"); });
  await page.waitForFunction(() => document.querySelector('st-dialog[data-st-util]')?.hasAttribute("open"));
  await page.mouse.click(5, 300);
  expect(await page.evaluate(() => window.__p)).toBe(null);
});

test("confirm：确认 true / 取消 false / Escape null，危险色确认按钮", async ({ page }) => {
  await ready(page);
  await page.evaluate(() => { window.__p = window.confirm({ title: "删除", message: "不可撤销", yes: "删除", color: "error" }); });
  await page.waitForFunction(() => document.querySelector('st-dialog[data-st-util]')?.hasAttribute("open"));
  await page.evaluate(() => {
    const d = document.querySelector('st-dialog[data-st-util]');
    d.querySelector('st-button[variant="filled"]').shadowRoot.querySelector("button").click();
  });
  expect(await page.evaluate(() => window.__p)).toBe(true);

  await page.evaluate(() => { window.__p = window.confirm("取消场景"); });
  await page.waitForFunction(() => document.querySelector('st-dialog[data-st-util]')?.hasAttribute("open"));
  await page.evaluate(() => {
    const d = document.querySelector('st-dialog[data-st-util]');
    d.querySelector('st-button[variant="text"]').shadowRoot.querySelector("button").click();
  });
  expect(await page.evaluate(() => window.__p)).toBe(false);

  await page.evaluate(() => { window.__p = window.confirm("Escape 场景"); });
  await page.waitForFunction(() => document.querySelector('st-dialog[data-st-util]')?.hasAttribute("open"));
  await page.keyboard.press("Escape");
  expect(await page.evaluate(() => window.__p)).toBe(null);
});

test("prompt：确认返回输入值（Enter 提交），取消返回 null，自动聚焦并选中", async ({ page }) => {
  await ready(page);
  await page.evaluate(() => { window.__p = window.prompt({ title: "输入", placeholder: "写点什么", value: "预填值" }); });
  await page.waitForFunction(() => document.querySelector('st-dialog[data-st-util]')?.hasAttribute("open"));
  await page.waitForTimeout(200);

  // 自动聚焦 + 选中默认值：直接输入即覆盖
  await page.keyboard.type("hello");
  await page.keyboard.press("Enter");
  expect(await page.evaluate(() => window.__p)).toBe("hello");

  await page.evaluate(() => { window.__p = window.prompt("取消场景"); });
  await page.waitForFunction(() => document.querySelector('st-dialog[data-st-util]')?.hasAttribute("open"));
  await page.evaluate(() => {
    const d = document.querySelector('st-dialog[data-st-util]');
    d.querySelector('st-button[variant="text"]').shadowRoot.querySelector("button").click();
  });
  expect(await page.evaluate(() => window.__p)).toBe(null);
});
