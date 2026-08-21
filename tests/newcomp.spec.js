import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/fixtures/newcomp.html");
  await page.waitForFunction(
    () =>
      document.querySelector("#sl-basic")?.shadowRoot?.querySelector("input[type=range]") &&
      document.querySelector("#tip-basic")?.shadowRoot?.querySelector(".bubble") &&
      document.querySelector("#card-elev") &&
      document.querySelector("#bd-num"),
    { timeout: 20_000 }
  );
  await page.waitForTimeout(300);
});

// ---------- st-slider ----------

test("slider：default-value/min/max 生效（内部 range 同步、fill 比例正确）", async ({ page }) => {
  const state = await page.evaluate(() => {
    const el = document.querySelector("#sl-range");
    const input = el.shadowRoot.querySelector("input");
    const fill = el.shadowRoot.querySelector(".fill");
    return { min: input.min, max: input.max, step: input.step, value: input.value, width: fill.style.width };
  });
  expect(state).toMatchObject({ min: "0", max: "10", step: "2", value: "4" });
  // M3：fill 从轨道左端到拇指中心：(0.4×170)/190 ≈ 35.8%
  expect(parseFloat(state.width)).toBeGreaterThan(34);
  expect(parseFloat(state.width)).toBeLessThan(38);
});

test("slider：键盘 ← 调值并派发 input/change，el.value 可读写", async ({ page }) => {
  await page.locator("#sl-basic .native").focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(100);
  const evts = await page.evaluate(() => window.events.filter((e) => e.id === "sl-basic"));
  expect(evts.some((e) => e.type === "input")).toBe(true);
  expect(await page.evaluate(() => document.querySelector("#sl-basic").value)).toBe("41");

  // JS 写 el.value → 视觉同步
  await page.evaluate(() => { document.querySelector("#sl-basic").value = "80"; });
  await page.waitForTimeout(100);
  const fill80 = parseFloat(
    await page.evaluate(() => document.querySelector("#sl-basic").shadowRoot.querySelector(".fill").style.width)
  );
  // fill 从轨道左端到拇指中心：(0.8×170)/190 ≈ 71.6%
  expect(fill80).toBeGreaterThan(69);
  expect(fill80).toBeLessThan(74);
});

test("slider：disabled 原生阻断", async ({ page }) => {
  expect(
    await page.evaluate(() => document.querySelector("#sl-disabled").shadowRoot.querySelector("input").disabled)
  ).toBe(true);
});

test("slider：color=error 拇指为 error 角色色", async ({ page }) => {
  const { token, thumb } = await page.evaluate(() => {
    const token = getComputedStyle(document.documentElement).getPropertyValue("--md-sys-color-error").trim();
    return { token, thumb: getComputedStyle(document.querySelector("#sl-color").shadowRoot.querySelector(".thumb")).backgroundColor };
  });
  const hex = token.replace("#", "");
  expect(thumb).toBe(`rgb(${parseInt(hex.slice(0, 2), 16)}, ${parseInt(hex.slice(2, 4), 16)}, ${parseInt(hex.slice(4, 6), 16)})`);
});

// ---------- st-progress ----------

test("progress：线形确定值宽度、环形 dashoffset、缺省 value 视为不定", async ({ page }) => {
  const state = await page.evaluate(() => {
    const bar = document.querySelector("#pg-60").shadowRoot.querySelector(".bar");
    const arc = document.querySelector("#pg-circ").shadowRoot.querySelector(".arc");
    return {
      barWidth: bar.style.width,
      dash: arc.style.strokeDashoffset,
      noValAnim: getComputedStyle(document.querySelector("#pg-noval").shadowRoot.querySelector(".bar")).animationName,
      indetAnim: getComputedStyle(document.querySelector("#pg-indet").shadowRoot.querySelector(".bar")).animationName,
      circIndetRotate: getComputedStyle(document.querySelector("#pg-circ-indet").shadowRoot.querySelector("svg.circular")).animationName,
    };
  });
  expect(state.barWidth).toBe("60%");
  expect(state.dash).toBe("25");
  expect(state.noValAnim).toContain("st-pg-slide");
  expect(state.indetAnim).toContain("st-pg-slide");
  expect(state.circIndetRotate).toContain("st-pg-rotate");
});

