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
      eyebrow: sr.querySelector(".eyebrow").textContent.replace(/\s+/g, " ").trim(),
      sections: [...sr.querySelectorAll("main section[id]")].map((el) => el.id),
      path: location.pathname,
      templateRemoved: !document.querySelector("o-app template[page]"),
      cards: sr.querySelectorAll(".comp").length,
      lastCard: [...sr.querySelectorAll(".comp")].at(-1)?.querySelector(".comp-id h3")?.textContent.trim(),
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
  expect(state.eyebrow).toContain("AI-first 前端框架");
  expect(state.tags).toHaveLength(29);
  expect(state.notReady).toEqual([]);
  expect(state.path).toBe("/site/");
  expect(state.templateRemoved).toBe(true);
  expect(state.sections).toEqual(["top", "components", "skins", "start"]);
  expect(state.cards).toBe(25);
  // Ripple 是 M3 专属的材质细节，放到组件卡片最后
  expect(state.lastCard).toBe("Ripple");
  expect(state.legacyDocsLinks).toBe(0);
  expect(errors).toEqual([]);

  await page.reload({ waitUntil: "networkidle" });
  await waitHome(page);
  expect(await page.evaluate(() => location.pathname)).toBe("/site/");
});

test("从主题页切回首页：首页组件依赖随 template 重新加载", async ({ page }) => {
  await page.goto("/site/skins.html", { waitUntil: "networkidle", timeout: 60_000 });
  await page.locator(".skin-card").first().waitFor({ state: "visible" });

  await page.locator(".brand-btn").click();
  await page.waitForURL("**/site/index.html", { timeout: 30_000 });
  await waitHome(page);
  await page.waitForTimeout(800);

  const state = await page.evaluate(() => {
    const child = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".comp")
    );
    const sr = child.shadowRoot;
    const missing = [];
    for (const el of sr.querySelectorAll("*")) {
      const tag = el.tagName.toLowerCase();
      if (tag.startsWith("st-") && !el.shadowRoot) missing.push(tag);
    }
    return {
      cards: sr.querySelectorAll(".comp").length,
      missing: [...new Set(missing)],
      buttonGroup: !!sr.querySelector("st-button-group")?.shadowRoot,
      select: !!sr.querySelector("st-select")?.shadowRoot,
    };
  });
  expect(state.cards).toBe(25);
  expect(state.missing).toEqual([]);
  expect(state.buttonGroup).toBe(true);
  expect(state.select).toBe(true);
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
    ["文档", "text", false],
    ["皮肤", "text", false],
    ["手记", "text", false],
  ]);
  expect(chrome.nav[0].color).toBe(chrome.nav[1].color);

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
    layout.shadowRoot.querySelectorAll(".layout-nav st-button")[0].click();
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
    layout.shadowRoot.querySelector(".brand-btn").click();
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
    { variant: "text", active: true },
    { variant: "text", active: false },
    { variant: "text", active: false },
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
  // 切页动画只在 app-config.js 的 pageAnime 里，父页不再有 CSS 动画
  expect(state.animation).toBe("none");
  expect(state.slotContainer).toBe("relative");
  expect(state.legacyDocsLinks).toBe(0);

  // 侧栏切换：真实路径 + 布局/侧栏不销毁 + active 更新 + pageAnime 入场
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
    const child = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".doc-page")
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
      // pageAnime 三态由 app-config.js 注入 o-page 内联样式，过渡由 ofa 注入（all .3s）
      transitionProperty: getComputedStyle(child).transitionProperty,
      transitionDuration: getComputedStyle(child).transitionDuration,
      transform: child.style.transform,
      opacity: child.style.opacity,
      animation: getComputedStyle(child).animationName,
    };
  });
  expect(after.pages).toBe(3);
  expect(after.sidebars).toBe(1);
  expect(after.active[0]).toContain("Slider");
  expect(after.pickerValue).toBe("slider");
  // 上移淡入 = pageAnime 的 transform + opacity，过渡时长来自 ofa
  expect(after.transitionProperty).toBe("all");
  expect(after.transitionDuration).toBe("0.3s");
  expect(after.transform).toBe("none");
  expect(after.opacity).toBe("1");
  expect(after.animation).toBe("none");

  // 动画配置只在 app-config.js：起点态带位移、终点归零，且三态都不写 transition
  const anime = await page.evaluate(async () => (await import("/site/app-config.js")).pageAnime);
  expect(anime.next.transform).toContain("translateY");
  expect(anime.previous.transform).toContain("translateY");
  expect(anime.current.transform).toBe("none");
  expect([anime.current, anime.next, anime.previous].some((s) => "transition" in s)).toBe(false);

  // 上一篇 / 下一篇（olink）：保持 SCSR 布局
  await page.locator(".pager-next").click();
  await page.waitForURL("**/site/docs/dialog.html", { timeout: 30_000 });
  await waitDocPage(page, "Dialog");
  expect(await page.evaluate(() => [...document.querySelectorAll("o-page")].length)).toBe(3);
  expect(errors).toEqual([]);
});

