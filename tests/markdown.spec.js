import { test, expect } from "@playwright/test";

const waitReady = async (page) => {
  await page.waitForFunction(
    () => {
      const md = document.querySelector("#md-static");
      return !!(
        md?.shadowRoot?.querySelector("h1") &&
        document.querySelector("#md-copy")?.shadowRoot?.querySelector(".copy")
      );
    },
    { timeout: 20_000 }
  );
  await page.waitForTimeout(250);
};

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/fixtures/markdown.html");
  await waitReady(page);
});

test("markdown：标题 / 列表 / 任务 / 引用 / 代码块 / 表格 / 行内标记完整渲染", async ({ page }) => {
  const state = await page.evaluate(() => {
    const md = document.querySelector("#md-static");
    const root = md.shadowRoot.querySelector(".content");
    const th = [...root.querySelectorAll("th")];
    const links = [...root.querySelectorAll("a")];
    const tasks = [...root.querySelectorAll(".task-box")];
    const code = root.querySelector(".code-block");
    return {
      headings: [...root.querySelectorAll("h1,h2")].map((el) => el.textContent),
      strong: root.querySelector("strong")?.textContent,
      em: root.querySelector("em")?.textContent,
      del: root.querySelector("del")?.textContent,
      inlineCode: root.querySelector('[part="inline-code"]')?.textContent,
      link: {
        href: root.querySelector("a")?.getAttribute("href"),
        target: root.querySelector("a")?.getAttribute("target"),
        rel: root.querySelector("a")?.getAttribute("rel"),
      },
      unsafeHref: links.some((a) => (a.getAttribute("href") || "").startsWith("javascript:")),
      lists: {
        ul: root.querySelectorAll("ul").length,
        ol: root.querySelectorAll("ol").length,
        nested: root.querySelectorAll("ul ul li").length,
      },
      tasks: tasks.map((input) => ({ checked: input.checked, disabled: input.disabled })),
      quote: root.querySelector("blockquote")?.textContent.replace(/\s+/g, " ").trim(),
      code: {
        lang: code?.querySelector(".code-lang")?.textContent,
        text: code?.querySelector("pre code")?.textContent,
        copy: !!code?.querySelector(".copy"),
        highlighted: !!code?.querySelector("pre code .tk-keyword"),
      },
      table: {
        align: th.map((cell) => cell.style.textAlign),
        headers: th.map((cell) => cell.textContent),
        rows: root.querySelectorAll("tbody tr").length,
      },
      hr: root.querySelectorAll("hr").length,
      image: root.querySelector("img")?.getAttribute("src")?.slice(0, 20),
      scriptElements: root.querySelectorAll("script").length,
      rawHtmlText: root.textContent.includes('<script>alert("nope")</script>'),
    };
  });

  expect(state.headings).toEqual(["一级标题", "列表"]);
  expect(state.strong).toBe("粗体");
  expect(state.em).toBe("斜体");
  expect(state.del).toBe("删除线");
  expect(state.inlineCode).toBe("行内代码");
  expect(state.link).toEqual({ href: "https://example.com", target: "_blank", rel: "noopener noreferrer" });
  expect(state.unsafeHref).toBe(false);
  expect(state.lists).toEqual({ ul: 2, ol: 1, nested: 2 });
  expect(state.tasks).toEqual([
    { checked: true, disabled: true },
    { checked: false, disabled: true },
  ]);
  expect(state.quote).toContain("引用内容");
  expect(state.quote).toContain("第二段");
  expect(state.code).toEqual({
    lang: "JS",
    text: "const answer = 42;\nconsole.log(answer);",
    copy: true,
    highlighted: true,
  });
  expect(state.table).toEqual({
    align: ["left", "center", "right"],
    headers: ["左", "中", "右"],
    rows: 1,
  });
  expect(state.hr).toBe(1);
  expect(state.image).toContain("data:image/png");
  expect(state.scriptElements).toBe(0);
  expect(state.rawHtmlText).toBe(true);
});

test("markdown：支持的语言复用 st-code 高亮，未知语言保持纯文本", async ({ page }) => {
  const state = await page.evaluate(() => {
    const blocks = [...document.querySelector("#md-lang").shadowRoot.querySelectorAll(".code-block")];
    return blocks.map((block) => ({
      lang: block.querySelector(".code-lang")?.textContent,
      text: block.querySelector("pre code")?.textContent,
      tokens: block.querySelectorAll("pre code [class^='tk-']").length,
    }));
  });
  expect(state[0]).toEqual({
    lang: "PYTHON",
    text: 'def greet(name):\n    return f"Hello, {name}"',
    tokens: 0,
  });
  expect(state[1].lang).toBe("JS");
  expect(state[1].text).toBe("const x = 1;");
  expect(state[1].tokens).toBeGreaterThan(0);
});

test("markdown：运行时 value / appendMarkdown / 流式未闭合代码块", async ({ page }) => {
  await page.evaluate(() => {
    document.querySelector("#md-runtime").value =
      "# 流式标题\n\n这是 **半截** 的代码：\n\n```js\nconst a = 1";
  });
  await page.waitForTimeout(120);

  const partial = await page.evaluate(() => {
    const root = document.querySelector("#md-runtime").shadowRoot.querySelector(".content");
    return {
      heading: root.querySelector("h1")?.textContent,
      strong: root.querySelector("strong")?.textContent,
      code: root.querySelector(".code-block pre code")?.textContent,
      hasLiteralFence: root.textContent.includes("```"),
    };
  });
  expect(partial).toEqual({
    heading: "流式标题",
    strong: "半截",
    code: "const a = 1",
    hasLiteralFence: false,
  });

  await page.evaluate(() => {
    document.querySelector("#md-runtime").appendMarkdown("\nconsole.log(a);\n```\n\n- 新增项");
  });
  await page.waitForTimeout(120);
  const completed = await page.evaluate(() => {
    const root = document.querySelector("#md-runtime").shadowRoot.querySelector(".content");
    return {
      code: root.querySelector(".code-block pre code")?.textContent,
      list: root.querySelector("li")?.textContent,
    };
  });
  expect(completed.code).toBe("const a = 1\nconsole.log(a);");
  expect(completed.list).toBe("新增项");
});

