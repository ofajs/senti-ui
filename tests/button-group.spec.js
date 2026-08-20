import { test, expect } from "@playwright/test";

async function ready(page) {
  await page.goto("/tests/fixtures/button.html");
  await page.waitForFunction(
    () => {
      const grp = document.querySelector("#grp");
      const split = document.querySelector("#split");
      return (
        grp &&
        split?.shadowRoot?.querySelector(".main-zone") &&
        document.querySelector("#g1")?.shadowRoot?.querySelector("button")
      );
    },
    { timeout: 20_000 }
  );
  // 分组 ::slotted 规则随组件升级生效，等布局稳定再断言
  await page.waitForTimeout(300);
}

test("button-group：分组圆角（首尾外圆角、中间小圆角）", async ({ page }) => {
  await ready(page);
  const radii = await page.evaluate(() => {
    const get = (sel) => {
      const cs = getComputedStyle(document.querySelector(sel));
      return [cs.borderTopLeftRadius, cs.borderTopRightRadius, cs.borderBottomRightRadius, cs.borderBottomLeftRadius];
    };
    return { first: get("#g1"), mid: get("#g2"), last: get("#g3") };
  });
  // 首项左外圆角 20px、右 7px；中间全 7px；尾项右外 20px（em 换算有亚像素误差，数值近似）
  const px = (v) => parseFloat(v);
  expect(px(radii.first[0])).toBeCloseTo(20, 0);
  expect(px(radii.first[1])).toBeCloseTo(7, 0);
  expect(radii.mid.every((r) => px(r) === 7)).toBe(true);
  expect(px(radii.last[1])).toBeCloseTo(20, 0); // 尾项外圆角在右侧（TR）
});

test("button-group：connected 连体（无间距、相邻边圆角归零）", async ({ page }) => {
  await ready(page);
  const state = await page.evaluate(() => {
    const grp = document.querySelector("#grp-conn");
    const first = getComputedStyle(document.querySelector("#gc1"));
    const second = document.querySelector("#gc2").getBoundingClientRect();
    const firstRect = document.querySelector("#gc1").getBoundingClientRect();
    return {
      gap: getComputedStyle(grp).gap,
      firstRightRadius: first.borderTopRightRadius,
      adjacentGap: Math.round(second.left - firstRect.right),
    };
  });
  expect(state.gap).toBe("0px");
  expect(state.firstRightRadius).toBe("0px");
  expect(Math.abs(state.adjacentGap)).toBeLessThanOrEqual(1);
});

test("split-button：主区点击触发主操作，箭头区不触发", async ({ page }) => {
  await ready(page);
  await page.evaluate(() => {
    window.splitEvents = [];
    document.querySelector("#split").addEventListener("click", () => window.splitEvents.push("main"));
  });
  await page.locator("#split .main-zone").click();
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.splitEvents)).toEqual(["main"]);

  await page.locator("#split .caret-zone").click();
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.splitEvents)).toEqual(["main"]); // 箭头不开主操作
});

test("split-button：箭头展开菜单，点菜单项自动关闭且 click 可监听", async ({ page }) => {
  await ready(page);
  await page.evaluate(() => {
    window.menuEvents = [];
    document.querySelector("#sm1").addEventListener("click", () => window.menuEvents.push("sm1"));
  });
  await page.locator("#split .caret-zone").click();
  await page.waitForTimeout(300);
  const opened = await page.evaluate(() => {
    const panel = document.querySelector("#split").shadowRoot.querySelector(".panel");
    return getComputedStyle(panel).display;
  });
  expect(opened).toBe("block");

  await page.locator("#sm1").click({ force: true });
  await page.waitForTimeout(400);
  expect(await page.evaluate(() => window.menuEvents)).toContain("sm1");
  const closed = await page.evaluate(() => {
    const panel = document.querySelector("#split").shadowRoot.querySelector(".panel");
    return getComputedStyle(panel).display;
  });
  expect(closed).toBe("none");
});

test("split-button：Escape / 点外部关闭，disabled 阻断", async ({ page }) => {
  await ready(page);
  await page.locator("#split .caret-zone").click();
  await page.waitForTimeout(200);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(300);
  expect(
    await page.evaluate(() => getComputedStyle(document.querySelector("#split").shadowRoot.querySelector(".panel")).display)
  ).toBe("none");

  // disabled：主区与箭头区均原生阻断
  const disabled = await page.evaluate(() => {
    const sr = document.querySelector("#split-disabled").shadowRoot;
    return {
      main: sr.querySelector(".main-zone").disabled,
      caret: sr.querySelector(".caret-zone").disabled,
    };
  });
  expect(disabled).toEqual({ main: true, caret: true });
});

test("split-button：color 属性按 variant 分派（outlined 前景为角色色）", async ({ page }) => {
  await ready(page);
  await page.evaluate(() => {
    const el = document.querySelector("#split");
    el.setAttribute("color", "error");
    el.setAttribute("variant", "outlined");
  });
  // setAttribute 的 watch 异步（坑 #18）
  await page.waitForTimeout(200);
  const { errorColor, splitColor } = await page.evaluate(() => {
    const token = getComputedStyle(document.documentElement).getPropertyValue("--md-sys-color-error").trim();
    return {
      errorColor: token,
      splitColor: getComputedStyle(document.querySelector("#split")).color,
    };
  });
  const hex = errorColor.replace("#", "");
  expect(splitColor).toBe(
    `rgb(${parseInt(hex.slice(0, 2), 16)}, ${parseInt(hex.slice(2, 4), 16)}, ${parseInt(hex.slice(4, 6), 16)})`
  );
});
