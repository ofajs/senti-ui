import { test, expect } from "@playwright/test";

async function ready(page) {
  await page.waitForFunction(
    () => {
      const li = document.querySelector("#li-btn");
      const menu = document.querySelector("#menu");
      const tabs = document.querySelector("#tabs");
      const nav = document.querySelector("#nav");
      return (
        li?.shadowRoot?.querySelector(".native") &&
        menu?.shadowRoot?.querySelector(".panel") &&
        tabs?.shadowRoot?.querySelector(".indicator") &&
        nav?.shadowRoot?.querySelector(".active-bg")
      );
    },
    { timeout: 15_000 }
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/fixtures/collection.html");
  await ready(page);
});

// ---------- st-list / st-list-item ----------

test("list-item：button 项点击派发 click，disabled 项不派发", async ({ page }) => {
  await page.locator("#li-btn").click();
  expect(await page.evaluate(() => window.events)).toEqual(["li-btn"]);

  // plain 项点击是普通 DOM 冒泡（无交互语义）；disabled 项原生 button 阻断、无 click
  await page.locator("#li-disabled").click({ force: true }).catch(() => {});
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.events.filter((e) => e === "li-btn"))).toHaveLength(1);
  expect(await page.evaluate(() => window.events)).not.toContain("li-disabled");
});

test("list-item：collapsible 点击切换 expanded，sublist 高度跟随", async ({ page }) => {
  // 点头部区域（item 顶部），展开后中部已被子列表占据
  const box = await page.locator("#li-fold").boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + 15);
  expect(
    await page.evaluate(() => document.querySelector("#li-fold").hasAttribute("expanded"))
  ).toBe(true);
  await page.waitForTimeout(500);
  const h = await page.evaluate(() => {
    const item = document.querySelector("#li-fold");
    return item.getBoundingClientRect().height;
  });
  expect(h).toBeGreaterThan(60); // 展开后包含子项

  await page.mouse.click(box.x + box.width / 2, box.y + 15);
  await page.waitForTimeout(500);
  expect(
    await page.evaluate(() => document.querySelector("#li-fold").hasAttribute("expanded"))
  ).toBe(false);
  // 折叠项点击不派发 click
  expect(await page.evaluate(() => window.events.filter((e) => e === "li-fold"))).toEqual([]);
});

// ---------- st-menu ----------

test("menu：点击 trigger 打开面板，open 事件派发", async ({ page }) => {
  await page.locator("#menu-trigger").click();
  await page.waitForTimeout(100);
  const visible = await page.evaluate(() => {
    const panel = document.querySelector("#menu").shadowRoot.querySelector(".panel");
    return getComputedStyle(panel).display;
  });
  expect(visible).toBe("block");
  expect(await page.evaluate(() => window.events)).toContain("menu-open");
});

test("menu：点击菜单项后自动关闭，close 事件派发且 item click 冒泡", async ({ page }) => {
  await page.locator("#menu-trigger").click();
  await page.waitForTimeout(300);
  // 菜单项有入场动画，等动画结束再点击（force 避开稳定性等待）
  await page.waitForTimeout(300);
  await page.locator("#mi-a").click({ force: true });
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.events)).toContain("mi-a");
  expect(await page.evaluate(() => window.events)).toContain("menu-close");
});

test("menu：点击外部关闭，Escape 关闭，禁用项不可点", async ({ page }) => {
  await page.locator("#menu-trigger").click();
  await page.waitForTimeout(100);
  await page.mouse.click(5, 300); // 组件外部
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.events.filter((e) => e === "menu-close").length)).toBe(1);

  await page.locator("#menu-trigger").click();
  await page.waitForTimeout(100);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.events.filter((e) => e === "menu-close").length)).toBe(2);

  await page.locator("#menu-trigger").click();
  await page.waitForTimeout(500);
  await page.locator("#mi-x").click({ force: true }).catch(() => {});
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.events)).not.toContain("mi-x");
});

test("list-item：嵌套子列表逐级缩进，点击区保持整行宽", async ({ page }) => {
  const box = await page.locator("#li-fold").boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + 15);
  await page.waitForTimeout(500);

  const geo = await page.evaluate(() => {
    const pad = (sel) =>
      document.querySelector(sel).shadowRoot.querySelector(".left-indent").getBoundingClientRect().width;
    const main = (sel) =>
      document.querySelector(sel).shadowRoot.querySelector(".main").getBoundingClientRect();
    return {
      top: pad("#li-btn"),
      level1: pad("#li-sub"),
      level2: pad("#li-sub2"),
      topWidth: main("#li-sub").width,
      subWidth: main("#li-sub2").width,
    };
  });
  // 顶层不缩进；一级 1em(14px)；二级再 +1em
  expect(geo.top).toBe(0);
  expect(geo.level1).toBeCloseTo(14, 0);
  expect(geo.level2).toBeCloseTo(28, 0);
  // 点击区仍是整行宽（未被 margin 挤压）
  expect(geo.topWidth).toBeGreaterThan(300);
  expect(Math.abs(geo.topWidth - geo.subWidth)).toBeLessThan(2);
});

// ---------- st-ripple 隔离 ----------

