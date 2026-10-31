import { test, expect } from "@playwright/test";

test.describe.configure({ timeout: 90_000 });

const layoutRoot = () => {
  const layout = [...document.querySelectorAll("o-page")].find(
    (op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav")
  );
  return layout && layout.shadowRoot;
};

const waitHome = (page) =>
  page.waitForFunction(
    () => {
      const child = [...document.querySelectorAll("o-page")].find(
        (op) => op.shadowRoot && op.shadowRoot.querySelector(".comp")
      );
      return !!(child && child.shadowRoot.querySelector("h1")?.textContent.includes("语义组件"));
    },
    null,
    { timeout: 30_000 }
  );

const waitDocPage = (page, name) =>
  page.waitForFunction(
    (n) => {
      const child = [...document.querySelectorAll("o-page")].find(
        (op) => op.shadowRoot && op.shadowRoot.querySelector(".doc-page")
      );
      return !!(child && child.shadowRoot.querySelector("h1")?.textContent.includes(n));
    },
    name,
    { timeout: 30_000 }
  );

test("官网首页：25 张卡片 / 29 个标签 / 共享 SCSR 布局，无页面错误", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/site/", { waitUntil: "networkidle", timeout: 60_000 });
  await waitHome(page);
  await page.waitForTimeout(800);

  const state = await page.evaluate(() => {
    const pages = [...document.querySelectorAll("o-page")];
    const layout = pages.find((op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav"));
    const child = pages.find((op) => op.shadowRoot && op.shadowRoot.querySelector(".comp"));
    const sr = child.shadowRoot;
    const tags = [
      ...new Set(
        [...sr.querySelectorAll("*")]
          .map((el) => el.tagName.toLowerCase())
          .filter((tag) => tag.startsWith("st-"))
      ),
    ];
    const links = [sr, layout.shadowRoot].flatMap((root) => [...root.querySelectorAll("a[href]")]);
    return {
      pages: pages.length,
      sharedHeader: !!layout,
      heading: sr.querySelector("h1").textContent.trim(),
      sections: [...sr.querySelectorAll("main section[id]")].map((el) => el.id),
      path: location.pathname,
      templateRemoved: !document.querySelector("o-app template[page]"),
      cards: sr.querySelectorAll(".comp").length,
      tags,
      notReady: tags.filter((tag) => {
        const el = sr.querySelector(tag);
        return !el || !el.shadowRoot;
      }),
      legacyDocsLinks: links.filter((a) => {
        const href = a.getAttribute("href") || "";
        return href.includes("../docs") || href.includes("/docs/index.html#/docs/");
      }).length,
    };
  });

  expect(state.pages).toBe(2);
  expect(state.sharedHeader).toBe(true);
  expect(state.heading).toBe("语义组件，任意材质。");
  expect(state.tags).toHaveLength(29);
  expect(state.notReady).toEqual([]);
  expect(state.path).toBe("/site/");
  expect(state.templateRemoved).toBe(true);
  expect(state.sections).toEqual(["top", "components", "skins", "start"]);
  expect(state.cards).toBe(25);
  expect(state.legacyDocsLinks).toBe(0);
  expect(errors).toEqual([]);

  await page.reload({ waitUntil: "networkidle" });
  await waitHome(page);
  expect(await page.evaluate(() => location.pathname)).toBe("/site/");
});

test("SCSR：index.html 真实路径可直达", async ({ page }) => {
  await page.goto("/site/index.html", { waitUntil: "networkidle", timeout: 60_000 });
  await waitHome(page);
  const state = await page.evaluate(() => ({
    path: location.pathname,
    title: document.title,
    templateRemoved: !document.querySelector("o-app template[page]"),
    sharedHeader: [...document.querySelectorAll("o-page")].some(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav")
    ),
  }));
  expect(state.path).toBe("/site/index.html");
  expect(state.title).toBe("Senti-UI — 语义组件，任意材质");
  expect(state.templateRemoved).toBe(true);
  expect(state.sharedHeader).toBe(true);
});

test("共享 header：文字导航 / 主题 / 对话框", async ({ page }) => {
  await page.goto("/site/", { waitUntil: "networkidle", timeout: 60_000 });
  await waitHome(page);

  const chrome = await page.evaluate(() => {
    const layout = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav")
    );
    const sr = layout.shadowRoot;
    return {
      brand: sr.querySelector(".brand-btn").textContent.trim(),
      logoMark: !!sr.querySelector(".brand-mark"),
      skinMenu: !!sr.querySelector("#skin-menu"),
      nav: [...sr.querySelectorAll(".layout-nav st-button")].map((b) => ({
        text: b.textContent.trim(),
        variant: b.getAttribute("variant"),
        active: b.classList.contains("active"),
        color: getComputedStyle(b).color,
      })),
    };
  });
  expect(chrome.brand).toBe("SentiUI");
  expect(chrome.logoMark).toBe(true);
  expect(chrome.skinMenu).toBe(true);
  expect(chrome.nav.map((x) => [x.text, x.variant, x.active])).toEqual([
    ["组件", "text", true],
    ["文档", "text", false],
  ]);
  expect(chrome.nav[0].color).not.toBe(chrome.nav[1].color);

  // 主题（st-icon-button + st-tooltip）auto → light → dark
  for (let i = 0; i < 2; i++) {
    await page.evaluate(() => {
      const layout = [...document.querySelectorAll("o-page")].find(
        (op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav")
      );
      layout.shadowRoot.querySelector('.top-actions st-icon-button[title="切换主题"]').click();
    });
    await page.waitForTimeout(180);
  }
  await page.waitForFunction(() => document.documentElement.classList.contains("st-dark"));
  expect(await page.evaluate(() => localStorage.getItem("st-theme-mode"))).toBe("dark");

  // 文档是独立 SCSR 页（docs/index.html），布局保持
  await page.evaluate(() => {
    const layout = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav")
    );
    layout.shadowRoot.querySelectorAll(".layout-nav st-button")[1].click();
  });
  await page.waitForURL("**/site/docs/index.html", { timeout: 30_000 });
  await page.waitForFunction(() => {
    const child = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".docs-index")
    );
    return !!(child && child.shadowRoot.querySelectorAll(".docs-card").length === 21);
  });
  expect(
    await page.evaluate(
      () =>
        [...document.querySelectorAll("o-page")].filter(
          (op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav")
        ).length
    )
  ).toBe(1);

  // 回首页并验证对话框
  await page.evaluate(() => {
    const layout = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav")
    );
    layout.shadowRoot.querySelectorAll(".layout-nav st-button")[0].click();
  });
  await waitHome(page);
  await page.evaluate(() => {
    const child = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".comp")
    );
    [...child.shadowRoot.querySelectorAll("st-button")]
      .find((el) => el.textContent.includes("打开对话框"))
      .click();
  });
  await page.waitForFunction(() => {
    const child = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".comp")
    );
    return child.shadowRoot.querySelector("st-dialog").hasAttribute("open");
  });
  await page.keyboard.press("Escape");
  await page.waitForFunction(() => {
    const child = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".comp")
    );
    return !child.shadowRoot.querySelector("st-dialog").hasAttribute("open");
  });
});