test("切页不挤动内容区：阅读进度条显隐不改变页面顶边", async ({ page }) => {
  const metrics = () =>
    page.evaluate(() => {
      const layout = [...document.querySelectorAll("o-page")].find(
        (op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav")
      );
      const sr = layout.shadowRoot;
      const bar = sr.querySelector(".read-progress");
      return {
        mainTop: sr.querySelector(".site-main").getBoundingClientRect().top,
        barVisible: getComputedStyle(bar).display !== "none",
        barTop: bar.getBoundingClientRect().top,
        headerBottom: sr.querySelector(".top").getBoundingClientRect().bottom,
      };
    });

  await page.goto("/site/", { waitUntil: "networkidle", timeout: 60_000 });
  await waitHome(page);
  const home = await metrics();
  expect(home.barVisible).toBe(false);

  await page.evaluate(() => {
    const layout = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav")
    );
    [...layout.shadowRoot.querySelectorAll(".layout-nav st-button")]
      .find((b) => b.textContent.includes("文档"))
      .click();
  });
  await page.waitForURL("**/site/docs/index.html", { timeout: 30_000 });
  await page.waitForFunction(() => {
    const child = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".docs-index")
    );
    return !!(child && child.shadowRoot.querySelectorAll(".docs-card").length === 21);
  });
  const docs = await metrics();

  // 进度条出现（docs 页），但它是绝对定位：内容区顶边不动，页面不会被挤 3px
  expect(docs.barVisible).toBe(true);
  expect(docs.mainTop).toBe(home.mainTop);
  expect(docs.barTop).toBeCloseTo(docs.headerBottom, 0);
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
    { title: "基础组件 17", cards: 17 },
    { title: "辅助组件 4", cards: 4 },
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

test("手记：目录、首篇文章与共享 header", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/site/notes/index.html", { waitUntil: "networkidle", timeout: 60_000 });
  await page.locator(".note-card").waitFor({ state: "visible" });

  const index = await page.evaluate(() => {
    const pages = [...document.querySelectorAll("o-page")];
    const layout = pages.find((op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav"));
    const child = pages.find((op) => op.shadowRoot && op.shadowRoot.querySelector(".notes-index"));
    const sr = child.shadowRoot;
    return {
      title: document.title,
      sharedHeader: !!layout,
      nav: [...layout.shadowRoot.querySelectorAll(".layout-nav st-button")].map((b) => ({
        text: b.textContent.trim(),
        active: b.classList.contains("active"),
      })),
      cards: sr.querySelectorAll(".note-card").length,
      href: sr.querySelector(".note-card").getAttribute("href"),
      heading: sr.querySelector(".note-card h2").textContent.trim(),
    };
  });
  expect(index.title).toBe("手记 — Senti-UI");
  expect(index.sharedHeader).toBe(true);
  expect(index.nav).toEqual([
    { text: "文档", active: false },
    { text: "皮肤", active: false },
    { text: "手记", active: true },
  ]);
  expect(index.cards).toBe(1);
  expect(index.href).toContain("why-senti-ui.html");
  expect(index.heading).toBe("为什么要开发 Senti-UI");

  await page.locator(".note-card").click();
  await page.waitForURL("**/site/notes/why-senti-ui.html", { timeout: 30_000 });
  await page.locator(".note-page h1").waitFor({ state: "visible" });
  await page.waitForFunction(() => {
    const child = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".note-page")
    );
    return !!(child && child.shadowRoot.querySelectorAll(".note-body h2").length === 5);
  });

  const article = await page.evaluate(() => {
    const pages = [...document.querySelectorAll("o-page")];
    const layout = pages.find((op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav"));
    const child = pages.find((op) => op.shadowRoot && op.shadowRoot.querySelector(".note-page"));
    const sr = child.shadowRoot;
    return {
      title: document.title,
      h1: sr.querySelector(".note-hero h1").textContent.trim(),
      sections: sr.querySelectorAll(".note-body h2").length,
      principles: sr.querySelectorAll(".principles li").length,
      body: sr.querySelector(".note-body").textContent,
      navActive: [...layout.shadowRoot.querySelectorAll(".layout-nav st-button.active")].map((b) =>
        b.textContent.trim()
      ),
      headerCount: pages.filter(
        (op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav")
      ).length,
    };
  });
  expect(article.title).toContain("为什么要开发 Senti-UI");
  expect(article.h1).toBe("为什么要开发 Senti-UI");
  expect(article.sections).toBe(5);
  expect(article.principles).toBe(3);
  expect(article.body).toContain("更适合 AI 的前端框架");
  expect(article.navActive).toEqual(["手记"]);
  expect(article.headerCount).toBe(1);

  await page.locator(".note-foot a").first().click();
  await page.waitForURL("**/site/notes/index.html", { timeout: 30_000 });
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll("o-page")].filter(
        (op) => op.shadowRoot && op.shadowRoot.querySelector(".notes-index")
      ).length === 1
  );
  expect(errors).toEqual([]);
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

test("Windows 11 皮肤：菜单可切换，控件与表面采用 Fluent 材质", async ({ page }) => {
  await page.goto("/site/index.html");
  await page.evaluate(() => localStorage.removeItem("st-skin"));
  await page.reload();
  await page.locator("#skin-menu st-icon-button").waitFor({ state: "visible" });
  await page.locator("#skin-menu st-icon-button").click();
  await expect(page.locator("#skin-menu st-menu-item")).toHaveCount(3);

  await page.locator("#skin-menu st-menu-item").filter({ hasText: "Windows 11 风格" }).click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.skin), { timeout: 5_000 })
    .toBe("windows");
  await page.waitForTimeout(300);

  const state = await page.evaluate(() => {
    const find = (root, sel) => {
      const d = root.querySelector(sel);
      if (d) return d;
      for (const el of root.querySelectorAll("*")) {
        if (el.shadowRoot) {
          const r = find(el.shadowRoot, sel);
          if (r) return r;
        }
      }
      return null;
    };
    const pageEl = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".comp-grid")
    );
    const grid = pageEl.shadowRoot.querySelector(".comp-grid");
    const button = grid.querySelector(".comp-preview st-button");
    const icon = find(document, ".top-actions st-icon-button");
    return {
      buttonRadius: parseFloat(getComputedStyle(button).borderRadius),
      iconRadius: parseFloat(getComputedStyle(icon).borderRadius),
      font: getComputedStyle(icon).fontFamily,
    };
  });
  expect(state.buttonRadius).toBeGreaterThan(3.5);
  expect(state.buttonRadius).toBeLessThan(4.5);
  expect(state.iconRadius).toBeLessThan(5);
  expect(state.font).toContain("Segoe UI");

  // 切回 m3，避免影响同页后续交互
  await page.locator("#skin-menu st-icon-button").click();
  await page.locator("#skin-menu st-menu-item").filter({ hasText: "M3 主题" }).click();
});