test("markdown：streaming 光标与 aria-busy", async ({ page }) => {
  await page.evaluate(() => {
    const md = document.querySelector("#md-runtime");
    md.value = "## 流式中\n\n正在输出";
    md.setAttribute("streaming", "");
  });
  await page.waitForTimeout(120);

  const on = await page.evaluate(() => {
    const md = document.querySelector("#md-runtime");
    const content = md.shadowRoot.querySelector(".content");
    return {
      cursor: getComputedStyle(content.querySelector(".cursor")).display,
      busy: content.getAttribute("aria-busy"),
      hostBusy: md.getAttribute("aria-busy"),
      cursorParent: content.querySelector(".cursor").parentElement.tagName,
    };
  });
  expect(on.cursor).toBe("inline-block");
  expect(on.busy).toBe("true");
  expect(on.hostBusy).toBe("true");
  expect(on.cursorParent).toBe("P");

  await page.evaluate(() => {
    document.querySelector("#md-runtime").removeAttribute("streaming");
  });
  await page.waitForTimeout(80);
  const off = await page.evaluate(() => {
    const md = document.querySelector("#md-runtime");
    return {
      cursor: getComputedStyle(md.shadowRoot.querySelector(".cursor")).display,
      hostBusy: md.getAttribute("aria-busy"),
    };
  });
  expect(off.cursor).toBe("none");
  expect(off.hostBusy).toBe("false");
});

test("markdown：breaks / 初始源码三种来源", async ({ page }) => {
  const state = await page.evaluate(() => {
    const br = (id) =>
      document.querySelector(`#${id}`).shadowRoot.querySelectorAll(".content br").length;
    return {
      breaks: br("md-breaks"),
      plain: br("md-plain"),
      template: document.querySelector("#md-template").shadowRoot.querySelector("h2")?.textContent,
      defaultValue: document.querySelector("#md-default").shadowRoot.querySelector("h2")?.textContent,
      staticHeading: document.querySelector("#md-static").shadowRoot.querySelector("h1")?.textContent,
      hiddenTextarea: getComputedStyle(
        document.querySelector("#md-static").querySelector("textarea")
      ).display,
    };
  });
  expect(state.breaks).toBe(1);
  expect(state.plain).toBe(0);
  expect(state.template).toBe("Template 标题");
  expect(state.defaultValue).toBe("Default 标题");
  expect(state.staticHeading).toBe("一级标题");
  expect(state.hiddenTextarea).toBe("none");
});

test("markdown：不安全链接退化为普通文字，正常链接保留", async ({ page }) => {
  const state = await page.evaluate(() => {
    const root = document.querySelector("#md-safe").shadowRoot.querySelector(".content");
    return {
      links: [...root.querySelectorAll("a")].map((a) => a.getAttribute("href")),
      text: root.textContent,
      hrefs: [...root.querySelectorAll("[href]")].map((el) => el.getAttribute("href")),
    };
  });
  expect(state.links).toEqual(["https://example.com"]);
  expect(state.hrefs.every((href) => !href.startsWith("javascript:"))).toBe(true);
  expect(state.text).toContain("危险");
});

test("markdown：代码块复制派发 copy 事件并写入剪贴板", async ({ page }) => {
  await page.evaluate(() => {
    window.__copied = "";
    navigator.clipboard.writeText = async (text) => {
      window.__copied = text;
    };
    window.__copyDetail = null;
    document.querySelector("#md-copy").addEventListener("copy", (event) => {
      window.__copyDetail = event.detail;
    });
    document.querySelector("#md-copy").shadowRoot.querySelector(".copy").click();
  });
  await page.waitForTimeout(150);
  const state = await page.evaluate(() => ({
    copied: window.__copied,
    detail: window.__copyDetail,
  }));
  expect(state.copied).toBe("<div>copy</div>");
  expect(state.detail).toEqual({ code: "<div>copy</div>", lang: "html" });
});

test("markdown：裸 URL 自动链接，snake_case 不被斜体", async ({ page }) => {
  const state = await page.evaluate(() => {
    const root = document.querySelector("#md-inline").shadowRoot.querySelector(".content");
    return {
      href: root.querySelector("a")?.getAttribute("href"),
      text: root.textContent,
      em: root.querySelector("em")?.textContent || null,
    };
  });
  expect(state.href).toBe("https://ofajs.com/path");
  expect(state.text).toContain("https://ofajs.com/path");
  expect(state.text).toContain("snake_case_value");
  expect(state.em).toBe(null);
});

test("markdown：局部 data-skin 的代码块材质继承", async ({ page }) => {
  const state = await page.evaluate(() => {
    const root = document.querySelector("#md-skin").shadowRoot;
    const block = root.querySelector(".code-block");
    const cs = getComputedStyle(block);
    return {
      backdrop: cs.backdropFilter,
      background: cs.backgroundColor,
      radius: cs.borderRadius,
      heading: root.querySelector("h2")?.textContent,
    };
  });
  expect(state.backdrop).toContain("blur");
  expect(state.background).not.toBe("rgba(0, 0, 0, 0)");
  expect(state.heading).toBe("Skin");
});