test("SCSR 首屏兜底：禁用 JavaScript 时仍有可读内容", async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: "http://127.0.0.1:8642",
  });
  const page = await context.newPage();
  await page.goto("/site/");
  await expect(page.locator(".nojs h1")).toHaveText("Senti-UI");
  await expect(page.locator(".nojs")).toBeVisible();
  await context.close();
});

test("组件文档：独立页 / 共享侧栏与 header / 页面切换动画", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/site/docs/input.html", { waitUntil: "networkidle", timeout: 60_000 });
  await waitDocPage(page, "Input");

  const state = await page.evaluate(() => {
    const pages = [...document.querySelectorAll("o-page")];
    const layout = pages.find((op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav"));
    const docs = pages.find((op) => op.shadowRoot && op.shadowRoot.querySelector(".docs-side"));
    const child = pages.find((op) => op.shadowRoot && op.shadowRoot.querySelector(".doc-page"));
    const sr = child.shadowRoot;
    const dsr = docs.shadowRoot;
    return {
      path: location.pathname,
      title: document.title,
      header: !!layout,
      pages: pages.length,
      sideItems: dsr.querySelectorAll(".docs-side st-list-item").length,
      active: [...dsr.querySelectorAll(".docs-side st-list-item.active")].map((x) =>
        x.textContent.replace(/\s+/g, " ").trim()
      ),
      headerNav: [...layout.shadowRoot.querySelectorAll(".layout-nav st-button")].map((b) => ({
        variant: b.getAttribute("variant"),
        active: b.classList.contains("active"),
      })),
      sidebar: !!dsr.querySelector(".docs-side"),
      picker: !!dsr.querySelector(".docs-picker"),
      pickerValue: dsr.querySelector(".docs-picker").value,
      progress: !!layout.shadowRoot.querySelector(".read-progress st-progress"),
      h1: sr.querySelector("h1").textContent.trim(),
      apiRows: sr.querySelectorAll(".api tbody tr").length,
      sections: sr.querySelectorAll(".doc-section").length,
      demos: sr.querySelectorAll(".demo").length,
      pager: !!sr.querySelector(".doc-pager .pager-next"),
      animation: getComputedStyle(child).animationName,
      slotContainer: getComputedStyle(dsr.querySelector(".docs-body")).position,
      legacyDocsLinks: [sr, dsr].flatMap((root) => [...root.querySelectorAll("a[href]")]).filter((a) => {
        const href = a.getAttribute("href") || "";
        return href.includes("../docs") || href.includes("/docs/index.html#/docs/");
      }).length,
    };
  });

  expect(state.path).toBe("/site/docs/input.html");
  expect(state.title).toContain("Input — 组件文档");
  expect(state.header).toBe(true);
  expect(state.pages).toBe(3);
  expect(state.sideItems).toBe(22);
  expect(state.active[0]).toContain("Input");
  expect(state.headerNav).toEqual([
    { variant: "text", active: false },
    { variant: "text", active: true },
  ]);
  expect(state.sidebar).toBe(true);
  expect(state.picker).toBe(true);
  expect(state.pickerValue).toBe("input");
  expect(state.progress).toBe(true);
  expect(state.h1).toBe("Input st-input");
  expect(state.apiRows).toBeGreaterThan(2);
  expect(state.sections).toBeGreaterThanOrEqual(4);
  expect(state.demos).toBeGreaterThanOrEqual(4);
  expect(state.pager).toBe(true);
  expect(state.animation).toContain("doc-page-in");
  expect(state.slotContainer).toBe("relative");
  expect(state.legacyDocsLinks).toBe(0);

  // 侧栏切换：真实路径 + 布局/侧栏不销毁 + active 更新
  await page.evaluate(() => {
    const docs = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".docs-side")
    );
    [...docs.shadowRoot.querySelectorAll(".docs-side st-list-item")]
      .find((x) => x.textContent.includes("Slider"))
      .click();
  });
  await page.waitForURL("**/site/docs/slider.html", { timeout: 30_000 });
  await waitDocPage(page, "Slider");
  const after = await page.evaluate(() => {
    const docs = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".docs-side")
    );
    return {
      pages: [...document.querySelectorAll("o-page")].length,
      sidebars: [...document.querySelectorAll("o-page")].filter(
        (op) => op.shadowRoot && op.shadowRoot.querySelector(".docs-side")
      ).length,
      active: [...docs.shadowRoot.querySelectorAll(".docs-side st-list-item.active")].map((x) =>
        x.textContent.replace(/\s+/g, " ").trim()
      ),
      pickerValue: docs.shadowRoot.querySelector(".docs-picker").value,
    };
  });
  expect(after.pages).toBe(3);
  expect(after.sidebars).toBe(1);
  expect(after.active[0]).toContain("Slider");
  expect(after.pickerValue).toBe("slider");

  // 上一篇 / 下一篇（olink）：保持 SCSR 布局
  await page.locator(".pager-next").click();
  await page.waitForURL("**/site/docs/dialog.html", { timeout: 30_000 });
  await waitDocPage(page, "Dialog");
  expect(await page.evaluate(() => [...document.querySelectorAll("o-page")].length)).toBe(3);
  expect(errors).toEqual([]);
});

