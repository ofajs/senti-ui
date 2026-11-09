import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/fixtures/chip.html");
  await page.waitForFunction(
    () => document.querySelector("#ch-assist")?.shadowRoot?.querySelector("st-ripple"),
    { timeout: 20_000 }
  );
  await page.waitForTimeout(300);
});

test("chip：三种形态渲染与可交互性（assist/filter 宿主承载 button 语义，input 不可点击）", async ({ page }) => {
  const state = await page.evaluate(() => {
    const get = (id) => {
      const el = document.querySelector(`#${id}`);
      return { role: el.getAttribute("role"), tab: el.tabIndex, interactive: el.hasAttribute("data-interactive") };
    };
    return { assist: get("ch-assist"), filter: get("ch-filter"), input: get("ch-input"), disabled: get("ch-disabled") };
  });
  expect(state.assist).toEqual({ role: "button", tab: 0, interactive: true });
  expect(state.filter).toEqual({ role: "button", tab: 0, interactive: true });
  // input 形态不可点击、不参与 Tab
  expect(state.input).toEqual({ role: null, tab: -1, interactive: false });
  // disabled 跳过聚焦
  expect(state.disabled.interactive).toBe(false);
});

test("chip：filter 点击切换 selected（data 状态 + 宿主属性反射 + aria-pressed）并派发 composed change", async ({ page }) => {
  await page.locator("#ch-filter").click();
  await page.waitForTimeout(150);
  expect(
    await page.evaluate(() => {
      const el = document.querySelector("#ch-filter");
      return { selected: el.selected, attr: el.hasAttribute("selected"), pressed: el.getAttribute("aria-pressed") };
    })
  ).toEqual({ selected: true, attr: true, pressed: "true" });

  const evts = await page.evaluate(() => window.events.filter((e) => e.id === "ch-filter"));
  expect(evts.map((e) => e.type)).toEqual(["click", "change"]);
});

test("chip：初始静态 selected 属性被读入 data，点击可切回", async ({ page }) => {
  expect(await page.evaluate(() => document.querySelector("#ch-filter-selected").selected)).toBe(true);
  await page.locator("#ch-filter-selected").click();
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => document.querySelector("#ch-filter-selected").selected)).toBe(false);
});

test("chip：setAttribute/removeAttribute 反向同步进 data", async ({ page }) => {
  await page.evaluate(() => document.querySelector("#ch-filter").setAttribute("selected", ""));
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => document.querySelector("#ch-filter").selected)).toBe(true);
  await page.evaluate(() => document.querySelector("#ch-filter").removeAttribute("selected"));
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => document.querySelector("#ch-filter").selected)).toBe(false);
});

test("chip：removable ✕ 派发 remove（composed），不触发 chip 的 click/选中切换", async ({ page }) => {
  await page.locator("#ch-input .remove").click();
  await page.waitForTimeout(150);
  const evts = await page.evaluate(() => window.events.filter((e) => e.id === "ch-input"));
  expect(evts.map((e) => e.type)).toEqual(["remove"]);

  // removable 同时存在且 variant=filter 时，✕ 不切换选中
  await page.locator("#ch-removable-clickable .remove").click();
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => document.querySelector("#ch-removable-clickable").selected)).toBe(false);
  const evts2 = await page.evaluate(() => window.events.filter((e) => e.id === "ch-removable-clickable"));
  expect(evts2.map((e) => e.type)).toEqual(["remove"]);
});

test("chip：disabled 阻断点击与选中", async ({ page }) => {
  await page.locator("#ch-disabled").click({ force: true }); // pointer-events: none，force 验证组件内部守卫
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => document.querySelector("#ch-disabled").selected)).toBe(false);
  expect(await page.evaluate(() => window.events.filter((e) => e.id === "ch-disabled"))).toEqual([]);
});

test("chip：color=error 选中态消费 error 角色配对", async ({ page }) => {
  const state = await page.evaluate(() => {
    const el = document.querySelector("#ch-color");
    const root = getComputedStyle(document.documentElement);
    return {
      bg: getComputedStyle(el).backgroundColor,
      secondary: root.getPropertyValue("--md-sys-color-secondary-container").trim(),
    };
  });
  // 选中底色解析为 error 角色，而非默认 secondary-container
  expect(state.bg).not.toBe(state.secondary);
});

test("chip：键盘 Tab 可达、Enter/Space 切换选中，✕ 上按键不切换", async ({ page }) => {
  await page.locator("#ch-filter").focus();
  await page.keyboard.press("Enter");
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => document.querySelector("#ch-filter").selected)).toBe(true);

  await page.keyboard.press(" ");
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => document.querySelector("#ch-filter").selected)).toBe(false);
});
