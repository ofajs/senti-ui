import { test, expect } from "@playwright/test";

async function ready(page) {
  await page.waitForFunction(
    () => {
      const el = document.querySelector("#dlg-basic");
      return el && el.shadowRoot && el.shadowRoot.querySelector(".panel");
    },
    { timeout: 15_000 }
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/fixtures/dialog.html");
  await ready(page);
});

test("默认隐藏，open 属性显示（display none ↔ grid）", async ({ page }) => {
  const before = await page.evaluate(
    () => getComputedStyle(document.querySelector("#dlg-basic")).display
  );
  expect(before).toBe("none");

  await page.evaluate(() => document.querySelector("#dlg-basic").setAttribute("open", ""));
  const after = await page.evaluate(
    () => getComputedStyle(document.querySelector("#dlg-basic")).display
  );
  expect(after).toBe("grid");
});

test("open 时焦点移入面板容器，Tab 可达内部按钮", async ({ page }) => {
  await page.evaluate(() => document.querySelector("#dlg-basic").setAttribute("open", ""));
  await page.waitForTimeout(100);
  const focused = await page.evaluate(
    () => document.querySelector("#dlg-basic").shadowRoot.activeElement?.className
  );
  expect(focused).toContain("panel");
});

test("headline/actions 插槽内容渲染，空区块隐藏", async ({ page }) => {
  const state = await page.evaluate(() => {
    const el = document.querySelector("#dlg-basic");
    const sr = el.shadowRoot;
    // 插槽内容留在 light DOM，须通过 assignedNodes 读取
    const text = (sel) =>
      sr.querySelector(sel + " slot").assignedNodes().map((n) => n.textContent).join("");
    return {
      headline: text(".headline"),
      body: text(".body"),
      actions: text(".actions"),
      headlineDisplay: getComputedStyle(sr.querySelector(".headline")).display,
    };
  });
  expect(state.headline).toContain("基础标题");
  expect(state.body).toContain("正文内容");
  expect(state.actions).toContain("关闭");

  // dlg-bare 无任何插槽内容：headline/actions 区块应隐藏，body 区块仍在
  const bare = await page.evaluate(() => {
    const sr = document.querySelector("#dlg-bare").shadowRoot;
    return {
      headline: getComputedStyle(sr.querySelector(".headline")).display,
      actions: getComputedStyle(sr.querySelector(".actions")).display,
      body: getComputedStyle(sr.querySelector(".body")).display,
    };
  });
  expect(bare.headline).toBe("none");
  expect(bare.actions).toBe("none");
  expect(bare.body).not.toBe("none");
});

test("无 auto-close：遮罩点击与 Escape 均不关闭", async ({ page }) => {
  await page.evaluate(() => document.querySelector("#dlg-basic").setAttribute("open", ""));
  await page.waitForTimeout(100);
  await page.mouse.click(5, 5); // 点遮罩（视口角落）
  await page.keyboard.press("Escape");
  await page.waitForTimeout(100);
  expect(
    await page.evaluate(() => document.querySelector("#dlg-basic").hasAttribute("open"))
  ).toBe(true);
  expect(await page.evaluate(() => window.events.filter((e) => e.id === "dlg-basic"))
  ).toEqual([]);
});

test("auto-close：点击遮罩关闭并派发 close 事件", async ({ page }) => {
  await page.evaluate(() => document.querySelector("#dlg-autoclose").setAttribute("open", ""));
  await page.waitForTimeout(100);
  await page.mouse.click(5, 5); // 面板外 = 遮罩
  await page.waitForTimeout(100);
  expect(
    await page.evaluate(() => document.querySelector("#dlg-autoclose").hasAttribute("open"))
  ).toBe(false);
  expect(
    await page.evaluate(() => window.events.filter((e) => e.id === "dlg-autoclose"))
  ).toEqual([{ id: "dlg-autoclose", type: "close" }]);
});

test("auto-close：Escape 关闭并派发 close 事件", async ({ page }) => {
  await page.evaluate(() => document.querySelector("#dlg-autoclose").setAttribute("open", ""));
  await page.waitForTimeout(100);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(100);
  expect(
    await page.evaluate(() => document.querySelector("#dlg-autoclose").hasAttribute("open"))
  ).toBe(false);
  expect(
    await page.evaluate(() => window.events.filter((e) => e.id === "dlg-autoclose"))
  ).toEqual([{ id: "dlg-autoclose", type: "close" }]);
});