test("组件文档首页：21 张卡片可进入独立页", async ({ page }) => {
  await page.goto("/site/docs/index.html", { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForFunction(() => {
    const child = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".docs-index")
    );
    return !!(child && child.shadowRoot.querySelectorAll(".docs-card").length === 21);
  });
  const overview = await page.evaluate(() => {
    const child = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".docs-index")
    );
    const sr = child.shadowRoot;
    return {
      cards: sr.querySelectorAll(".docs-card").length,
      groups: [...sr.querySelectorAll(".docs-group")].map((g) => ({
        title: g.querySelector("h2").textContent.replace(/\s+/g, " ").trim(),
        cards: g.querySelectorAll(".docs-card").length,
      })),
    };
  });
  expect(overview.cards).toBe(21);
  expect(overview.groups).toEqual([
    { title: "基础组件 18", cards: 18 },
    { title: "辅助组件 3", cards: 3 },
  ]);
  await page.evaluate(() => {
    const child = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".docs-index")
    );
    child.shadowRoot.querySelectorAll(".docs-card")[0].click();
  });
  await page.waitForURL("**/site/docs/button.html", { timeout: 30_000 });
  await waitDocPage(page, "Button");
});

test("首页卡片进入对应组件文档，header 保持共享", async ({ page }) => {
  await page.goto("/site/", { waitUntil: "networkidle", timeout: 60_000 });
  await waitHome(page);
  const href = await page.locator(".comp-link").first().getAttribute("href");
  expect(href).toContain("/site/docs/button.html");
  await page.locator(".comp-link").first().click();
  await page.waitForURL("**/site/docs/button.html", { timeout: 30_000 });
  await waitDocPage(page, "Button");
  const state = await page.evaluate(() => {
    const pages = [...document.querySelectorAll("o-page")];
    const layout = pages.find((op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav"));
    const child = pages.find((op) => op.shadowRoot && op.shadowRoot.querySelector(".doc-page"));
    const docs = pages.find((op) => op.shadowRoot && op.shadowRoot.querySelector(".docs-side"));
    return {
      pages: pages.length,
      sharedHeader: !!layout,
      active: [...docs.shadowRoot.querySelectorAll(".docs-side st-list-item.active")].map((x) =>
        x.textContent.replace(/\s+/g, " ").trim()
      ),
    };
  });
  expect(state.pages).toBe(3);
  expect(state.sharedHeader).toBe(true);
  expect(state.active[0]).toContain("Button");
});

test("Ripple 文档：并列示例只触发被点的波纹（o-page 内绑定最近父元素）", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/site/docs/ripple.html", { waitUntil: "networkidle", timeout: 60_000 });
  await waitDocPage(page, "Ripple");

  const box = await page.evaluate(() => {
    const child = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".doc-page")
    );
    const stage = child.shadowRoot.querySelector(".doc-section .demo-stage");
    const target = stage.querySelector("div[style*='position: relative']");
    const r = target.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  await page.mouse.click(box.x, box.y);
  await page.waitForTimeout(150);

  const counts = await page.evaluate(() => {
    const child = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".doc-page")
    );
    return [...child.shadowRoot.querySelectorAll("st-ripple")].map(
      (r) => r.shadowRoot.querySelectorAll(".ripple").length
    );
  });
  expect(counts.filter((n) => n > 0)).toHaveLength(1);
  expect(counts.reduce((a, b) => a + b, 0)).toBe(1);
  expect(errors).toEqual([]);
});

