import { test, expect } from "@playwright/test";

// sync:open 双向绑定：内部 auto-close 关闭后自动回写上层数据（验收页真实 ofa 绑定环境）
test("dialog：auto-close 关闭经 sync:open 回写上层数据，可再次打开", async ({ page }) => {
  await page.goto("/packages/dialog/");
  await page.waitForFunction(
    () => {
      const dlg = document.querySelector("o-page")?.shadowRoot?.querySelector("st-dialog");
      return dlg && dlg.shadowRoot && dlg.shadowRoot.querySelector(".panel");
    },
    { timeout: 20_000 }
  );

  // 打开 auto-close 对话框
  await page.getByText("打开 auto-close 对话框").click();
  await page.waitForTimeout(300);
  const visible = await page.evaluate(() => {
    const dlg = document
      .querySelector("o-page")
      .shadowRoot.querySelectorAll("st-dialog")[1];
    return getComputedStyle(dlg).display;
  });
  expect(visible).toBe("grid");

  // Escape 交互关闭（内部改 data open）
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
  expect(
    await page.evaluate(() => {
      const dlg = document
        .querySelector("o-page")
        .shadowRoot.querySelectorAll("st-dialog")[1];
      return { display: getComputedStyle(dlg).display, attr: dlg.hasAttribute("open") };
    })
  ).toEqual({ display: "none", attr: false });

  // 上层 openState.auto 已被 sync:open 回写为 false：按钮可再次打开
  await page.getByText("打开 auto-close 对话框").click();
  await page.waitForTimeout(300);
  expect(
    await page.evaluate(() => {
      const dlg = document
        .querySelector("o-page")
        .shadowRoot.querySelectorAll("st-dialog")[1];
      return getComputedStyle(dlg).display;
    })
  ).toBe("grid");
});