test("主题页：五套主题可选，顶部快捷菜单只保留三巨头", async ({ page }) => {
  await page.goto("/site/skins.html");
  await page.evaluate(() => localStorage.removeItem("st-skin"));
  await page.reload();
  await page.locator(".skin-card").first().waitFor({ state: "visible" });

  const chrome = await page.evaluate(() => {
    const layout = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav")
    );
    const sr = layout.shadowRoot;
    return {
      nav: [...sr.querySelectorAll(".layout-nav st-button")].map((b) => ({
        text: b.textContent.trim(),
        active: b.classList.contains("active"),
      })),
      menuCount: sr.querySelectorAll("#skin-menu st-menu-item").length,
      menuLabels: [...sr.querySelectorAll("#skin-menu st-menu-item")].map((i) =>
        i.textContent.replace(/\s+/g, " ").trim()
      ),
    };
  });
  expect(chrome.nav.map((x) => [x.text, x.active])).toEqual([
    ["文档", false],
    ["皮肤", true],
    ["手记", false],
  ]);
  expect(chrome.menuCount).toBe(3);
  expect(chrome.menuLabels.join(" ")).toContain("Apple 毛玻璃");
  expect(chrome.menuLabels.join(" ")).toContain("Windows 11 风格");
  expect(chrome.menuLabels.join(" ")).not.toContain("shadcn");
  expect(chrome.menuLabels.join(" ")).not.toContain("Cyberpunk");

  await expect(page.locator(".skin-card")).toHaveCount(5);
  await expect(page.locator(".skin-preview[data-skin]")).toHaveCount(5);

  // shadcn 不在快捷菜单里，但皮肤页可以选
  const shadcn = page.locator(".skin-card").filter({ hasText: "shadcn · 扁平" });
  await shadcn.locator(".skin-actions st-button").click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.skin), { timeout: 5_000 })
    .toBe("shadcn");
  expect(await page.evaluate(() => localStorage.getItem("st-skin"))).toBe("shadcn");
  await expect(page.locator(".current")).toContainText("shadcn · 扁平");

  // Cyberpunk：零圆角 + 等宽字 + 霓虹外发光，且不在快捷菜单里
  const cyberpunk = page.locator(".skin-card").filter({ hasText: "Cyberpunk · 霓虹终端" });
  await cyberpunk.locator(".skin-actions st-button").filter({ hasText: "使用此主题" }).click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.skin), { timeout: 5_000 })
    .toBe("cyberpunk");
  expect(await page.evaluate(() => localStorage.getItem("st-skin"))).toBe("cyberpunk");
  await expect(page.locator(".current")).toContainText("Cyberpunk · 霓虹终端");
  const cyberStyle = await page
    .locator('.skin-preview[data-skin="cyberpunk"] st-button')
    .first()
    .evaluate((el) => {
      const cs = getComputedStyle(el);
      return { radius: parseFloat(cs.borderRadius), font: cs.fontFamily, shadow: cs.boxShadow };
    });
  expect(cyberStyle.radius).toBe(0);
  expect(cyberStyle.font).toContain("monospace");
  expect(cyberStyle.shadow).not.toBe("none");

  // 三巨头材质也能从皮肤页切换
  const windows = page.locator(".skin-card").filter({ hasText: "Microsoft · Windows 11" });
  await windows.locator(".skin-actions st-button").click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.skin), { timeout: 5_000 })
    .toBe("windows");

  // 收尾恢复 m3
  const m3 = page.locator(".skin-card").filter({ hasText: "Android · Material 3" });
  await m3.locator(".skin-actions st-button").click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.skin), { timeout: 5_000 })
    .toBe("m3");
});