test("滚动：body overflow hidden，整站滚动发生在内部容器，header/侧栏不跟随页面滚走", async ({ page }) => {
  await page.goto("/site/docs/input.html", { waitUntil: "networkidle", timeout: 60_000 });
  await waitDocPage(page, "Input");

  const initial = await page.evaluate(() => {
    const layout = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav")
    );
    const scroller = layout.shadowRoot.querySelector(".site-scroll");
    return {
      bodyOverflow: getComputedStyle(document.body).overflow,
      overscroll: getComputedStyle(scroller).overscrollBehaviorY,
      docScroll: document.documentElement.scrollHeight,
      viewport: innerHeight,
      scrollable: scroller.scrollHeight > scroller.clientHeight + 10,
    };
  });
  expect(initial.bodyOverflow).toBe("hidden");
  expect(initial.overscroll).toBe("none");
  expect(initial.docScroll).toBe(initial.viewport);
  expect(initial.scrollable).toBe(true);

  await page.evaluate(() => {
    const layout = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav")
    );
    layout.shadowRoot.querySelector(".site-scroll").scrollTop = 900;
  });
  await page.waitForTimeout(250);

  const after = await page.evaluate(() => {
    const layout = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav")
    );
    const docs = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".docs-side")
    );
    const scroller = layout.shadowRoot.querySelector(".site-scroll");
    return {
      windowY: window.scrollY,
      generatedScrollTop: scroller.scrollTop,
      headerTop: layout.shadowRoot.querySelector(".top").getBoundingClientRect().top,
      progress: Number(
        layout.shadowRoot.querySelector(".read-progress st-progress").getAttribute("value")
      ),
      sideTop: docs.shadowRoot.querySelector(".docs-side").getBoundingClientRect().top,
      toTop: getComputedStyle(layout.shadowRoot.querySelector(".to-top")).display,
    };
  });
  expect(after.windowY).toBe(0);
  expect(after.generatedScrollTop).toBe(900);
  expect(after.headerTop).toBe(0);
  expect(after.progress).toBeGreaterThan(0);
  expect(after.sideTop).toBeGreaterThan(60);
  expect(after.sideTop).toBeLessThan(90);
  expect(after.toTop).toBe("grid");
});


