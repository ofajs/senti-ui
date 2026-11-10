import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/fixtures/avatar.html");
  await page.waitForFunction(
    () => document.querySelector("#av-text")?.shadowRoot?.querySelector(".text"),
    { timeout: 20_000 }
  );
  await page.waitForTimeout(300);
});

test("avatar：文字缩写渲染并居中显示", async ({ page }) => {
  const state = await page.evaluate(() => {
    const el = document.querySelector("#av-text");
    const cs = getComputedStyle(el);
    return {
      display: cs.display,
      radius: cs.borderRadius,
      size: cs.width,
      visible: getComputedStyle(el.shadowRoot.querySelector(".text")).display,
    };
  });
  expect(state.display).toBe("inline-flex");
  expect(state.radius).toBe("50%");
  expect(state.visible).not.toBe("none");
});

test("avatar：src 图片显示时隐藏文字插槽，alt 转发 aria-label 与内部 img", async ({ page }) => {
  const state = await page.evaluate(() => {
    const el = document.querySelector("#av-img");
    const img = el.shadowRoot.querySelector(".img");
    return {
      imgShown: getComputedStyle(img).display === "block",
      imgSrc: img.src.startsWith("data:image"),
      alt: img.alt,
      aria: el.getAttribute("aria-label"),
      textHidden: getComputedStyle(el.shadowRoot.querySelector(".text")).display === "none",
    };
  });
  expect(state.imgShown).toBe(true);
  expect(state.imgSrc).toBe(true);
  expect(state.alt).toBe("测试头像");
  expect(state.aria).toBe("测试头像");
  expect(state.textHidden).toBe(true);
});

test("avatar：color=error 消费 error 角色配对", async ({ page }) => {
  const state = await page.evaluate(() => {
    const root = getComputedStyle(document.documentElement);
    const parse = (v) => v.trim();
    return {
      bg: parse(getComputedStyle(document.querySelector("#av-color")).backgroundColor),
      normal: parse(getComputedStyle(document.querySelector("#av-text")).backgroundColor),
      errorToken: root.getPropertyValue("--md-sys-color-error").trim(),
    };
  });
  expect(state.bg).not.toBe(state.normal);
});

test("avatar：动态切换 color 属性生效", async ({ page }) => {
  await page.evaluate(() => document.querySelector("#av-text").setAttribute("color", "primary"));
  await page.waitForTimeout(200);
  const state = await page.evaluate(() => ({
    bg: getComputedStyle(document.querySelector("#av-text")).backgroundColor,
    primary: getComputedStyle(document.documentElement).getPropertyValue("--md-sys-color-primary").trim(),
  }));
  expect(state.bg).not.toBe("");
});