test("Cyberpunk 主题：套用深色 + 霓虹配色，颜色仍走 M3", async ({ page }) => {
  await page.goto("/site/skins.html");
  await page.evaluate(() => {
    localStorage.removeItem("st-skin");
    localStorage.removeItem("st-theme-mode");
    localStorage.removeItem("st-color-config");
  });
  await page.reload();
  await page.locator(".skin-card").first().waitFor({ state: "visible" });

  const cyberpunk = page.locator(".skin-card").filter({ hasText: "Cyberpunk · 霓虹终端" });
  await cyberpunk.locator(".skin-actions st-button").filter({ hasText: "使用此主题" }).click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.skin), { timeout: 5_000 })
    .toBe("cyberpunk");

  const state = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("st-color-config") || "{}");
    return {
      dark: document.documentElement.classList.contains("st-dark"),
      mode: localStorage.getItem("st-theme-mode"),
      seed: saved.seed,
      tertiary: saved.overrides?.tertiary,
    };
  });
  expect(state.dark).toBe(true);
  expect(state.mode).toBe("dark");
  expect(state.seed).toBe("#ff2e97");
  expect(state.tertiary).toBe("#00e5ff");

  // 皮肤不改变颜色：filled 按钮仍然消费 M3 primary / on-primary
  const colors = await page.evaluate(() => {
    const find = (root, sel) => {
      const d = root.querySelector(sel);
      if (d) return d;
      for (const el of root.querySelectorAll("*")) {
        if (el.shadowRoot) {
          const r = find(el.shadowRoot, sel);
          if (r) return r;
        }
      }
      return null;
    };
    const btn = find(document, '.skin-preview[data-skin="cyberpunk"] st-button');
    const probe = document.createElement("span");
    document.body.appendChild(probe);
    probe.style.color = "var(--md-sys-color-primary)";
    const primary = getComputedStyle(probe).color;
    probe.style.color = "var(--md-sys-color-on-primary)";
    const onPrimary = getComputedStyle(probe).color;
    probe.remove();
    const parse = (value) => {
      const n = value.match(/[\d.]+/g).map(Number);
      return value.startsWith("color(")
        ? n.slice(0, 3).map((v) => Math.round(v * 255))
        : n.slice(0, 3);
    };
    const cs = getComputedStyle(btn);
    return { bg: parse(cs.backgroundColor), color: parse(cs.color), primary: parse(primary), onPrimary: parse(onPrimary) };
  });
  expect(colors.bg).toEqual(colors.primary);
  expect(colors.color).toEqual(colors.onPrimary);
});

test("主题预设：每套材质带官方配色，并按主题记住各自颜色", async ({ page }) => {
  await page.goto("/site/skins.html");
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.locator(".skin-card").first().waitFor({ state: "visible" });

  const card = (text) => page.locator(".skin-card").filter({ hasText: text });
  const themeState = () =>
    page.evaluate(() => {
      const saved = JSON.parse(localStorage.getItem("st-color-config") || "{}");
      return {
        skin: document.documentElement.dataset.skin,
        seed: saved.seed,
        primary: saved.overrides?.primary,
      };
    });

  // Apple：官方 iOS 蓝
  await card("Apple · 毛玻璃").locator(".skin-actions st-button").click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.skin), { timeout: 5_000 })
    .toBe("apple");
  expect(await themeState()).toMatchObject({ seed: "#007aff", primary: undefined });

  // shadcn：官方 zinc 灰阶（三个品牌角色都固定为灰）
  await card("shadcn · 扁平").locator(".skin-actions st-button").click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.skin), { timeout: 5_000 })
    .toBe("shadcn");
  const shadcn = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("st-color-config") || "{}");
    return { seed: saved.seed, overrides: saved.overrides };
  });
  expect(shadcn.seed).toBe("#18181b");
  expect(shadcn.overrides).toEqual({
    primary: "#18181b",
    secondary: "#3f3f46",
    tertiary: "#52525b",
  });

  // 回到 M3：恢复进入 Apple 之前的默认配色
  await card("Android · Material 3").locator(".skin-actions st-button").click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.skin), { timeout: 5_000 })
    .toBe("m3");
  expect(await themeState()).toMatchObject({ seed: "#0061a4", primary: undefined });

  // 再回 Apple：从主题槽位恢复，而不是重新生成
  await card("Apple · 毛玻璃").locator(".skin-actions st-button").click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.skin), { timeout: 5_000 })
    .toBe("apple");
  expect(await themeState()).toMatchObject({ seed: "#007aff", primary: undefined });
});

test("主题预览：刷新和切页后仍按各自官方配色渲染", async ({ page }) => {
  await page.goto("/site/skins.html", { waitUntil: "networkidle", timeout: 60_000 });
  await page.evaluate(() => localStorage.clear());
  await page.reload({ waitUntil: "networkidle", timeout: 60_000 });
  await page.locator(".skin-card").first().waitFor({ state: "visible" });

  // 选 shadcn，再把站点切到其他页面并刷新，最后从 header 回皮肤页
  const shadcnCard = page.locator(".skin-card").filter({ hasText: "shadcn · 扁平" });
  await shadcnCard.locator(".skin-actions st-button").click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.skin), { timeout: 5_000 })
    .toBe("shadcn");

  await page.goto("/site/docs/button.html", { waitUntil: "networkidle", timeout: 60_000 });
  await page.reload({ waitUntil: "networkidle", timeout: 60_000 });
  await page.locator(".layout-nav st-button").filter({ hasText: "皮肤" }).click();
  await page.waitForURL("**/site/skins.html", { timeout: 30_000 });
  await page.locator(".skin-card").first().waitFor({ state: "visible" });
  await page.waitForTimeout(800);

  const state = await page.evaluate(() => {
    const find = (root, sel) => {
      const el = root.querySelector(sel);
      if (el) return el;
      for (const child of root.querySelectorAll("*")) {
        if (child.shadowRoot) {
          const found = find(child.shadowRoot, sel);
          if (found) return found;
        }
      }
      return null;
    };
    const ids = ["m3", "apple", "windows", "shadcn", "cyberpunk"];
    const primaries = {};
    for (const id of ids) {
      const el = find(document, `.skin-preview[data-skin="${id}"]`);
      primaries[id] = el?.style.getPropertyValue("--md-sys-color-primary") || "";
    }
    return {
      api: !!(window.__site?.applyTheme && window.__site?.previewThemes),
      primaries,
    };
  });
  expect(state.api).toBe(true);
  for (const value of Object.values(state.primaries)) expect(value).not.toBe("");
  expect(state.primaries.m3).not.toBe(state.primaries.shadcn);
  expect(state.primaries.apple).not.toBe(state.primaries.shadcn);
  expect(state.primaries.cyberpunk).not.toBe(state.primaries.shadcn);
  expect(new Set(Object.values(state.primaries)).size).toBeGreaterThanOrEqual(4);
});