test("固定定位弹层：页面动画结束后不残留 transform，对话框覆盖整个视口", async ({ page }) => {
  await page.goto("/site/", { waitUntil: "networkidle", timeout: 60_000 });
  await waitHome(page);
  await page.waitForTimeout(350);
  await page.evaluate(() => {
    const child = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".comp")
    );
    [...child.shadowRoot.querySelectorAll("st-button")]
      .find((el) => el.textContent.includes("打开对话框"))
      .click();
  });
  await page.waitForFunction(() => {
    const child = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".comp")
    );
    return !!child && child.shadowRoot.querySelector("st-dialog")?.hasAttribute("open");
  });

  const box = await page.evaluate(() => {
    const child = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".comp")
    );
    const dlg = child.shadowRoot.querySelector("st-dialog[open]");
    const r = dlg.getBoundingClientRect();
    return {
      transform: getComputedStyle(child).transform,
      width: r.width,
      height: r.height,
      x: r.x,
      y: r.y,
      viewportWidth: innerWidth,
      viewportHeight: innerHeight,
    };
  });
  expect(box.transform).toBe("none");
  expect(box.x).toBe(0);
  expect(box.y).toBe(0);
  expect(box.width).toBe(box.viewportWidth);
  expect(box.height).toBe(box.viewportHeight);
});