test("ripple：点击只作用于被点组件，嵌套/相邻组件不串波纹", async ({ page }) => {
  const counts = () =>
    page.evaluate(() => {
      const out = {};
      document.querySelectorAll("st-list-item").forEach((h) => {
        const r = h.shadowRoot?.querySelector("st-ripple");
        if (r) out[h.id] = r.shadowRoot.querySelectorAll(".ripple").length;
      });
      return out;
    });

  // 展开折叠项后点击子项：只有子项波纹，父折叠项不再叠加
  const box = await page.locator("#li-fold").boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + 15);
  await page.waitForTimeout(500);
  const sub = await page.locator("#li-sub").boundingBox();
  await page.mouse.click(sub.x + sub.width / 2, sub.y + sub.height / 2);
  await page.waitForTimeout(150);
  expect(await counts()).toEqual({
    "li-btn": 0,
    "li-plain": 0,
    "li-disabled": 0,
    "li-fold": 0,
    "li-fold2": 0,
    "li-sub": 1,
    "li-sub2": 0,
  });

  // 普通项点击只有自身波纹
  await page.waitForTimeout(400);
  await page.locator("#li-btn").click();
  await page.waitForTimeout(150);
  const after = await counts();
  expect(after["li-btn"]).toBe(1);
  expect(after["li-fold"]).toBe(0);
  expect(after["li-sub"]).toBe(0);
});

test("menu：关闭后菜单项波纹不残留（display:none 暂停动画的兜底）", async ({ page }) => {
  await page.locator("#menu-trigger").click();
  await page.waitForTimeout(500);
  await page.locator("#mi-a").click({ force: true });
  await page.waitForTimeout(600);
  // 点击后面板立即关闭（display:none 冻结 CSS 动画、animationend 不触发），
  // 波纹 span 必须已由定时器兜底移除，重开面板不会"续播"旧波纹
  const leftover = await page.evaluate(() => {
    const r = document.querySelector("#mi-a").shadowRoot.querySelector("st-ripple");
    return r.shadowRoot.querySelectorAll(".ripple").length;
  });
  expect(leftover).toBe(0);

  // 重开面板无残留波纹
  await page.locator("#menu-trigger").click();
  await page.waitForTimeout(300);
  const afterReopen = await page.evaluate(() => {
    const r = document.querySelector("#mi-a").shadowRoot.querySelector("st-ripple");
    return r.shadowRoot.querySelectorAll(".ripple").length;
  });
  expect(afterReopen).toBe(0);
});

// ---------- st-tab-bar / st-tab-item ----------

test("tabs：指示条定位到 active 项，切换 active 后动画跟随", async ({ page }) => {
  await page.waitForTimeout(200);
  const before = await page.evaluate(() => {
    const bar = document.querySelector("#tabs");
    const ind = bar.shadowRoot.querySelector(".indicator");
    return { left: ind.getBoundingClientRect().left, width: ind.getBoundingClientRect().width };
  });
  expect(before.width).toBeGreaterThan(0);

  await page.evaluate(() => {
    const bar = document.querySelector("#tabs");
    bar.querySelectorAll("st-tab-item").forEach((t) => t.removeAttribute("active"));
    document.querySelector("#tab-b").setAttribute("active", "");
  });
  await page.waitForTimeout(400);
  const after = await page.evaluate(() => {
    const ind = document.querySelector("#tabs").shadowRoot.querySelector(".indicator");
    return ind.getBoundingClientRect().left;
  });
  expect(after).toBeGreaterThan(before.left);
});

test("tabs：item 点击冒泡，disabled 项阻断", async ({ page }) => {
  await page.locator("#tab-a").click();
  expect(await page.evaluate(() => window.events)).toContain("tab-a");
  await page.locator("#tab-x").click({ force: true }).catch(() => {});
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.events)).not.toContain("tab-x");
});

// ---------- st-nav-bar / st-nav-item ----------

test("nav：active 药丸背景定位到 active 项并跟随切换", async ({ page }) => {
  await page.waitForTimeout(200);
  const bg = await page.evaluate(() => {
    const pill = document.querySelector("#nav").shadowRoot.querySelector(".active-bg");
    const r = pill.getBoundingClientRect();
    return { w: r.width, opacity: getComputedStyle(pill).opacity, left: r.left };
  });
  expect(bg.opacity).toBe("1");
  expect(bg.w).toBeGreaterThan(0);

  await page.evaluate(() => {
    const bar = document.querySelector("#nav");
    bar.querySelectorAll("st-nav-item").forEach((t) => t.removeAttribute("active"));
    document.querySelector("#nav-b").setAttribute("active", "");
  });
  await page.waitForTimeout(400);
  const after = await page.evaluate(
    () => document.querySelector("#nav").shadowRoot.querySelector(".active-bg").getBoundingClientRect().left
  );
  expect(after).toBeGreaterThan(bg.left);
});

test("nav：item 点击冒泡，disabled 项阻断", async ({ page }) => {
  await page.locator("#nav-a").click();
  expect(await page.evaluate(() => window.events)).toContain("nav-a");
  await page.locator("#nav-x").click({ force: true }).catch(() => {});
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.events)).not.toContain("nav-x");
});
