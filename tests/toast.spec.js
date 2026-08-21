import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/fixtures/feedback.html");
  await page.waitForFunction(
    () => window.__stToastReady && document.querySelector("#sb-auto")?.shadowRoot,
    { timeout: 20_000 }
  );
});

test("toast：出现于左下角固定容器，默认 3s 自动消失", async ({ page }) => {
  await page.evaluate(() => { window.__t = window.stToast("已保存"); });
  await page.waitForSelector(".st-toast-container .st-toast");
  const geo = await page.evaluate(() => {
    const t = document.querySelector(".st-toast");
    const r = t.getBoundingClientRect();
    return {
      fixed: getComputedStyle(t.closest(".st-toast-container")).position,
      nearBottom: window.innerHeight - r.bottom < 100,
      nearLeft: r.left < 100,
      text: t.textContent.replace("✕", ""),
    };
  });
  expect(geo.fixed).toBe("fixed");
  expect(geo.nearBottom).toBe(true);
  expect(geo.nearLeft).toBe(true);
  expect(geo.text).toContain("已保存");

  await page.waitForTimeout(3500);
  expect(await page.evaluate(() => document.querySelectorAll(".st-toast").length)).toBe(0);
});

test("toast：多条堆叠、color 换色、duration 0 手动关闭", async ({ page }) => {
  await page.evaluate(async () => {
    await window.stToast({ message: "第一条", duration: 0 });
    await window.stToast({ message: "第二条", color: "success", duration: 0 });
  });
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => document.querySelectorAll(".st-toast").length)).toBe(2);

  // 彩色 toast 底色为 success 角色色
  const { successToken, bg } = await page.evaluate(() => {
    const token = getComputedStyle(document.documentElement).getPropertyValue("--md-sys-color-success").trim();
    const items = document.querySelectorAll(".st-toast");
    const bg = getComputedStyle(items[items.length - 1]).backgroundColor;
    return { successToken: token, bg };
  });
  const hex = successToken.replace("#", "");
  expect(bg).toBe(
    `rgb(${parseInt(hex.slice(0, 2), 16)}, ${parseInt(hex.slice(2, 4), 16)}, ${parseInt(hex.slice(4, 6), 16)})`
  );

  // 点 ✕ 关闭最后一条
  await page.evaluate(() => {
    const items = document.querySelectorAll(".st-toast");
    items[items.length - 1].querySelector('st-icon-button[slot="action"]').shadowRoot.querySelector("button").click();
  });
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => document.querySelectorAll(".st-toast").length)).toBe(1);

  // close() 手动关闭幂等
  await page.evaluate(() => window.__t && 0);
  await page.evaluate(async () => {
    const t = await window.stToast({ message: "第三条", duration: 0 });
    window.__t3 = t;
  });
  await page.waitForTimeout(200);
  await page.evaluate(() => window.__t3.close());
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => document.querySelectorAll(".st-toast").length)).toBe(1);
});