test("共享 header：皮肤菜单切换全站材质并持久化", async ({ page }) => {
  await page.goto("/site/index.html");
  await page.evaluate(() => localStorage.removeItem("st-skin"));
  await page.reload();
  await page.locator("#skin-menu st-icon-button").waitFor({ state: "visible" });

  await page.locator("#skin-menu st-icon-button").click();
  await page.locator("#skin-menu st-menu-item").filter({ hasText: "Apple 毛玻璃" }).click();

  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.skin), { timeout: 5_000 })
    .toBe("apple");
  expect(await page.evaluate(() => localStorage.getItem("st-skin"))).toBe("apple");

  // header 内的按钮本身也跟随皮肤（Apple 的毛玻璃）
  const blur = await page
    .locator("#skin-menu st-icon-button")
    .evaluate((el) => getComputedStyle(el).backdropFilter);
  expect(blur).toContain("blur(18px)");

  // 再切回 m3，避免影响同页后续交互
  await page.locator("#skin-menu st-icon-button").click();
  await page.locator("#skin-menu st-menu-item").filter({ hasText: "M3 材质" }).click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.skin), { timeout: 5_000 })
    .toBe("m3");
});

test("官网环境光：Apple 毛玻璃下增强，M3/shadcn 保持低调", async ({ page }) => {
  await page.goto("/site/index.html");
  await page.waitForTimeout(1500);
  const ambient = () => page.evaluate(() => {
    const layout = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav")
    );
    const el = layout.shadowRoot.querySelector(".ambient");
    return {
      exists: !!el,
      strong: el.classList.contains("ambient-strong"),
      opacity: getComputedStyle(el).opacity,
      animation: getComputedStyle(el.querySelector(".orb-a")).animationName,
    };
  });

  expect(await ambient()).toMatchObject({ exists: true, strong: false, opacity: "0.22" });
  expect(
    await page.evaluate(() => {
      const page = [...document.querySelectorAll("o-page")].find(
        (op) => op.shadowRoot && op.shadowRoot.querySelector(".comp-grid")
      );
      return page.shadowRoot.querySelector(".comp-grid").classList.contains("glass");
    })
  ).toBe(false);

  await page.locator("#skin-menu st-icon-button").click();
  await page.locator("#skin-menu st-menu-item").filter({ hasText: "Apple 毛玻璃" }).click();
  await expect.poll(async () => (await ambient()).strong, { timeout: 5_000 }).toBe(true);
  await expect
    .poll(async () => parseFloat((await ambient()).opacity), { timeout: 5_000 })
    .toBeGreaterThan(0.6);
  expect((await ambient()).animation).toBe("st-ambient-drift");
  const glass = await page.evaluate(() => {
    const page = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".comp-grid")
    );
    const grid = page.shadowRoot.querySelector(".comp-grid");
    const card = grid.querySelector(".comp");
    return {
      glass: grid.classList.contains("glass"),
      blur: getComputedStyle(card).backdropFilter,
    };
  });
  expect(glass.glass).toBe(true);
  expect(glass.blur).toContain("blur(18px)");

  await page.locator("#skin-menu st-icon-button").click();
  await page.locator("#skin-menu st-menu-item").filter({ hasText: "M3 材质" }).click();
});

test("文档示例容器在 Apple 下透出环境光", async ({ page }) => {
  await page.goto("/site/docs/input.html");
  await page.waitForTimeout(1600);
  await page.locator("#skin-menu st-icon-button").click();
  await page.locator("#skin-menu st-menu-item").filter({ hasText: "Apple 毛玻璃" }).click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.skin), { timeout: 5_000 })
    .toBe("apple");

  const state = await page.evaluate(() => {
    const child = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".doc-page")
    );
    const demo = child.shadowRoot.querySelector(".demo");
    const stage = child.shadowRoot.querySelector(".demo-stage");
    return {
      demoBg: getComputedStyle(demo).backgroundColor,
      demoBlur: getComputedStyle(demo).backdropFilter,
      stageBg: getComputedStyle(stage).backgroundColor,
    };
  });
  expect(state.demoBg).not.toBe("rgb(253, 252, 255)");
  expect(state.demoBlur).toContain("blur(18px)");
  expect(state.stageBg).toBe("rgba(0, 0, 0, 0)");

  await page.locator("#skin-menu st-icon-button").click();
  await page.locator("#skin-menu st-menu-item").filter({ hasText: "M3 材质" }).click();
});
