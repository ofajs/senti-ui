import { test, expect } from "@playwright/test";

async function ready(page, selector) {
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      // select 在 ready 里设置 ele.tabIndex = 0（宿主可聚焦），以此作为升级完成标志
      return el && el.shadowRoot && el.tabIndex === 0;
    },
    selector,
    { timeout: 15_000 }
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/fixtures/select.html");
  await ready(page, "#sel-basic");
});

test("placeholder 生效：未选中时显示占位文本", async ({ page }) => {
  const text = await page.evaluate(() => {
    const el = document.querySelector("#sel-basic");
    return el.shadowRoot.textContent;
  });
  expect(text).toContain("请选择");
});

test("default-value 初始化运行时选中值", async ({ page }) => {
  expect(await page.evaluate(() => document.querySelector("#sel-default").value)).toBe("banana");
  const text = await page.evaluate(() => document.querySelector("#sel-default").shadowRoot.textContent);
  expect(text).toContain("乙");
});

test("点击打开弹层并选择：value 更新、change 事件触发", async ({ page }) => {
  await page.locator("#sel-basic").click();
  // 弹层在 shadow 内渲染为 .opt 项（light DOM 的 <option> 只是数据源）
  await page.locator("#sel-basic .opt").filter({ hasText: "香蕉" }).click();

  expect(await page.evaluate(() => document.querySelector("#sel-basic").value)).toBe("banana");
  const events = await page.evaluate(() =>
    window.events.filter((e) => e.id === "sel-basic" && e.type === "change")
  );
  expect(events).toHaveLength(1);
  expect(events[0].value).toBe("banana");
});

test("键盘交互：Enter 打开、↓ 移动、Enter 选中", async ({ page }) => {
  await page.locator("#sel-basic").focus();
  await page.keyboard.press("Enter"); // 打开列表，键盘激活项初始在第一项（apple）
  await page.keyboard.press("ArrowDown"); // 移动到第二项（banana）
  await page.keyboard.press("Enter"); // 选中

  expect(await page.evaluate(() => document.querySelector("#sel-basic").value)).toBe("banana");
  const events = await page.evaluate(() =>
    window.events.filter((e) => e.id === "sel-basic" && e.type === "change")
  );
  expect(events).toHaveLength(1);
  expect(events[0].value).toBe("banana");
});

test("Escape 关闭弹层不选中，点击外部关闭", async ({ page }) => {
  await page.locator("#sel-basic").click();
  await page.keyboard.press("Escape");
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => document.querySelector("#sel-basic").value)).toBe("");

  await page.locator("#sel-basic").click();
  await page.mouse.click(5, 5); // 点击组件外部
  await page.waitForTimeout(100);
  const events = await page.evaluate(() =>
    window.events.filter((e) => e.id === "sel-basic" && e.type === "change")
  );
  expect(events).toHaveLength(0);
});

test("JS 写 el.value 更新选中（不派发 change）", async ({ page }) => {
  await page.evaluate(() => {
    document.querySelector("#sel-basic").value = "cherry";
  });
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => document.querySelector("#sel-basic").value)).toBe("cherry");
  const text = await page.evaluate(() => document.querySelector("#sel-basic").shadowRoot.textContent);
  expect(text).toContain("樱桃");
  const events = await page.evaluate(() =>
    window.events.filter((e) => e.id === "sel-basic" && e.type === "change")
  );
  expect(events).toHaveLength(0);
});

test("disabled 属性生效：无法打开弹层", async ({ page }) => {
  const opacity = await page.evaluate(() => getComputedStyle(document.querySelector("#sel-disabled")).opacity);
  expect(parseFloat(opacity)).toBeCloseTo(0.38, 2);

  await page.locator("#sel-disabled").click({ force: true }).catch(() => {});
  await page.waitForTimeout(200);
  // disabled 阻断交互：不允许出现 change（focusin 是 force click 聚焦宿主所致，不算交互成功）
  const events = await page.evaluate(() =>
    window.events.filter((e) => e.id === "sel-disabled" && e.type === "change")
  );
  expect(events).toEqual([]);
});

test("下拉翻转：贴近视口底部时向上弹出", async ({ page }) => {
  const sel = page.locator("#sel-bottom");
  await sel.click();
  await page.waitForTimeout(300);
  const state = await page.evaluate(() => {
    const el = document.querySelector("#sel-bottom");
    const box = el.shadowRoot.querySelector("#st-listbox").getBoundingClientRect();
    const host = el.getBoundingClientRect();
    return {
      dropUp: el.hasAttribute("drop-up"),
      listboxAboveHost: Math.round(box.bottom) <= Math.round(host.top) + 2,
      visible: box.height > 0,
    };
  });
  expect(state.dropUp).toBe(true);
  expect(state.listboxAboveHost).toBe(true);
  expect(state.visible).toBe(true);
});

test("下拉动画：进入有入场动画，关闭先播退出过渡再隐藏", async ({ page }) => {
  const sel = page.locator("#sel-basic");
  await sel.click();
  await page.waitForTimeout(100);
  const entering = await page.evaluate(() => {
    const el = document.querySelector("#sel-basic");
    return getComputedStyle(el.shadowRoot.querySelector("#st-listbox")).animationName;
  });
  expect(entering).toContain("st-select-in");

  // 关闭：closing 过渡态期间仍可见
  await page.keyboard.press("Escape");
  await page.waitForTimeout(60);
  const exiting = await page.evaluate(() => {
    const el = document.querySelector("#sel-basic");
    return { closing: el.hasAttribute("closing"), display: getComputedStyle(el.shadowRoot.querySelector("#st-listbox")).display };
  });
  expect(exiting.closing).toBe(true);
  expect(exiting.display).toBe("block");

  // 180ms 后彻底隐藏
  await page.waitForTimeout(300);
  expect(
    await page.evaluate(
      () => getComputedStyle(document.querySelector("#sel-basic").shadowRoot.querySelector("#st-listbox")).display
    )
  ).toBe("none");
});
