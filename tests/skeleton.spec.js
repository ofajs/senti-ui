import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/fixtures/skeleton.html");
  await page.waitForFunction(
    () => document.querySelector("#sk-text") && document.querySelector("#sk-text").shadowRoot,
    { timeout: 20_000 }
  );
  await page.waitForTimeout(300);
});

test("skeleton：三形态默认尺寸/圆角/动画", async ({ page }) => {
  const state = await page.evaluate(() => {
    const get = (id) => {
      const cs = getComputedStyle(document.querySelector(`#${id}`));
      return {
        width: cs.width,
        height: cs.height,
        radius: cs.borderRadius,
        animation: cs.animationName,
        duration: cs.animationDuration,
        display: cs.display,
      };
    };
    return { text: get("sk-text"), circle: get("sk-circle"), rect: get("sk-rect") };
  });
  // text：整行 1em 高
  expect(parseFloat(state.text.height)).toBeCloseTo(14, 0);
  expect(parseFloat(state.text.width)).toBeGreaterThan(100);
  // circle：正圆 inline-block
  expect(state.circle.radius).toBe("50%");
  expect(state.circle.display).toBe("inline-block");
  expect(Math.abs(parseFloat(state.circle.width) - parseFloat(state.circle.height))).toBeLessThan(1);
  // rect：60px 高块
  expect(parseFloat(state.rect.height)).toBeCloseTo(60, 0);
  // 呼吸动画在跑
  expect(state.text.animation).toContain("st-skeleton-pulse");
  expect(parseFloat(state.text.duration)).toBeGreaterThan(0.5);
});

test("skeleton：宽高圆角被原生 CSS 直接覆盖", async ({ page }) => {
  const state = await page.evaluate(() => {
    const cs = getComputedStyle(document.querySelector("#sk-custom"));
    return { width: cs.width, height: cs.height, radius: cs.borderRadius };
  });
  expect(state).toEqual({ width: "120px", height: "24px", radius: "12px" });
});

test("skeleton：prefers-reduced-motion 下动画静止", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await page.waitForFunction(() => document.querySelector("#sk-text")?.shadowRoot, { timeout: 20_000 });
  const duration = await page.evaluate(() =>
    parseFloat(getComputedStyle(document.querySelector("#sk-text")).animationDuration)
  );
  expect(duration).toBeLessThan(0.001);
});

test("skeleton：shape 属性动态切换", async ({ page }) => {
  await page.evaluate(() => document.querySelector("#sk-text").setAttribute("shape", "circle"));
  await page.waitForTimeout(150);
  const state = await page.evaluate(() => {
    const cs = getComputedStyle(document.querySelector("#sk-text"));
    return { radius: cs.borderRadius, display: cs.display };
  });
  expect(state.radius).toBe("50%");
  expect(state.display).toBe("inline-block");
});