test("离开 Cyberpunk：恢复进入前的配色与主题模式", async ({ page }) => {
  await page.goto("/site/skins.html");
  await page.evaluate(() => {
    localStorage.clear();
    localStorage.setItem(
      "st-color-config",
      JSON.stringify({
        seed: "#336699",
        overrides: { error: "#aa0000" },
        customs: [{ name: "brand", color: "#12ab34" }],
      })
    );
    localStorage.setItem("st-theme-mode", "light");
  });
  await page.reload();
  await page.locator(".skin-card").first().waitFor({ state: "visible" });

  const cyberpunk = page.locator(".skin-card").filter({ hasText: "Cyberpunk · 霓虹终端" });
  const m3 = page.locator(".skin-card").filter({ hasText: "Android · Material 3" });

  // 进入 Cyberpunk：深色 + 洋红/青
  await cyberpunk.locator(".skin-actions st-button").filter({ hasText: "使用此主题" }).click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.skin), { timeout: 5_000 })
    .toBe("cyberpunk");
  expect(await page.evaluate(() => document.documentElement.classList.contains("st-dark"))).toBe(true);

  // 从皮肤页切回 M3：颜色与浅色模式都要回来
  await m3.locator(".skin-actions st-button").click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.skin), { timeout: 5_000 })
    .toBe("m3");
  const restored = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("st-color-config") || "{}");
    return {
      dark: document.documentElement.classList.contains("st-dark"),
      light: document.documentElement.classList.contains("st-light"),
      mode: localStorage.getItem("st-theme-mode"),
      seed: saved.seed,
      error: saved.overrides?.error,
      customs: saved.customs,
      backup: localStorage.getItem("st-cyberpunk-backup"),
    };
  });
  expect(restored.dark).toBe(false);
  expect(restored.light).toBe(true);
  expect(restored.mode).toBe("light");
  expect(restored.seed).toBe("#336699");
  expect(restored.error).toBe("#aa0000");
  expect(restored.customs).toEqual([{ name: "brand", color: "#12ab34" }]);
  expect(restored.backup).toBeNull();

  // header 菜单切走也同样恢复
  await cyberpunk.locator(".skin-actions st-button").filter({ hasText: "使用此主题" }).click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.skin), { timeout: 5_000 })
    .toBe("cyberpunk");
  await page.locator("#skin-menu st-icon-button").click();
  await page.locator("#skin-menu st-menu-item").filter({ hasText: "M3 主题" }).click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.skin), { timeout: 5_000 })
    .toBe("m3");
  const viaHeader = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("st-color-config") || "{}");
    return {
      dark: document.documentElement.classList.contains("st-dark"),
      mode: localStorage.getItem("st-theme-mode"),
      seed: saved.seed,
      error: saved.overrides?.error,
    };
  });
  expect(viaHeader.dark).toBe(false);
  expect(viaHeader.mode).toBe("light");
  expect(viaHeader.seed).toBe("#336699");
  expect(viaHeader.error).toBe("#aa0000");

  // 跨页：在 docs 子页用 header 切走也要恢复
  // （SCSR 子页不执行 layout 的 body 脚本，restore 走 layout 页面模块里的动态 import）
  await cyberpunk.locator(".skin-actions st-button").filter({ hasText: "使用此主题" }).click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.skin), { timeout: 5_000 })
    .toBe("cyberpunk");
  await page.goto("/site/docs/button.html", { waitUntil: "networkidle" });
  await page.locator("#skin-menu st-icon-button").waitFor({ state: "visible" });
  await page.locator("#skin-menu st-icon-button").click();
  await page.locator("#skin-menu st-menu-item").filter({ hasText: "M3 主题" }).click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.skin), { timeout: 5_000 })
    .toBe("m3");
  const crossPage = await page.evaluate(() => {
    const saved = JSON.parse(localStorage.getItem("st-color-config") || "{}");
    return {
      dark: document.documentElement.classList.contains("st-dark"),
      mode: localStorage.getItem("st-theme-mode"),
      seed: saved.seed,
      error: saved.overrides?.error,
      backup: localStorage.getItem("st-cyberpunk-backup"),
    };
  });
  expect(crossPage.dark).toBe(false);
  expect(crossPage.mode).toBe("light");
  expect(crossPage.seed).toBe("#336699");
  expect(crossPage.error).toBe("#aa0000");
  expect(crossPage.backup).toBeNull();
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

  // 菜单弹层也要有毛玻璃；header 的毛玻璃必须挂在外层 ::before 上，
  // 否则 header 自身会成为 backdrop root，后代菜单只能模糊 header 内部
  await page.locator("#skin-menu st-icon-button").click();
  await page.waitForTimeout(250);
  const glass = await page.evaluate(() => {
    const find = (root, sel) => {
      const d = root.querySelector(sel);
      if (d) return d;
      for (const el of root.querySelectorAll("*")) {
        if (el.shadowRoot) {
          const r = find(el.shadowRoot, sel);
          if (r) return r;
        }
      }
      return null;
    };
    const header = find(document, "header.top");
    const menu = find(document, "#skin-menu");
    return {
      panelBlur: getComputedStyle(menu.shadowRoot.querySelector(".panel")).backdropFilter,
      headerBlur: getComputedStyle(header).backdropFilter,
      headerLayerBlur: getComputedStyle(header, "::before").backdropFilter,
    };
  });
  expect(glass.panelBlur).toContain("blur(8px)");
  expect(glass.headerBlur).toBe("none");
  expect(glass.headerLayerBlur).toContain("blur(18px)");

  // 再切回 m3，避免影响同页后续交互
  await page.locator("#skin-menu st-menu-item").filter({ hasText: "M3 主题" }).click();
  await expect
    .poll(() => page.evaluate(() => document.documentElement.dataset.skin), { timeout: 5_000 })
    .toBe("m3");
});

