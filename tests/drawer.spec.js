import { test, expect } from "@playwright/test";

async function ready(page) {
  await page.waitForFunction(
    () => {
      const el = document.querySelector("#drw-left");
      return el && el.shadowRoot && el.shadowRoot.querySelector(".panel");
    },
    { timeout: 15_000 }
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/fixtures/drawer.html");
  await ready(page);
});

const open = (page, id) =>
  page.evaluate((sel) => document.querySelector(sel).setAttribute("open", ""), id);
const close = (page, id) =>
  page.evaluate((sel) => document.querySelector(sel).removeAttribute("open"), id);

test("默认隐藏，open 后可见；关闭后播完滑出动画再隐藏", async ({ page }) => {
  expect(
    await page.evaluate(() => getComputedStyle(document.querySelector("#drw-left")).visibility)
  ).toBe("hidden");

  await open(page, "#drw-left");
  await page.waitForTimeout(350);
  const shown = await page.evaluate(() => {
    const el = document.querySelector("#drw-left");
    const panel = el.shadowRoot.querySelector(".panel").getBoundingClientRect();
    return {
      visibility: getComputedStyle(el).visibility,
      left: panel.left,
      width: panel.width,
      height: panel.height,
      viewportHeight: innerHeight,
      transform: getComputedStyle(el.shadowRoot.querySelector(".panel")).transform,
    };
  });
  expect(shown.visibility).toBe("visible");
  expect(shown.transform).toBe("none");
  expect(shown.left).toBe(0);
  expect(shown.width).toBeGreaterThan(0);
  expect(shown.height).toBe(shown.viewportHeight);

  await close(page, "#drw-left");
  await page.waitForTimeout(80);
  // 滑出过程中仍可见
  expect(
    await page.evaluate(() => getComputedStyle(document.querySelector("#drw-left")).visibility)
  ).toBe("visible");
  await page.waitForTimeout(300);
  expect(
    await page.evaluate(() => getComputedStyle(document.querySelector("#drw-left")).visibility)
  ).toBe("hidden");
});

test("side=right 时面板贴右侧，内侧圆角镜像", async ({ page }) => {
  await open(page, "#drw-right");
  await page.waitForTimeout(350);
  const state = await page.evaluate(() => {
    const el = document.querySelector("#drw-right");
    const panel = el.shadowRoot.querySelector(".panel");
    const rect = panel.getBoundingClientRect();
    const cs = getComputedStyle(panel);
    return {
      right: rect.right,
      viewportWidth: innerWidth,
      topLeftRadius: cs.borderTopLeftRadius,
      topRightRadius: cs.borderTopRightRadius,
    };
  });
  expect(state.right).toBe(state.viewportWidth);
  expect(parseFloat(state.topLeftRadius)).toBeGreaterThan(0);
  expect(parseFloat(state.topRightRadius)).toBe(0);
});

test("headline / actions 插槽渲染，空区块隐藏", async ({ page }) => {
  const state = await page.evaluate(() => {
    const el = document.querySelector("#drw-left");
    const sr = el.shadowRoot;
    const text = (sel) => sr.querySelector(sel + " slot").assignedNodes().map((n) => n.textContent).join("");
    return {
      headline: text(".headline"),
      body: text(".body"),
      actions: text(".actions"),
      headlineDisplay: getComputedStyle(sr.querySelector(".headline")).display,
      bareHeadline: getComputedStyle(
        document.querySelector("#drw-bare").shadowRoot.querySelector(".headline")
      ).display,
      bareActions: getComputedStyle(
        document.querySelector("#drw-bare").shadowRoot.querySelector(".actions")
      ).display,
    };
  });
  expect(state.headline).toContain("左抽屉");
  expect(state.body).toContain("正文内容");
  expect(state.actions).toContain("关闭");
  expect(state.headlineDisplay).not.toBe("none");
  expect(state.bareHeadline).toBe("none");
  expect(state.bareActions).toBe("none");
});

