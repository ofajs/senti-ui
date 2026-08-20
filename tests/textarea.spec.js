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
  await page.goto("/tests/fixtures/textarea.html");
  await ready(page, "#ta-basic");
});

test("placeholder 属性转发到内部 textarea", async ({ page }) => {
  const placeholder = await page.evaluate(
    () => document.querySelector("#ta-basic").shadowRoot.querySelector("textarea").placeholder
  );
  expect(placeholder).toBe("ta placeholder");
});

test("default-value 初始化运行时 value", async ({ page }) => {
  expect(
    await page.evaluate(() => document.querySelector("#ta-default-value").value)
  ).toBe("init ta");
});

test("rows 属性转发到内部 textarea", async ({ page }) => {
  const rows = await page.evaluate(
    () => document.querySelector("#ta-rows").shadowRoot.querySelector("textarea").rows
  );
  expect(rows).toBe(6);
  // rows=6 行高 1.7em @14px 字号 ≈ 142.8px，应明显高于默认 3 行的组件
  const heights = await page.evaluate(() => ({
    rows6: document.querySelector("#ta-rows").getBoundingClientRect().height,
    rows3: document.querySelector("#ta-basic").getBoundingClientRect().height,
  }));
  expect(heights.rows6).toBeGreaterThan(heights.rows3 * 1.5);
});

test("输入后 el.value 更新（含换行），input/change 事件触发", async ({ page }) => {
  await page.locator("#ta-basic").click();
  await page.keyboard.type("line1");
  await page.keyboard.press("Enter");
  await page.keyboard.type("line2");
  await page.mouse.click(5, 400);

  expect(await page.evaluate(() => document.querySelector("#ta-basic").value)).toBe(
    "line1\nline2"
  );
  const events = await page.evaluate(() => window.events.filter((e) => e.id === "ta-basic"));
  const types = events.map((e) => e.type);
  expect(types.filter((t) => t === "input").length).toBeGreaterThan(5);
  expect(types).toContain("change");
  expect(events[events.length - 1].value).toBe("line1\nline2");
});

test("disabled 属性生效：内部 textarea 禁用、无法输入", async ({ page }) => {
  const state = await page.evaluate(() => {
    const el = document.querySelector("#ta-disabled");
    return {
      innerDisabled: el.shadowRoot.querySelector("textarea").disabled,
      opacity: getComputedStyle(el).opacity,
    };
  });
  expect(state.innerDisabled).toBe(true);
  expect(parseFloat(state.opacity)).toBeCloseTo(0.38, 2);

  await page.locator("#ta-disabled").click({ force: true }).catch(() => {});
  await page.keyboard.type("x");
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => document.querySelector("#ta-disabled").value)).toBe("");
});

test("readonly 属性生效：可聚焦但不可输入", async ({ page }) => {
  const state = await page.evaluate(() => {
    const el = document.querySelector("#ta-readonly");
    return {
      innerReadonly: el.shadowRoot.querySelector("textarea").readOnly,
      innerDisabled: el.shadowRoot.querySelector("textarea").disabled,
    };
  });
  expect(state.innerReadonly).toBe(true);
  expect(state.innerDisabled).toBe(false);

  await page.locator("#ta-readonly").click();
  await page.keyboard.type("x");
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => document.querySelector("#ta-readonly").value)).toBe("ro");
});

test("点击聚焦内部 textarea，点击外部失焦（focusin/focusout 冒泡到宿主）", async ({ page }) => {
  await page.locator("#ta-basic").click();
  const active = await page.evaluate(
    () => document.querySelector("#ta-basic").shadowRoot.activeElement === document.querySelector("#ta-basic").shadowRoot.querySelector("textarea")
  );
  expect(active).toBe(true);
  await page.mouse.click(5, 400);
  await page.waitForTimeout(100);
  const types = await page.evaluate(() =>
    window.events.filter((e) => e.id === "ta-basic").map((e) => e.type)
  );
  expect(types).toContain("focusin");
  expect(types).toContain("focusout");
});