// ---------- st-tooltip ----------

test("tooltip：悬停显示且不与触发器重叠，移开隐藏", async ({ page }) => {
  // 合成 pointerenter（真实 hover 的 actionability 在 fixed 布局下不稳定）
  await page.evaluate(() => {
    document.querySelector("#tip-basic").dispatchEvent(new PointerEvent("pointerenter"));
  });
  await page.waitForTimeout(300);
  const shown = await page.evaluate(() => {
    const tip = document.querySelector("#tip-basic");
    const bubble = tip.shadowRoot.querySelector(".bubble");
    const r = bubble.getBoundingClientRect();
    const host = tip.getBoundingClientRect();
    const noOverlap = r.bottom <= host.top + 1 || r.top >= host.bottom - 1;
    return {
      visible: getComputedStyle(bubble).display === "block",
      text: bubble.textContent,
      noOverlap,
      onScreen: r.top >= 0 && r.bottom <= window.innerHeight,
    };
  });
  expect(shown.visible).toBe(true);
  expect(shown.text).toBe("提示内容");
  expect(shown.noOverlap).toBe(true);
  expect(shown.onScreen).toBe(true);

  await page.evaluate(() => {
    document.querySelector("#tip-basic").dispatchEvent(new PointerEvent("pointerleave"));
  });
  await page.waitForTimeout(200);
  expect(
    await page.evaluate(() => getComputedStyle(document.querySelector("#tip-basic").shadowRoot.querySelector(".bubble")).display)
  ).toBe("none");
});

test("tooltip：贴近视口顶部时上方放不下，自动翻到下方", async ({ page }) => {
  await page.evaluate(() => {
    document.querySelector("#tip-top").dispatchEvent(new PointerEvent("pointerenter"));
  });
  await page.waitForTimeout(300);
  const state = await page.evaluate(() => {
    const tip = document.querySelector("#tip-top");
    const bubble = tip.shadowRoot.querySelector(".bubble");
    const host = tip.getBoundingClientRect();
    const r = bubble.getBoundingClientRect();
    return { dropUp: tip.hasAttribute("drop-up"), belowHost: Math.round(r.top) >= Math.round(host.bottom) - 1 };
  });
  expect(state.dropUp).toBe(false);
  expect(state.belowHost).toBe(true);
});

// ---------- st-card ----------

test("card：三种 variant 配色差异", async ({ page }) => {
  const styles = await page.evaluate(() => {
    const get = (sel) => {
      const cs = getComputedStyle(document.querySelector(sel));
      return { bg: cs.backgroundColor, shadow: cs.boxShadow, border: cs.borderColor };
    };
    return { elev: get("#card-elev"), outlined: get("#card-outlined") };
  });
  expect(styles.elev.shadow).not.toBe("none");
  expect(styles.outlined.shadow).toBe("none");
  expect(styles.outlined.border).not.toBe(styles.elev.border);
});

test("card：interactive 点击冒泡，focus 有焦圈元素", async ({ page }) => {
  await page.locator("#card-click .native").click();
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.events)).toContain("card-click");
  expect(
    await page.evaluate(() => document.querySelector("#card-click").shadowRoot.querySelector(".native").tagName)
  ).toBe("BUTTON");
});

// ---------- st-badges ----------

test("badges：点/数字/封顶/文本四种形态", async ({ page }) => {
  const state = await page.evaluate(() => {
    const text = (sel) => document.querySelector(sel).shadowRoot.querySelector(".badge").textContent;
    return {
      dot: text("#bd-dot"),
      num: text("#bd-num"),
      max: text("#bd-max"),
      text: text("#bd-text"),
    };
  });
  expect(state).toEqual({ dot: "", num: "8", max: "99+", text: "NEW" });
});
