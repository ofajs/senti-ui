import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/fixtures/controls.html");
  // 等所有控件组件升级完成（shadowRoot + 内部 input 就位），避免偶发未就绪
  await page.waitForFunction(
    () =>
      ["#cb-basic", "#sw-basic", "#rd-a"].every((sel) => {
        const el = document.querySelector(sel);
        return el && el.shadowRoot && el.shadowRoot.querySelector("input");
      }),
    { timeout: 15_000 }
  );
});

// ---------- st-checkbox ----------

test("checkbox：checked 初始属性生效（内部 input 选中）", async ({ page }) => {
  expect(
    await page.evaluate(() => document.querySelector("#cb-init").shadowRoot.querySelector("input").checked)
  ).toBe(true);
  expect(
    await page.evaluate(() => document.querySelector("#cb-basic").shadowRoot.querySelector("input").checked)
  ).toBe(false);
});

test("checkbox：点击切换 checked 属性并派发 change", async ({ page }) => {
  await page.locator("#cb-basic").click();
  expect(
    await page.evaluate(() => document.querySelector("#cb-basic").hasAttribute("checked"))
  ).toBe(true);
  expect(await page.evaluate(() => window.events)).toEqual([{ id: "cb-basic", checked: true }]);

  await page.locator("#cb-basic").click();
  expect(
    await page.evaluate(() => document.querySelector("#cb-basic").hasAttribute("checked"))
  ).toBe(false);
});

test("checkbox：Space 键盘切换", async ({ page }) => {
  // 焦点在内部 .native input 上（宿主本身不可聚焦）
  await page.evaluate(
    () => document.querySelector("#cb-basic").shadowRoot.querySelector("input").focus()
  );
  await page.keyboard.press(" ");
  expect(
    await page.evaluate(() => document.querySelector("#cb-basic").hasAttribute("checked"))
  ).toBe(true);
});

test("checkbox：indeterminate 点击后退化为选中态", async ({ page }) => {
  await page.locator("#cb-ind").click();
  expect(
    await page.evaluate(() => {
      const el = document.querySelector("#cb-ind");
      return { ind: el.hasAttribute("indeterminate"), checked: el.hasAttribute("checked") };
    })
  ).toEqual({ ind: false, checked: true });
});

test("checkbox：disabled 阻断交互（点击/键盘均无效）", async ({ page }) => {
  await page.locator("#cb-disabled").click({ force: true }).catch(() => {});
  await page.keyboard.press(" ");
  await page.waitForTimeout(100);
  expect(
    await page.evaluate(() => document.querySelector("#cb-disabled").hasAttribute("checked"))
  ).toBe(false);
  expect(await page.evaluate(() => window.events)).toEqual([]);
});

test("checkbox：color 属性改变选中态底色（error 角色色）", async ({ page }) => {
  const { errorBg, boxBg } = await page.evaluate(() => {
    const token = getComputedStyle(document.documentElement).getPropertyValue("--md-sys-color-error").trim();
    return {
      errorBg: token,
      boxBg: getComputedStyle(document.querySelector("#cb-color").shadowRoot.querySelector(".box")).backgroundColor,
    };
  });
  const hex = errorBg.replace("#", "");
  expect(boxBg).toBe(
    `rgb(${parseInt(hex.slice(0, 2), 16)}, ${parseInt(hex.slice(2, 4), 16)}, ${parseInt(hex.slice(4, 6), 16)})`
  );
});

// ---------- st-switch ----------

test("switch：checked 初始属性生效（内部 input 选中）", async ({ page }) => {
  expect(
    await page.evaluate(() => document.querySelector("#sw-init").shadowRoot.querySelector("input").checked)
  ).toBe(true);
});

test("switch：点击切换并派发 change", async ({ page }) => {
  await page.locator("#sw-basic").click();
  expect(
    await page.evaluate(() => document.querySelector("#sw-basic").hasAttribute("checked"))
  ).toBe(true);
  expect(await page.evaluate(() => window.events)).toEqual([{ id: "sw-basic", checked: true }]);
});

test("switch：disabled 阻断交互", async ({ page }) => {
  await page.locator("#sw-disabled").click({ force: true }).catch(() => {});
  await page.waitForTimeout(100);
  expect(
    await page.evaluate(() => document.querySelector("#sw-disabled").hasAttribute("checked"))
  ).toBe(false);
  expect(await page.evaluate(() => window.events)).toEqual([]);
});

// ---------- st-radio ----------

test("radio：点击选中并取消同组其他项，change 派发一次", async ({ page }) => {
  await page.locator("#rd-b").click();
  const state = await page.evaluate(() => ({
    a: document.querySelector("#rd-a").hasAttribute("checked"),
    b: document.querySelector("#rd-b").hasAttribute("checked"),
  }));
  expect(state).toEqual({ a: false, b: true });
  expect(await page.evaluate(() => window.events)).toEqual([{ id: "rd-b", checked: true }]);
});

test("radio：disabled 阻断选中", async ({ page }) => {
  await page.locator("#rd-c").click({ force: true }).catch(() => {});
  await page.waitForTimeout(100);
  expect(
    await page.evaluate(() => document.querySelector("#rd-c").hasAttribute("checked"))
  ).toBe(false);
  expect(await page.evaluate(() => window.events)).toEqual([]);
});