test("官网环境光：Apple 毛玻璃下增强，M3/windows/shadcn 保持低调", async ({ page }) => {
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
      duration: parseFloat(getComputedStyle(el.querySelector(".orb-a")).animationDuration),
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
  const strongAmbient = await ambient();
  expect(strongAmbient.animation).toBe("st-ambient-drift");
  expect(parseFloat(strongAmbient.opacity)).toBeGreaterThan(0.95);
  // 玻璃下颜色更深、漂移更快，才能看出材质后面的色彩层次
  expect(strongAmbient.duration).toBeLessThan(20);
  const glass = await page.evaluate(() => {
    const page = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".comp-grid")
    );
    const grid = page.shadowRoot.querySelector(".comp-grid");
    const card = grid.querySelector(".comp");
    const component = card.querySelector(".comp-preview st-button");
    return {
      glass: grid.classList.contains("glass"),
      cardBlur: getComputedStyle(card).backdropFilter,
      cardBg: getComputedStyle(card).backgroundColor,
      componentBlur: component ? getComputedStyle(component).backdropFilter : "",
    };
  });
  expect(glass.glass).toBe(true);
  /* 展示卡片只做透明外壳，不预先模糊背景；毛玻璃由卡片内的组件自己承担 */
  expect(glass.cardBlur).toBe("none");
  expect(glass.cardBg).toBe("rgba(0, 0, 0, 0)");
  expect(glass.componentBlur).toContain("blur(18px)");

  await page.locator("#skin-menu st-icon-button").click();
  await page.locator("#skin-menu st-menu-item").filter({ hasText: "M3 主题" }).click();
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
    const input = stage.querySelector("st-input");
    return {
      demoBg: getComputedStyle(demo).backgroundColor,
      demoBlur: getComputedStyle(demo).backdropFilter,
      stageBg: getComputedStyle(stage).backgroundColor,
      inputBlur: input ? getComputedStyle(input).backdropFilter : "",
    };
  });
  /* 示例容器透明且不模糊背景，玻璃感来自示例里的组件本身 */
  expect(state.demoBg).toBe("rgba(0, 0, 0, 0)");
  expect(state.demoBlur).toBe("none");
  expect(state.stageBg).toBe("rgba(0, 0, 0, 0)");
  expect(state.inputBlur).toContain("blur(18px)");

  await page.locator("#skin-menu st-icon-button").click();
  await page.locator("#skin-menu st-menu-item").filter({ hasText: "M3 主题" }).click();
});

test("文档示例容器不裁剪下拉弹层", async ({ page }) => {
  await page.goto("/site/docs/select.html");
  await page.waitForTimeout(1500);
  const state = await page.evaluate(() => {
    const find = (root, sel) => {
      const d = root.querySelector(sel);
      if (d) return d;
      for (const el of root.querySelectorAll("*")) {
        if (el.shadowRoot) {
          const r = find(el.shadowRoot, sel);
          if (r) return r;
        }
      }
      return null;
    };
    const demo = find(document, ".demo");
    const top = demo.querySelector(".demo-top");
    const stage = demo.querySelector(".demo-stage");
    return {
      overflow: getComputedStyle(demo).overflow,
      topRadius: getComputedStyle(top).borderTopLeftRadius,
      stageRadius: getComputedStyle(stage).borderBottomLeftRadius,
    };
  });
  // 弹层（st-select / st-menu）必须能溢出示例容器，圆角由内层自己收口
  expect(state.overflow).toBe("visible");
  expect(parseFloat(state.topRadius)).toBeGreaterThan(10);
  expect(parseFloat(state.stageRadius)).toBeGreaterThan(10);
});

