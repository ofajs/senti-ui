import { test, expect } from "@playwright/test";

async function ready(page, selector) {
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      return el && el.shadowRoot && el.shadowRoot.querySelector("input, textarea");
    },
    selector,
    { timeout: 15_000 }
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/fixtures/input.html");
  await ready(page, "#in-basic");
});

test("placeholder 属性转发到内部 input", async ({ page }) => {
  const placeholder = await page.evaluate(
    () => document.querySelector("#in-basic").shadowRoot.querySelector("input").placeholder
  );
  expect(placeholder).toBe("basic placeholder");
});

test("default-value 初始化运行时 value（el.value 可读）", async ({ page }) => {
  const value = await page.evaluate(() => document.querySelector("#in-default-value").value);
  expect(value).toBe("init value");
});

test("type 属性转发到内部 input", async ({ page }) => {
  const type = await page.evaluate(
    () => document.querySelector("#in-password").shadowRoot.querySelector("input").type
  );
  expect(type).toBe("password");
});

test("输入后 el.value 更新，input/change 事件触发", async ({ page }) => {
  await page.locator("#in-basic").click();
  await page.keyboard.type("hello");
  // 点击空白处让内部 input 真实失焦（触发原生 change）
  await page.mouse.click(5, 200);

  expect(await page.evaluate(() => document.querySelector("#in-basic").value)).toBe("hello");
  const events = await page.evaluate(() => window.events.filter((e) => e.id === "in-basic"));
  const types = events.map((e) => e.type);
  expect(types.filter((t) => t === "input").length).toBe(5);
  expect(types).toContain("change");
  expect(types).toContain("focusin");
  expect(types).toContain("focusout");
  // 事件里读 e.target.value 已同步（value 反射到宿主，README 坑 #17）
  const last = events[events.length - 1];
  expect(last.value).toBe("hello");
});

test("JS 写 el.value 后内部 input 同步", async ({ page }) => {
  await page.evaluate(() => {
    document.querySelector("#in-basic").value = "set-by-js";
  });
  const inner = await page.evaluate(
    () => document.querySelector("#in-basic").shadowRoot.querySelector("input").value
  );
  expect(inner).toBe("set-by-js");
});

test("disabled 属性生效：内部 input 禁用、无法输入、事件不触发", async ({ page }) => {
  const state = await page.evaluate(() => {
    const el = document.querySelector("#in-disabled");
    return {
      innerDisabled: el.shadowRoot.querySelector("input").disabled,
      opacity: getComputedStyle(el).opacity,
    };
  });
  expect(state.innerDisabled).toBe(true);
  expect(parseFloat(state.opacity)).toBeCloseTo(0.38, 2);

  await page.locator("#in-disabled").click({ force: true }).catch(() => {});
  await page.keyboard.type("x");
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => document.querySelector("#in-disabled").value)).toBe("");
  expect(
    await page.evaluate(() => window.events.filter((e) => e.id === "in-disabled"))
  ).toEqual([]);
});

test("readonly 属性生效：可聚焦但不可输入", async ({ page }) => {
  const state = await page.evaluate(() => {
    const el = document.querySelector("#in-readonly");
    return {
      innerReadonly: el.shadowRoot.querySelector("input").readOnly,
      innerDisabled: el.shadowRoot.querySelector("input").disabled,
    };
  });
  expect(state.innerReadonly).toBe(true);
  expect(state.innerDisabled).toBe(false);

  await page.locator("#in-readonly").click();
  await page.keyboard.type("x");
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => document.querySelector("#in-readonly").value)).toBe("ro");
});

test("点击聚焦内部 input，点击外部失焦（focusin/focusout 冒泡到宿主）", async ({ page }) => {
  await page.locator("#in-basic").click();
  const active = await page.evaluate(
    () => document.querySelector("#in-basic").shadowRoot.activeElement === document.querySelector("#in-basic").shadowRoot.querySelector("input")
  );
  expect(active).toBe(true);
  await page.mouse.click(5, 200);
  await page.waitForTimeout(100);
  const events = await page.evaluate(() => window.events.filter((e) => e.id === "in-basic").map((e) => e.type));
  expect(events).toContain("focusin");
  expect(events).toContain("focusout");
});