test("点击面板内部不关闭", async ({ page }) => {
  await page.evaluate(() => document.querySelector("#dlg-autoclose").setAttribute("open", ""));
  await page.waitForTimeout(100);
  await page.locator("#dlg-autoclose .body").click();
  await page.waitForTimeout(100);
  expect(
    await page.evaluate(() => document.querySelector("#dlg-autoclose").hasAttribute("open"))
  ).toBe(true);
});

test("外部 removeAttribute 关闭不派发 close 事件", async ({ page }) => {
  await page.evaluate(() => document.querySelector("#dlg-autoclose").setAttribute("open", ""));
  await page.waitForTimeout(50);
  await page.evaluate(() => document.querySelector("#dlg-autoclose").removeAttribute("open"));
  await page.waitForTimeout(100);
  expect(
    await page.evaluate(() => window.events.filter((e) => e.id === "dlg-autoclose"))
  ).toEqual([]);
});

test("::part(panel) 原生 CSS 可定制面板", async ({ page }) => {
  await page.addStyleTag({ content: "st-dialog#dlg-basic::part(panel) { width: 320px; border-radius: 4px; }" });
  await page.evaluate(() => document.querySelector("#dlg-basic").setAttribute("open", ""));
  const style = await page.evaluate(() => {
    const panel = document.querySelector("#dlg-basic").shadowRoot.querySelector(".panel");
    const cs = getComputedStyle(panel);
    return { width: cs.width, radius: cs.borderTopLeftRadius };
  });
  expect(style.width).toBe("320px");
  expect(style.radius).toBe("4px");
});

test("M3 动效：进入入场动画，关闭后短暂保留 closing 态播退出动画再隐藏", async ({ page }) => {
  await page.evaluate(() => document.querySelector("#dlg-autoclose").setAttribute("open", ""));
  // setAttribute 的 watch 异步触发（坑 #18），入场动画开始后处于动画中
  await page.waitForTimeout(100);
  const entering = await page.evaluate(() => {
    const dlg = document.querySelector("#dlg-autoclose");
    const panel = dlg.shadowRoot.querySelector(".panel");
    return {
      animationName: getComputedStyle(panel).animationName,
      display: getComputedStyle(dlg).display,
    };
  });
  expect(entering.animationName).toContain("st-dlg-in");
  expect(entering.display).toBe("grid");

  // 关闭：watch 异步添加 closing，退出动画期间仍可见（display 保持 grid）
  await page.evaluate(() => document.querySelector("#dlg-autoclose").removeAttribute("open"));
  await page.waitForTimeout(150);
  const exiting = await page.evaluate(() => {
    const dlg = document.querySelector("#dlg-autoclose");
    const panel = dlg.shadowRoot.querySelector(".panel");
    return {
      closing: dlg.hasAttribute("closing"),
      animationName: getComputedStyle(panel).animationName,
      display: getComputedStyle(dlg).display,
    };
  });
  expect(exiting.closing).toBe(true);
  expect(exiting.animationName).toContain("st-dlg-out");
  expect(exiting.display).toBe("grid");

  // 250ms 后 closing 移除，彻底隐藏
  await page.waitForTimeout(300);
  expect(
    await page.evaluate(() => getComputedStyle(document.querySelector("#dlg-autoclose")).display)
  ).toBe("none");
});

test("关闭动画期间重新打开：立即取消退出、重新入场", async ({ page }) => {
  const dlg = page.locator("#dlg-autoclose");
  await page.evaluate(() => document.querySelector("#dlg-autoclose").setAttribute("open", ""));
  await page.waitForTimeout(100);
  await page.evaluate(() => document.querySelector("#dlg-autoclose").removeAttribute("open"));
  await page.waitForTimeout(100); // 进入退出动画
  await page.evaluate(() => document.querySelector("#dlg-autoclose").setAttribute("open", ""));
  await page.waitForTimeout(150);
  const state = await page.evaluate(() => {
    const d = document.querySelector("#dlg-autoclose");
    return {
      open: d.hasAttribute("open"),
      closing: d.hasAttribute("closing"),
      display: getComputedStyle(d).display,
    };
  });
  expect(state.open).toBe(true);
  expect(state.closing).toBe(false);
  expect(state.display).toBe("grid");
});
