import { test, expect } from "@playwright/test";

async function ready(page, selector) {
  await page.waitForFunction(
    (sel) => {
      const el = document.querySelector(sel);
      // 内部 combobox 可聚焦，以此作为升级完成标志
      return el && el.shadowRoot && el.shadowRoot.querySelector("#st-control")?.tabIndex === 0;
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
  expect(await page.evaluate(() => document.querySelector("#sel-default").value)).toBe("b");
  const text = await page.evaluate(
    () => document.querySelector("#sel-default").shadowRoot.querySelector("#st-label").textContent
  );
  expect(text).toContain("乙");
});

test("非法 value 被清空，不把不存在的值提交给表单代理", async ({ page }) => {
  const state = await page.evaluate(async () => {
    const el = document.querySelector("#sel-basic");
    el.value = "not-an-option";
    await new Promise((r) => setTimeout(r, 200));
    const proxy = [...el.children].find((node) => node.tagName === "INPUT");
    return {
      value: el.value,
      label: el.shadowRoot.querySelector("#st-label").textContent,
      proxy: proxy?.value,
    };
  });
  expect(state.value).toBe("");
  expect(state.label).toBe("请选择");
  expect(state.proxy).toBe("");
});

test("宿主 el.focus() / el.blur() 桥接到内部 combobox", async ({ page }) => {
  const state = await page.evaluate(() => {
    const el = document.querySelector("#sel-basic");
    const control = el.shadowRoot.querySelector("#st-control");
    el.focus();
    const focused = el.shadowRoot.activeElement === control;
    el.blur();
    return { focused, blurred: el.shadowRoot.activeElement !== control };
  });
  expect(state).toEqual({ focused: true, blurred: true });
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
  await page.locator("#sel-basic #st-control").focus();
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

test("st-option：default-value 初始化 + label 属性控制闭合态文本", async ({ page }) => {
  expect(await page.evaluate(() => document.querySelector("#sel-st-option").value)).toBe("relay");
  const label = await page.evaluate(
    () => document.querySelector("#sel-st-option").shadowRoot.querySelector("#st-label").textContent
  );
  // 闭合态显示 label 属性（"邀请码"），不拼接插槽内多语言富内容
  expect(label).toBe("邀请码");
});

test("st-option：闭合态显示选项图标，label 仍控制文本", async ({ page }) => {
  const labelState = () =>
    page.evaluate(() => {
      const label = document
        .querySelector("#sel-icon-option")
        .shadowRoot.querySelector("#st-label");
      return {
        html: label.innerHTML,
        text: label.textContent,
        svg: label.querySelectorAll("svg").length,
        hasIcon: label.classList.contains("has-icon"),
      };
    });

  let state = await labelState();
  expect(state.hasIcon).toBe(true);
  expect(state.svg).toBe(1);
  // 图标没有文字，label.textContent 仍是 label 属性
  expect(state.text).toBe("通知");

  // 切到没有图标的选项，图标移除
  await page.locator("#sel-icon-option").click();
  await page.locator("#sel-icon-option .opt").filter({ hasText: "首页" }).click();
  state = await labelState();
  expect(state.hasIcon).toBe(false);
  expect(state.svg).toBe(0);
  expect(state.text).toBe("首页");
});

test("st-option：点击选中富内容项，value 与 change 正常", async ({ page }) => {
  await page.locator("#sel-st-option").click();
  await page.locator("#sel-st-option .opt").filter({ hasText: "Direct" }).click();

  expect(await page.evaluate(() => document.querySelector("#sel-st-option").value)).toBe("direct");
  const label = await page.evaluate(
    () => document.querySelector("#sel-st-option").shadowRoot.querySelector("#st-label").textContent
  );
  expect(label).toBe("直连");
  const events = await page.evaluate(() =>
    window.events.filter((e) => e.id === "sel-st-option" && e.type === "change")
  );
  expect(events).toHaveLength(1);
  expect(events[0].value).toBe("direct");
});

test("st-option：value 缺省时取 label 属性", async ({ page }) => {
  await page.locator("#sel-st-option").click();
  await page.locator("#sel-st-option .opt").filter({ hasText: "缺省 value 演示" }).click();

  expect(await page.evaluate(() => document.querySelector("#sel-st-option").value)).toBe("无value取label");
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

test("disabled 选项不可点、方向键跳过", async ({ page }) => {
  await page.locator("#sel-basic").click();
  await page.locator("#sel-basic .opt").filter({ hasText: "榴莲" }).click({ force: true });
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => document.querySelector("#sel-basic").value)).toBe("");

  await page.keyboard.press("Escape");
  await page.waitForTimeout(250);
  await page.locator("#sel-basic #st-control").focus();
  await page.keyboard.press("Enter"); // 打开，激活 apple
  await page.keyboard.press("ArrowDown"); // banana
  await page.keyboard.press("ArrowDown"); // 跳过榴莲 → cherry
  await page.keyboard.press("Enter");
  expect(await page.evaluate(() => document.querySelector("#sel-basic").value)).toBe("cherry");
});

test("optgroup：分组标题渲染，整组 disabled 时选项不可选", async ({ page }) => {
  await page.locator("#sel-group").click();
  await page.waitForTimeout(150);
  const state = await page.evaluate(() => {
    const el = document.querySelector("#sel-group");
    const labels = [...el.shadowRoot.querySelectorAll(".group-label")].map((n) => n.textContent);
    const melon = [...el.shadowRoot.querySelectorAll(".opt")].find((n) => n.textContent.includes("甜瓜"));
    return {
      labels,
      disabled: melon?.hasAttribute("data-disabled"),
      ariaDisabled: melon?.getAttribute("aria-disabled"),
      groupRoles: [...el.shadowRoot.querySelectorAll(".group")].map((n) => n.getAttribute("role")),
    };
  });
  expect(state.labels).toEqual(["水果", "禁用组"]);
  expect(state.disabled).toBe(true);
  expect(state.ariaDisabled).toBe("true");
  expect(state.groupRoles).toEqual(["group", "group"]);

  await page.locator("#sel-group .opt").filter({ hasText: "甜瓜" }).click({ force: true });
  await page.waitForTimeout(150);
  expect(await page.evaluate(() => document.querySelector("#sel-group").value)).toBe("");
});

test("重复 value：按选项下标选中，不会同时高亮多项", async ({ page }) => {
  await page.locator("#sel-duplicate").click();
  await page.locator("#sel-duplicate .opt").filter({ hasText: "B" }).click();
  await page.waitForTimeout(150);
  const second = await page.evaluate(() => {
    const el = document.querySelector("#sel-duplicate");
    return {
      value: el.value,
      label: el.shadowRoot.querySelector("#st-label").textContent,
      selected: el.shadowRoot.querySelectorAll('.opt[data-selected=""]').length,
    };
  });
  expect(second).toEqual({ value: "same", label: "B", selected: 1 });

  await page.locator("#sel-duplicate").click();
  await page.locator("#sel-duplicate .opt").filter({ hasText: "A" }).click();
  await page.waitForTimeout(150);
  expect(
    await page.evaluate(() => document.querySelector("#sel-duplicate").shadowRoot.querySelector("#st-label").textContent)
  ).toBe("A");
});