test("文档侧栏按使用频率排序：Ripple 等低频组件靠后", async ({ page }) => {
  await page.goto("/site/docs/input.html");
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll("o-page")].some(
        (op) => op.shadowRoot && op.shadowRoot.querySelector(".docs-side")
      ),
    null,
    { timeout: 30_000 }
  );
  const state = await page.evaluate(() => {
    const docs = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".docs-side")
    );
    const sr = docs.shadowRoot;
    return {
      groups: [...sr.querySelectorAll(".side-group")].map((el) => el.textContent.trim()),
      items: [...sr.querySelectorAll(".docs-side st-list-item")].map((el) =>
        el.textContent.replace(/\s+/g, " ").trim()
      ),
    };
  });
  expect(state.groups).toEqual(["基础", "表单", "反馈", "内容", "导航", "辅助"]);
  const labels = state.items.map((x) => x.replace(/^(概览|Button|Input|Textarea|Select|Checkbox|Switch|Radio|Slider|Dialog|Menu|Snackbar|Progress|Card|Badges|List|Tabs|Navigation|Collapse|Tooltip|Ripple|Command tools).*$/, "$1"));
  expect(labels[0]).toBe("概览");
  expect(labels[1]).toBe("Button");
  expect(labels.indexOf("Ripple")).toBeGreaterThan(labels.indexOf("Navigation"));
  expect(labels.indexOf("Ripple")).toBeGreaterThan(labels.indexOf("Tooltip"));
});

test("皮肤页：M3 改色与加色（种子色 / 自定义变量 / 持久化 / 重置）", async ({ page }) => {
  await page.goto("/site/skins.html", { waitUntil: "networkidle", timeout: 60_000 });
  await page.locator(".color-lab").waitFor({ state: "visible" });
  await expect(page.locator(".role-row")).toHaveCount(5);

  // 面板复用皮肤卡片材质：Apple 下是半透明 + backdrop blur
  await page.evaluate(() => {
    document.documentElement.dataset.skin = "apple";
  });
  await expect
    .poll(() =>
      page.locator(".color-panel").evaluate((el) => getComputedStyle(el).backdropFilter)
    )
    .toContain("blur");
  await page.evaluate(() => {
    document.documentElement.dataset.skin = "m3";
  });

  // 改种子色：即时重算 CSS 变量，并写入 st-color-config
  const seed = page.locator(".hex-input");
  await seed.fill("#B3261E");
  await seed.blur();
  await expect
    .poll(() => page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--md-sys-color-primary").trim()))
    .not.toBe("#0061a4");
  const savedSeed = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("st-color-config") || "{}")
  );
  expect(savedSeed.seed).toBe("#b3261e");
  await expect(page.locator(".color-status")).toContainText("已应用");

  // 加色：追加 brand 四配对 token，并能在组件里用 color="brand"
  await page.locator(".custom-add").click();
  await expect(page.locator(".custom-row")).toHaveCount(1);
  await expect(page.locator(".custom-row code")).toHaveText("--brand");
  await expect(page.locator(".token-list .token")).toHaveCount(7); // 3 角色 + 4 自定义
  await expect(page.locator(".custom-buttons st-button")).toContainText("brand");
  expect(
    await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--brand").trim()
    )
  ).toMatch(/^#[0-9a-f]{6}$/);

  // 改名 + 换色
  const name = page.locator(".name-input");
  await name.fill("accent");
  await name.blur();
  await expect(page.locator(".custom-row code")).toHaveText("--accent");
  await page.locator(".custom-row .role-color").evaluate((input) => {
    input.value = "#00aa66";
    input.dispatchEvent(new Event("input", { bubbles: true }));
  });
  await expect
    .poll(() =>
      page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--accent").trim())
    )
    .toMatch(/^#[0-9a-f]{6}$/);

  // 刷新后配置仍在
  await page.reload({ waitUntil: "networkidle" });
  await page.locator(".color-lab").waitFor({ state: "visible" });
  await expect(page.locator(".custom-row")).toHaveCount(1);
  await expect(page.locator(".hex-input")).toHaveValue("#b3261e");
  await expect(page.locator(".name-input")).toHaveValue("accent");

  // 恢复默认
  await page.locator(".color-reset").click();
  await expect(page.locator(".custom-row")).toHaveCount(0);
  await expect(page.locator(".hex-input")).toHaveValue("#0061a4");
  await expect(page.locator(".color-status")).toContainText("已恢复默认");
  expect(await page.evaluate(() => localStorage.getItem("st-color-config"))).toBeNull();
  expect(
    await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue("--brand").trim()
    )
  ).toBe("");
});

