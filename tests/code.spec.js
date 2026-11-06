import { test, expect } from "@playwright/test";

async function ready(page) {
  await page.goto("/tests/fixtures/code.html");
  await page.waitForFunction(
    () =>
      ["c-html", "c-js", "c-off", "c-dyn", "c-sass"].every(
        (id) => document.querySelector(`#${id}`)?.shadowRoot?.querySelector("code")
      ),
    { timeout: 20_000 }
  );
}

test.beforeEach(async ({ page }) => {
  await ready(page);
});

test("code：shell 可见并占满容器宽度", async ({ page }) => {
  const state = await page.evaluate(() => {
    const el = document.querySelector("#c-html");
    const shell = el.shadowRoot.querySelector(".shell");
    const rect = shell.getBoundingClientRect();
    return {
      display: getComputedStyle(shell).display,
      width: rect.width,
      height: rect.height,
      hostWidth: el.getBoundingClientRect().width,
    };
  });
  expect(state.display).toBe("block");
  expect(state.width).toBeGreaterThan(200);
  expect(state.height).toBeGreaterThan(50);
  expect(state.width).toBeCloseTo(state.hostWidth, 0);
});

test("code：默认无浏览器外壳，frame 才有顶栏 / 复制", async ({ page }) => {
  const state = await page.evaluate(() => {
    const plain = document.querySelector("#c-off");
    const framed = document.querySelector("#c-html");
    const head = (el) => getComputedStyle(el.shadowRoot.querySelector(".head")).display;
    const shell = (el) => getComputedStyle(el.shadowRoot.querySelector(".shell"));
    return {
      plainHead: head(plain),
      framedHead: head(framed),
      plainBg: shell(plain).backgroundColor,
      plainShadow: shell(plain).boxShadow,
    };
  });
  expect(state.plainHead).toBe("none");
  expect(state.framedHead).toBe("flex");
  expect(state.plainBg).toBe("rgba(0, 0, 0, 0)");
  expect(state.plainShadow).toBe("none");
});

test("code：template 内 HTML 保留标签，script 不执行", async ({ page }) => {
  const state = await page.evaluate(() => {
    const el = document.querySelector("#c-html");
    const text = el.shadowRoot.querySelector("code").textContent;
    return {
      text,
      executed: window.__executed === true,
      tokens: el.shadowRoot.querySelectorAll("code span").length,
      title: el.shadowRoot.querySelector(".title").textContent,
    };
  });
  expect(state.executed).toBe(false);
  expect(state.text).toContain('<div class="card">');
  expect(state.text).toContain("<script>");
  expect(state.text).toContain("window.__executed = true");
  expect(state.tokens).toBeGreaterThan(5);
  expect(state.title).toBe("index.html");
});

test("code：textarea 作为无 template 源码容器，script 不执行", async ({ page }) => {
  const state = await page.evaluate(() => {
    const el = document.querySelector("#c-textarea");
    return {
      text: el.shadowRoot.querySelector("code").textContent,
      executed: window.__textareaExecuted === true,
      hidden: el.querySelector("textarea").hidden,
    };
  });
  expect(state.executed).toBe(false);
  expect(state.hidden).toBe(true);
  expect(state.text).toContain("<div>TA</div>");
  expect(state.text).toContain("<script>");
});

test("code：auto 格式化 JS / CSS，format=off 保留原文", async ({ page }) => {
  const state = await page.evaluate(() => ({
    js: document.querySelector("#c-js").shadowRoot.querySelector("code").textContent,
    off: document.querySelector("#c-off").shadowRoot.querySelector("code").textContent,
  }));
  expect(state.js).toContain("const f = () => {");
  expect(state.js.split("\n").length).toBeGreaterThan(1);
  expect(state.off).toBe("const a={b:1};");
});

test("code：code 数据、语言别名与默认标题", async ({ page }) => {
  await page.evaluate(() => {
    document.querySelector("#c-dyn").code = ".a{color:red}";
  });
  await page.waitForFunction(
    () => document.querySelector("#c-dyn").shadowRoot.querySelector("code").textContent.includes(".a {")
  );
  const state = await page.evaluate(() => {
    const el = document.querySelector("#c-dyn");
    return {
      text: el.shadowRoot.querySelector("code").textContent,
      title: el.shadowRoot.querySelector(".title").textContent,
    };
  });
  expect(state.text).toBe(".a {\n  color: red\n}");
  expect(state.title).toBe("dynamic.css");
  expect(await page.evaluate(() => document.querySelector("#c-dyn").hasAttribute("code"))).toBe(false);
});

test("code：Sass 只做去公共缩进，不压平层级", async ({ page }) => {
  const text = await page.evaluate(
    () => document.querySelector("#c-sass").shadowRoot.querySelector("code").textContent
  );
  expect(text).toContain(".b\n  color: $a");
});

test("code：复制按钮写入剪贴板并派发 copy", async ({ page }) => {
  await page.evaluate(() => {
    window.__copied = "";
    navigator.clipboard.writeText = async (text) => {
      window.__copied = text;
    };
    document.querySelector("#c-js").addEventListener("copy", () => window.__codeEvents.push("copy"));
    document.querySelector("#c-js").shadowRoot.querySelector(".copy").click();
  });
  await page.waitForTimeout(100);
  const state = await page.evaluate(() => ({
    copied: window.__copied,
    events: window.__codeEvents,
  }));
  expect(state.copied).toContain("const f = () => {");
  expect(state.events).toContain("copy");
});
