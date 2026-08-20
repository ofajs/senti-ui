import { test, expect } from "@playwright/test";

async function ready(page) {
  await page.waitForFunction(
    () => {
      const sb = document.querySelector("#sb-auto");
      const cl = document.querySelector("#cl-demo");
      return (
        sb && sb.shadowRoot && cl && cl.shadowRoot && cl.shadowRoot.querySelector(".content")
      );
    },
    { timeout: 15_000 }
  );
}

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/fixtures/feedback.html");
  await ready(page);
});

// ---------- st-snackbar ----------

test("snackbar：默认隐藏，open 属性显示", async ({ page }) => {
  expect(
    await page.evaluate(() => getComputedStyle(document.querySelector("#sb-manual")).display)
  ).toBe("none");
  await page.evaluate(() => document.querySelector("#sb-manual").setAttribute("open", ""));
  expect(
    await page.evaluate(() => getComputedStyle(document.querySelector("#sb-manual")).display)
  ).toBe("inline-flex");
});

test("snackbar：duration 到时自动关闭并派发 close", async ({ page }) => {
  await page.evaluate(() => document.querySelector("#sb-auto").setAttribute("open", ""));
  await page.waitForTimeout(600);
  expect(
    await page.evaluate(() => document.querySelector("#sb-auto").hasAttribute("open"))
  ).toBe(false);
  expect(await page.evaluate(() => window.events)).toEqual([{ id: "sb-auto", type: "close" }]);
});

test("snackbar：hide() 手动关闭派发 close，removeAttribute 不派发", async ({ page }) => {
  await page.evaluate(() => {
    document.querySelector("#sb-manual").setAttribute("open", "");
  });
  await page.waitForTimeout(100);
  await page.evaluate(() => document.querySelector("#sb-manual").removeAttribute("open"));
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.events)).toEqual([]);

  await page.evaluate(() => document.querySelector("#sb-manual").setAttribute("open", ""));
  await page.waitForTimeout(100);
  await page.evaluate(() => document.querySelector("#sb-manual").hide());
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.events)).toEqual([{ id: "sb-manual", type: "close" }]);
});

// ---------- st-collapse ----------

test("collapse：hide 属性高度为 0，移除后展开为内容高度", async ({ page }) => {
  const hidden = await page.evaluate(
    () => document.querySelector("#cl-demo").getBoundingClientRect().height
  );
  expect(hidden).toBe(0);

  await page.evaluate(() => document.querySelector("#cl-demo").removeAttribute("hide"));
  await page.waitForTimeout(500); // 等高度过渡完成
  const h = await page.evaluate(() => document.querySelector("#cl-demo").getBoundingClientRect().height);
  expect(h).toBeGreaterThan(40);
});

test("collapse：内容尺寸变化自动跟随高度", async ({ page }) => {
  await page.evaluate(() => document.querySelector("#cl-demo").removeAttribute("hide"));
  await page.waitForTimeout(500);
  const before = await page.evaluate(
    () => document.querySelector("#cl-demo").getBoundingClientRect().height
  );
  await page.evaluate(() => {
    const div = document.querySelector("#cl-demo div");
    div.style.padding = "60px";
  });
  await page.waitForTimeout(500);
  const after = await page.evaluate(
    () => document.querySelector("#cl-demo").getBoundingClientRect().height
  );
  expect(after).toBeGreaterThan(before + 60);
});
