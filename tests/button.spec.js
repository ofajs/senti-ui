import { test, expect } from "@playwright/test";

// 等待组件升级完成（shadowRoot 出现且内部原生元素就位）
async function ready(page, selector) {
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      return el && el.shadowRoot && el.shadowRoot.querySelector("button, input, textarea");
    },
    selector,
    { timeout: 15_000 }
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/fixtures/button.html");
  await ready(page, "#btn-default");
});

test("variant 属性生效：filled 有底色，outlined/text 透明底", async ({ page }) => {
  const styles = await page.evaluate(() => {
    const get = (sel) => {
      const cs = getComputedStyle(document.querySelector(sel));
      return { bg: cs.backgroundColor, border: cs.borderColor, transparent: cs.backgroundColor === "rgba(0, 0, 0, 0)" };
    };
    return {
      filled: get("#btn-default"),
      outlined: get("#btn-outlined"),
      text: get("#btn-text"),
    };
  });
  expect(styles.filled.transparent).toBe(false);
  expect(styles.outlined.transparent).toBe(true);
  expect(styles.text.transparent).toBe(true);
  // outlined 有可见描边，text 无描边
  expect(styles.outlined.border).not.toBe(styles.text.border);
});

test("color 属性生效：color=error 的 filled 背景等于 error 角色色", async ({ page }) => {
  const { errorBg, btnBg } = await page.evaluate(() => {
    const token = getComputedStyle(document.documentElement)
      .getPropertyValue("--md-sys-color-error")
      .trim();
    const btn = getComputedStyle(document.querySelector("#btn-color")).backgroundColor;
    return { errorBg: token, btnBg: btn };
  });
  // token 是十六进制，运行值是 rgb()，比较各通道
  const hex = errorBg.replace("#", "");
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  expect(btnBg).toBe(`rgb(${r}, ${g}, ${b})`);
});

test("disabled 属性生效：阻断点击且视觉变淡", async ({ page }) => {
  const { innerDisabled, opacity } = await page.evaluate(() => {
    const el = document.querySelector("#btn-disabled");
    const inner = el.shadowRoot.querySelector("button");
    return {
      innerDisabled: inner.disabled,
      opacity: getComputedStyle(el).opacity,
    };
  });
  expect(innerDisabled).toBe(true);
  expect(parseFloat(opacity)).toBeCloseTo(0.38, 2);

  await page.locator("#btn-disabled").click({ force: true }).catch(() => {});
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.events)).toEqual([]);
});

test("loading 属性生效：阻断点击", async ({ page }) => {
  const innerDisabled = await page.evaluate(() => {
    const el = document.querySelector("#btn-loading");
    return el.shadowRoot.querySelector("button").disabled;
  });
  expect(innerDisabled).toBe(true);

  await page.locator("#btn-loading").click({ force: true }).catch(() => {});
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.events)).toEqual([]);
});

test("click 事件触发成功", async ({ page }) => {
  await page.locator("#btn-default").click();
  expect(await page.evaluate(() => window.events)).toEqual(["btn-default"]);
});

test("键盘 Enter 可激活按钮", async ({ page }) => {
  // 语义由内部 .native button 承载，聚焦它后按 Enter
  await page.evaluate(
    () => document.querySelector("#btn-default").shadowRoot.querySelector("button").focus()
  );
  await page.keyboard.press("Enter");
  expect(await page.evaluate(() => window.events)).toEqual(["btn-default"]);
});

test("type 属性转发到内部原生 button", async ({ page }) => {
  const type = await page.evaluate(
    () => document.querySelector("#btn-submit").shadowRoot.querySelector("button").type
  );
  expect(type).toBe("submit");
});

test("prefix/suffix 插槽内容渲染到按钮内", async ({ page }) => {
  const texts = await page.evaluate(() => {
    const el = document.querySelector("#btn-slots");
    const sr = el.shadowRoot;
    // 插槽内容仍在 light DOM，通过 assignedElements 验证分发
    const assigned = (name) =>
      sr.querySelector(`slot[name="${name}"]`)
        .assignedElements()
        .map((n) => n.textContent)
        .join("");
    return { prefix: assigned("prefix"), default: sr.querySelector("slot:not([name])").assignedNodes().map(n => n.textContent).join(""), suffix: assigned("suffix") };
  });
  expect(texts.prefix).toBe("🔍");
  expect(texts.default).toContain("WithSlots");
  expect(texts.suffix).toBe("⏎");
});

test("JS setAttribute 动态切换 disabled 生效（异步 watch）", async ({ page }) => {
  await page.evaluate(() => {
    document.querySelector("#btn-default").setAttribute("disabled", "");
  });
  // ofa 的 setAttribute watch 是异步的（CONTEXT.md 坑 #18）
  await page.waitForTimeout(200);
  const innerDisabled = await page.evaluate(
    () => document.querySelector("#btn-default").shadowRoot.querySelector("button").disabled
  );
  expect(innerDisabled).toBe(true);

  await page.locator("#btn-default").click({ force: true }).catch(() => {});
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.events)).toEqual([]);
});
