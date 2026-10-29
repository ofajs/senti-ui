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

test("共享 header：材质菜单 / 主题 / 导航 / 对话框", async ({ page }) => {
  await page.goto("/site/", { waitUntil: "networkidle", timeout: 60_000 });
  await waitHome(page);

  // 材质菜单（st-menu + st-menu-item + st-button）
  await page.evaluate(() => {
    const layout = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav")
    );
    layout.shadowRoot.querySelector(".skin-menu st-button").click();
  });
  await page.waitForTimeout(350);
  await page.evaluate(() => {
    const layout = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav")
    );
    [...layout.shadowRoot.querySelectorAll("st-menu-item")]
      .find((el) => el.textContent.includes("shadcn"))
      .click();
  });
  await page.waitForFunction(() => document.documentElement.dataset.skin === "shadcn");
  const radius = await page.evaluate(() => {
    const child = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".comp")
    );
    return parseFloat(getComputedStyle(child.shadowRoot.querySelector("st-button")).borderRadius);
  });
  expect(radius).toBeGreaterThan(5);
  expect(radius).toBeLessThan(8);

  // 主题（st-icon-button + st-tooltip）auto → light → dark
  for (let i = 0; i < 2; i++) {
    await page.evaluate(() => {
      const layout = [...document.querySelectorAll("o-page")].find(
        (op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav")
      );
      layout.shadowRoot.querySelectorAll(".top-actions st-icon-button")[0].click();
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
    const child = pages.find((op) => op.shadowRoot && op.shadowRoot.querySelector(".doc-page"));
    const sr = child.shadowRoot;
    return {
      path: location.pathname,
      title: document.title,
      header: !!layout,
      pages: pages.length,
      sideItems: layout.shadowRoot.querySelectorAll(".docs-side st-list-item").length,
      active: [...layout.shadowRoot.querySelectorAll(".docs-side st-list-item.active")].map((x) =>
        x.textContent.replace(/\s+/g, " ").trim()
      ),
      headerNav: [...layout.shadowRoot.querySelectorAll(".layout-nav st-button")].map((b) =>
        b.getAttribute("variant")
      ),
      sidebar: !!layout.shadowRoot.querySelector(".docs-side"),
      progress: !!layout.shadowRoot.querySelector(".read-progress st-progress"),
      h1: sr.querySelector("h1").textContent.trim(),
      apiRows: sr.querySelectorAll(".api tbody tr").length,
      demo: !!sr.querySelector(".demo"),
      pager: !!sr.querySelector(".doc-pager .pager-next"),
      animation: getComputedStyle(child).animationName,
      legacyDocsLinks: [...sr.querySelectorAll("a[href]")].filter((a) => {
        const href = a.getAttribute("href") || "";
        return href.includes("../docs") || href.includes("/docs/index.html#/docs/");
      }).length,
    };
  });

  expect(state.path).toBe("/site/docs/input.html");
  expect(state.title).toContain("Input — 组件文档");
  expect(state.header).toBe(true);
  expect(state.pages).toBe(2);
  expect(state.sideItems).toBe(21);
  expect(state.active[0]).toContain("Input");
  expect(state.headerNav).toEqual(["outlined", "filled"]);
  expect(state.sidebar).toBe(true);
  expect(state.progress).toBe(true);
  expect(state.h1).toBe("Input st-input");
  expect(state.apiRows).toBeGreaterThan(2);
  expect(state.demo).toBe(true);
  expect(state.pager).toBe(true);
  expect(state.animation).toContain("st-page-in");
  expect(state.legacyDocsLinks).toBe(0);

  // 侧栏切换：真实路径 + 布局/侧栏不销毁 + active 更新
  await page.evaluate(() => {
    const layout = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav")
    );
    [...layout.shadowRoot.querySelectorAll(".docs-side st-list-item")]
      .find((x) => x.textContent.includes("Slider"))
      .click();
  });
  await page.waitForURL("**/site/docs/slider.html", { timeout: 30_000 });
  await waitDocPage(page, "Slider");
  const after = await page.evaluate(() => {
    const layout = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav")
    );
    return {
      pages: [...document.querySelectorAll("o-page")].length,
      active: [...layout.shadowRoot.querySelectorAll(".docs-side st-list-item.active")].map((x) =>
        x.textContent.replace(/\s+/g, " ").trim()
      ),
    };
  });
  expect(after.pages).toBe(2);
  expect(after.active[0]).toContain("Slider");

  // 上一篇 / 下一篇（olink）：保持 SCSR 布局
  await page.locator(".pager-next").click();
  await page.waitForURL("**/site/docs/dialog.html", { timeout: 30_000 });
  await waitDocPage(page, "Dialog");
  expect(await page.evaluate(() => [...document.querySelectorAll("o-page")].length)).toBe(2);
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
  const cards = await page.evaluate(() => {
    const child = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".docs-index")
    );
    return child.shadowRoot.querySelectorAll(".docs-card").length;
  });
  expect(cards).toBe(21);
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
    return {
      pages: pages.length,
      sharedHeader: !!layout,
      active: [...layout.shadowRoot.querySelectorAll(".docs-side st-list-item.active")].map((x) =>
        x.textContent.replace(/\s+/g, " ").trim()
      ),
    };
  });
  expect(state.pages).toBe(2);
  expect(state.sharedHeader).toBe(true);
  expect(state.active[0]).toContain("Button");
});
