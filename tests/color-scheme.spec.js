import { test, expect } from "@playwright/test";

// 深色跟随系统：三条 CSS 生成路径（boot 缓存 / 静态兜底 / 动态注入）都必须让
// color-scheme 与 token 一起切到深色（滚动条等 UA 控件跟随），且首帧不闪浅色。

const schemeOf = (page) =>
  page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/fixtures/color-scheme.html");
});

test("深色系统下根元素 color-scheme 为 dark（静态兜底路径）", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  // 无缓存首访：boot 注入的是静态兜底 st-default.css
  await page.evaluate(() => localStorage.removeItem("st-theme-css"));
  await page.reload();
  expect(await schemeOf(page)).toContain("dark");
  expect(
    await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--md-sys-color-surface").trim())
  ).toBe("#1a1c1e");
});

test("深色系统下缓存路径 color-scheme 为 dark 且缓存含 media 块", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  // 首次加载让 st-color-init 生成并写缓存
  await page.waitForFunction(
    () => document.getElementById("st-dynamic-theme") !== null,
    { timeout: 15_000 }
  );
  const cached = await page.evaluate(() => localStorage.getItem("st-theme-css"));
  expect(cached).toContain("@media (prefers-color-scheme: dark)");
  expect(cached).toContain("color-scheme: dark");
  await page.reload(); // 走 boot 同步注入缓存路径
  expect(await schemeOf(page)).toContain("dark");
});

test("st-light 强制浅色、st-dark 强制深色不受系统影响", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.evaluate(() => document.documentElement.classList.add("st-light"));
  expect(await schemeOf(page)).toContain("light");
  await page.evaluate(() => {
    document.documentElement.classList.replace("st-light", "st-dark");
  });
  expect(await schemeOf(page)).toContain("dark");
});

test("浅色系统下默认 color-scheme 为 light", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.reload();
  expect(await schemeOf(page)).toContain("light");
});
