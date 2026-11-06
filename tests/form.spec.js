import { test, expect } from "@playwright/test";

async function ready(page) {
  await page.goto("/tests/fixtures/form.html");
  await page.waitForFunction(
    () =>
      ["f-input", "f-textarea", "f-select", "f-agree"].every(
        (id) => document.querySelector(`#${id}`)?.shadowRoot
      ),
    null,
    { timeout: 20_000 }
  );
}

test("form：name / value / checkbox / radio / select 全量进入 FormData", async ({ page }) => {
  await ready(page);
  await page.evaluate(() => {
    document.querySelector("#f-input").value = "alice";
    document.querySelector("#f-textarea").value = "hello";
    document.querySelector("#f-select").value = "sh";
    document.querySelector("#f-notify").setAttribute("checked", "");
  });
  await page.waitForTimeout(150);
  await page.click("#f-submit");
  await page.waitForTimeout(150);

  expect(await page.evaluate(() => window.events.includes("submit"))).toBe(true);
  expect(await page.evaluate(() => window.lastFormData)).toEqual({
    username: "alice",
    bio: "hello",
    city: "sh",
    agree: "yes",
    notify: "on",
    gender: "m",
    volume: "40",
  });
});

test("form：required 阻断提交，组件抛 invalid 并设置 aria-invalid", async ({ page }) => {
  await ready(page);
  await page.evaluate(() => {
    document.querySelector("#f-input").value = "";
    document.querySelector("#f-select").value = "";
  });
  await page.waitForTimeout(150);
  await page.click("#f-submit");
  await page.waitForTimeout(150);

  expect(await page.evaluate(() => window.events.includes("submit"))).toBe(false);
  expect(await page.evaluate(() => window.events.filter((e) => e.startsWith("invalid:")).length)).toBeGreaterThan(0);
  expect(await page.evaluate(() => document.querySelector("#form").checkValidity())).toBe(false);
  expect(
    await page.evaluate(() =>
      document.querySelector("#f-input").shadowRoot.querySelector("input").getAttribute("aria-invalid")
    )
  ).toBe("true");
});

test("form：indeterminate 复选框不提交值（原生 mixed 语义）", async ({ page }) => {
  await ready(page);
  const state = await page.evaluate(async () => {
    const cb = document.querySelector("#f-agree");
    cb.removeAttribute("checked");
    cb.setAttribute("indeterminate", "");
    await new Promise((r) => setTimeout(r, 200));
    const proxy = [...cb.children].find((node) => node.tagName === "INPUT");
    return {
      formData: Object.fromEntries(new FormData(document.querySelector("#form")).entries()),
      proxyChecked: proxy.checked,
      nativeIndeterminate: cb.shadowRoot.querySelector("input").indeterminate,
      nativeChecked: cb.shadowRoot.querySelector("input").checked,
    };
  });
  expect(state.formData.agree).toBeUndefined();
  expect(state.proxyChecked).toBe(false);
  expect(state.nativeIndeterminate).toBe(true);
  expect(state.nativeChecked).toBe(false);
});

test("form：reset 同步代理与可见组件", async ({ page }) => {
  await ready(page);
  await page.evaluate(() => {
    document.querySelector("#f-input").value = "changed";
    document.querySelector("#f-textarea").value = "changed bio";
    document.querySelector("#f-select").value = "sh";
    document.querySelector("#f-notify").setAttribute("checked", "");
    document.querySelector("#f-agree").removeAttribute("checked");
    document.querySelector("#f-volume").value = "80";
  });
  await page.waitForTimeout(150);
  await page.click("#f-reset");
  await page.waitForTimeout(200);

  const state = await page.evaluate(() => ({
    input: document.querySelector("#f-input").value,
    textarea: document.querySelector("#f-textarea").value,
    select: document.querySelector("#f-select").value,
    agree: document.querySelector("#f-agree").hasAttribute("checked"),
    notify: document.querySelector("#f-notify").hasAttribute("checked"),
    volume: document.querySelector("#f-volume").value,
    formData: Object.fromEntries(new FormData(document.querySelector("#form")).entries()),
  }));
  expect(state.input).toBe("guest");
  expect(state.textarea).toBe("initial");
  expect(state.select).toBe("bj");
  expect(state.agree).toBe(true);
  expect(state.notify).toBe(false);
  expect(state.volume).toBe("40");
  expect(state.formData).toMatchObject({ username: "guest", bio: "initial", city: "bj", agree: "yes", volume: "40" });
});