test("皮肤页：可用色块变量按白天 / 黑夜面板展示，变量名可复制", async ({ page }) => {
  await page.context().grantPermissions(["clipboard-read", "clipboard-write"], {
    origin: "http://127.0.0.1:8642",
  });
  await page.goto("/site/skins.html", { waitUntil: "networkidle", timeout: 60_000 });
  await page.locator(".swatch-library").waitFor({ state: "visible" });

  await expect(page.locator(".swatch-panel")).toHaveCount(2);
  await expect(page.locator("#swatch-light .swatch-card")).toHaveCount(34);
  await expect(page.locator("#swatch-dark .swatch-card")).toHaveCount(34);

  const panels = await page.locator(".swatch-panel").evaluateAll((els) =>
    els.map((el) => ({
      bg: getComputedStyle(el).backgroundColor,
      token: el.querySelector(".swatch-token code").textContent,
      hex: el.querySelector(".swatch-block span").textContent,
      surface: getComputedStyle(el).getPropertyValue("--md-sys-color-surface-container").trim(),
    }))
  );
  expect(panels[0].token).toBe("--md-sys-color-primary");
  expect(panels[1].token).toBe("--md-sys-color-primary");
  expect(panels[0].hex).not.toBe(panels[1].hex);
  expect(panels[0].bg).not.toBe(panels[1].bg);
  expect(panels[0].surface).not.toBe(panels[1].surface);

  // 点击变量名复制 token 本身
  const firstLightToken = page.locator("#swatch-light .swatch-token").first();
  await firstLightToken.click();
  await expect(page.locator(".swatch-copy-status")).toHaveText(
    "已复制 --md-sys-color-primary"
  );
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    "--md-sys-color-primary"
  );

  const luminance = (rgb) => {
    const [r, g, b] = rgb.match(/\d+/g).map(Number);
    return r * 0.299 + g * 0.587 + b * 0.114;
  };
  expect(luminance(panels[0].bg)).toBeGreaterThan(luminance(panels[1].bg));
  for (const value of [panels[0].surface, panels[1].surface]) {
    expect(value).toMatch(/^#[0-9a-f]{6}$/);
  }

  // 改种子色后，两块面板里的 primary 色块都实时重算
  const lightHex = page.locator("#swatch-light .swatch-card").first().locator(".swatch-block span");
  const darkHex = page.locator("#swatch-dark .swatch-card").first().locator(".swatch-block span");
  const beforeLight = await lightHex.textContent();
  const beforeDark = await darkHex.textContent();
  await page.locator(".hex-input").fill("#b3261e");
  await page.locator(".hex-input").blur();
  await expect(lightHex).not.toHaveText(beforeLight);
  await expect(darkHex).not.toHaveText(beforeDark);

  // 自定义颜色同步展开为 4 个配对变量，并在两块面板中各出现一次
  await page.locator(".custom-add").click();
  await expect(page.locator("#swatch-light .swatch-card")).toHaveCount(38);
  await expect(page.locator("#swatch-dark .swatch-card")).toHaveCount(38);
  for (const selector of ["#swatch-light .swatch-token code", "#swatch-dark .swatch-token code"]) {
    const tokens = await page.locator(selector).allTextContents();
    expect(tokens).toContain("--brand");
    expect(tokens).toContain("--on-brand");
    expect(tokens).toContain("--brand-container");
    expect(tokens).toContain("--on-brand-container");
  }
});

test("从手记切到文档：二级 layout 的 list / select 依赖随父页加载", async ({ page }) => {
  await page.goto("/site/notes/index.html", { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForFunction(() =>
    [...document.querySelectorAll("o-page")].some(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav")
    )
  );
  await page.evaluate(() => {
    const layout = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".layout-nav")
    );
    [...layout.shadowRoot.querySelectorAll(".layout-nav st-button")]
      .find((b) => b.textContent.trim() === "文档")
      .click();
  });
  await page.waitForURL("**/site/docs/index.html", { timeout: 30_000 });
  await page.waitForFunction(() => {
    const docs = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".docs-side")
    );
    return !!(docs && docs.shadowRoot.querySelector(".docs-side st-list")?.shadowRoot);
  });
  // 切页动画期间离场页可能还在 slot 里，等侧栏真正参与布局再量高度
  await page.waitForFunction(
    () => {
      const docs = [...document.querySelectorAll("o-page")].find(
        (op) => op.shadowRoot && op.shadowRoot.querySelector(".docs-side")
      );
      const item = docs?.shadowRoot.querySelector(".docs-side st-list-item");
      return !!item && item.getBoundingClientRect().height > 20;
    },
    null,
    { timeout: 5_000 }
  );

  const state = await page.evaluate(() => {
    const docs = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".docs-side")
    );
    const sr = docs.shadowRoot;
    const list = sr.querySelector(".docs-side st-list");
    const item = sr.querySelector(".docs-side st-list-item");
    const picker = sr.querySelector(".docs-picker");
    return {
      listUpgraded: !!list?.shadowRoot,
      items: sr.querySelectorAll(".docs-side st-list-item").length,
      firstItemHeight: item?.getBoundingClientRect().height || 0,
      pickerUpgraded: !!picker?.shadowRoot,
    };
  });
  expect(state.listUpgraded).toBe(true);
  expect(state.items).toBe(22);
  expect(state.firstItemHeight).toBeGreaterThan(20);
  expect(state.pickerUpgraded).toBe(true);

  // 目标文档页自己的组件依赖也必须在 template 内：从手记进入时按钮组 / 分裂按钮要能升级
  await page.evaluate(() => {
    const docs = [...document.querySelectorAll("o-page")].find(
      (op) => op.shadowRoot && op.shadowRoot.querySelector(".docs-side")
    );
    [...docs.shadowRoot.querySelectorAll(".docs-side st-list-item")]
      .find((el) => el.textContent.includes("Button"))
      .click();
  });
  await page.waitForURL("**/site/docs/button.html", { timeout: 30_000 });
  await page.waitForFunction(
    () => {
      const walk = (root) => {
        for (const el of root.querySelectorAll("*")) {
          if (el.tagName === "ST-BUTTON-GROUP" && el.shadowRoot) return true;
          if (el.shadowRoot && walk(el.shadowRoot)) return true;
        }
        return false;
      };
      return walk(document);
    },
    null,
    { timeout: 15_000 }
  );
  const missing = await page.evaluate(() => {
    const missing = [];
    const walk = (root) => {
      for (const el of root.querySelectorAll("*")) {
        const tag = el.tagName.toLowerCase();
        if (tag.startsWith("st-") && !el.shadowRoot) missing.push(tag);
        if (el.shadowRoot) walk(el.shadowRoot);
      }
    };
    walk(document);
    return [...new Set(missing)];
  });
  expect(missing).toEqual([]);
});
