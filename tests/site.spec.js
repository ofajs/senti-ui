import { test, expect } from "@playwright/test";

test.describe.configure({ timeout: 90_000 });

test("官网首页：29 个 st-* 标签全部升级，无页面错误", async ({ page }) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));

  await page.goto("/site/", { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForFunction(
    () => {
      const sr = document.querySelector("o-page") && document.querySelector("o-page").shadowRoot;
      return !!(sr && sr.querySelector("h1") && sr.querySelector("h1").textContent.includes("语义组件"));
    },
    null,
    { timeout: 30_000 }
  );
  await page.waitForTimeout(1200);

  const state = await page.evaluate(() => {
    const sr = document.querySelector("o-page").shadowRoot;
    const tags = [
      ...new Set(
        [...sr.querySelectorAll("*")]
          .map((el) => el.tagName.toLowerCase())
          .filter((tag) => tag.startsWith("st-"))
      ),
    ];
    return {
      tags,
      notReady: tags.filter((tag) => {
        const el = sr.querySelector(tag);
        return !el || !el.shadowRoot;
      }),
      heading: sr.querySelector("h1").textContent.trim(),
      sections: [...sr.querySelectorAll("main section.section[id]")].map((el) => el.id),
      path: location.pathname,
      hasOApp: !!document.querySelector("o-app"),
      templateRemoved: !document.querySelector("o-app template[page]"),
    };
  });

  expect(state.heading).toBe("语义组件，任意材质。");
  expect(state.tags).toHaveLength(29);
  expect(state.notReady).toEqual([]);
  // SCSR：目录形式直开时 URL 保持真实路径，template[page] 由 scsr 收编后移除
  expect(state.path).toBe("/site/");
  expect(state.hasOApp).toBe(true);
  expect(state.templateRemoved).toBe(true);
  expect(state.sections).toEqual([
    "why",
    "actions",
    "inputs",
    "feedback",
    "content",
    "navigation",
    "skins",
    "start",
  ]);
  expect(errors).toEqual([]);

  // SCSR 刷新：同一真实路径重新加载后仍能还原页面
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction(
    () => {
      const sr = document.querySelector("o-page") && document.querySelector("o-page").shadowRoot;
      return !!(sr && sr.querySelector("h1") && sr.querySelector("h1").textContent.includes("语义组件"));
    },
    null,
    { timeout: 30_000 }
  );
  expect(await page.evaluate(() => location.pathname)).toBe("/site/");
});

test("SCSR：index.html 真实路径可直达", async ({ page }) => {
  await page.goto("/site/index.html", { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForFunction(
    () => {
      const sr = document.querySelector("o-page") && document.querySelector("o-page").shadowRoot;
      return !!(sr && sr.querySelector("h1") && sr.querySelector("h1").textContent.includes("语义组件"));
    },
    null,
    { timeout: 30_000 }
  );
  const state = await page.evaluate(() => ({
    path: location.pathname,
    title: document.title,
    templateRemoved: !document.querySelector("o-app template[page]"),
  }));
  expect(state.path).toBe("/site/index.html");
  expect(state.title).toBe("Senti-UI — 语义组件，任意材质");
  expect(state.templateRemoved).toBe(true);
});

test("官网首页：皮肤、主题与对话框交互可用", async ({ page }) => {
  await page.goto("/site/", { waitUntil: "networkidle", timeout: 60_000 });
  await page.waitForFunction(
    () => {
      const sr = document.querySelector("o-page") && document.querySelector("o-page").shadowRoot;
      return !!(sr && sr.querySelector(".skin-pick"));
    },
    null,
    { timeout: 30_000 }
  );

  // 皮肤：切到 shadcn，圆角立即变成 6px 级
  await page.locator(".skin-pick").filter({ hasText: "shadcn" }).click();
  await page.waitForFunction(() => document.documentElement.dataset.skin === "shadcn");
  const radius = await page.evaluate(() => {
    const sr = document.querySelector("o-page").shadowRoot;
    return parseFloat(getComputedStyle(sr.querySelector(".skin-pick")).borderRadius);
  });
  expect(radius).toBeGreaterThan(5);
  expect(radius).toBeLessThan(8);

  // 主题：auto → light → dark
  const themeBtn = page.locator("button.top-btn").first();
  await themeBtn.click();
  await themeBtn.click();
  await page.waitForFunction(() => document.documentElement.classList.contains("st-dark"));
  expect(await page.evaluate(() => localStorage.getItem("st-theme-mode"))).toBe("dark");

  // 对话框：按钮打开、Escape 关闭
  await page.getByText("打开对话框", { exact: true }).click();
  await page.waitForFunction(
    () => document.querySelector("o-page").shadowRoot.querySelector("st-dialog").hasAttribute("open")
  );
  await page.keyboard.press("Escape");
  await page.waitForFunction(
    () => !document.querySelector("o-page").shadowRoot.querySelector("st-dialog").hasAttribute("open")
  );
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