test("打开时焦点移入面板，Tab 在抽屉内循环", async ({ page }) => {
  await open(page, "#drw-auto");
  await page.waitForTimeout(100);
  expect(
    await page.evaluate(() => document.querySelector("#drw-auto").shadowRoot.activeElement?.className)
  ).toContain("panel");

  const inDrawer = () =>
    page.evaluate(() => {
      const el = document.querySelector("#drw-auto");
      let active = document.activeElement;
      while (active && active.shadowRoot && active.shadowRoot.activeElement) {
        active = active.shadowRoot.activeElement;
      }
      let node = active;
      let inDrawer = false;
      while (node) {
        if (node === el) { inDrawer = true; break; }
        node = node.parentNode || node.host;
      }
      return { inDrawer, tag: active?.tagName };
    });
  for (let i = 0; i < 3; i++) {
    await page.keyboard.press("Tab");
    expect((await inDrawer()).inDrawer).toBe(true);
  }
});

test("无 auto-close：遮罩点击与 Escape 均不关闭", async ({ page }) => {
  await open(page, "#drw-left");
  await page.waitForTimeout(350);
  await page.evaluate(() =>
    document.querySelector("#drw-left").shadowRoot.querySelector(".scrim").click()
  );
  await page.keyboard.press("Escape");
  await page.waitForTimeout(100);
  expect(
    await page.evaluate(() => document.querySelector("#drw-left").hasAttribute("open"))
  ).toBe(true);
});

test("auto-close：遮罩关闭并派发 close，外部关闭不派发，焦点归还 opener", async ({ page }) => {
  await open(page, "#drw-auto");
  await page.waitForTimeout(100);
  await page.evaluate(() =>
    document.querySelector("#drw-auto").shadowRoot.querySelector(".scrim").click()
  );
  await page.waitForTimeout(100);
  expect(
    await page.evaluate(() => document.querySelector("#drw-auto").hasAttribute("open"))
  ).toBe(false);
  expect(await page.evaluate(() => window.events)).toContainEqual({
    id: "drw-auto",
    type: "close",
  });

  // 外部关闭不派发 close
  await open(page, "#drw-auto");
  await page.waitForTimeout(100);
  await close(page, "#drw-auto");
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.events.filter((e) => e.id === "drw-auto"))).toHaveLength(1);

  // 焦点归还打开它的元素
  await page.evaluate(() => {
    document.querySelector("#opener").focus();
    document.querySelector("#drw-auto").setAttribute("open", "");
  });
  await page.waitForTimeout(100);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => document.activeElement.id)).toBe("opener");
});

test("Escape 只关最上层：drawer 与 dialog 共用模态栈", async ({ page }) => {
  await open(page, "#drw-auto");
  await page.waitForTimeout(100);
  await open(page, "#dlg");
  await page.waitForTimeout(100);

  await page.keyboard.press("Escape");
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => document.querySelector("#dlg").hasAttribute("open"))).toBe(false);
  expect(
    await page.evaluate(() => document.querySelector("#drw-auto").hasAttribute("open"))
  ).toBe(true);

  await page.keyboard.press("Escape");
  await page.waitForTimeout(100);
  expect(
    await page.evaluate(() => document.querySelector("#drw-auto").hasAttribute("open"))
  ).toBe(false);
});

test("打开时锁定背景滚动，关闭后恢复", async ({ page }) => {
  await open(page, "#drw-auto");
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
});

test("点击面板内部不关闭", async ({ page }) => {
  await open(page, "#drw-auto");
  await page.waitForTimeout(100);
  await page.evaluate(() =>
    document.querySelector("#drw-auto").shadowRoot.querySelector(".panel").click()
  );
  await page.waitForTimeout(100);
  expect(
    await page.evaluate(() => document.querySelector("#drw-auto").hasAttribute("open"))
  ).toBe(true);
});
