import { test, expect } from "@playwright/test";

const waitForShadow = async (page, selector) => {
  await page.waitForFunction(
    (sel) => !!document.querySelector(sel)?.shadowRoot,
    selector,
    { timeout: 20_000 }
  );
};

test.describe("无障碍基础", () => {
  test("button：插槽文字成为可访问名称，aria-label 可覆盖", async ({ page }) => {
    await page.goto("/tests/fixtures/button.html");
    await waitForShadow(page, "#btn-default");

    expect(await page.locator("#btn-default").ariaSnapshot()).toContain('button "Default"');

    await page.evaluate(() =>
      document.querySelector("#btn-default").setAttribute("aria-label", "确认操作")
    );
    await page.waitForTimeout(100);
    expect(await page.locator("#btn-default").ariaSnapshot()).toContain('button "确认操作"');
  });

  test("icon-button：title / aria-label 转发到内部原生 button", async ({ page }) => {
    await page.goto("/tests/fixtures/button.html");
    await waitForShadow(page, "#ib-standard");

    await page.evaluate(() =>
      document.querySelector("#ib-standard").setAttribute("aria-label", "设置")
    );
    await page.waitForTimeout(100);
    expect(await page.locator("#ib-standard").ariaSnapshot()).toContain('button "设置"');
  });

  test("checkbox / switch / radio：标签文字成为可访问名称", async ({ page }) => {
    await page.goto("/tests/fixtures/controls.html");
    await waitForShadow(page, "#cb-basic");

    expect(await page.locator("#cb-basic").ariaSnapshot()).toContain('checkbox "勾选"');
    expect(await page.locator("#sw-basic").ariaSnapshot()).toContain('checkbox "开关"');
    expect(await page.locator("#rd-a").ariaSnapshot()).toContain('radio "A"');
  });

  test("progress / card / snackbar / collapse：角色与状态", async ({ page }) => {
    await page.goto("/tests/fixtures/newcomp.html");
    await waitForShadow(page, "st-progress");

    expect(
      await page.evaluate(() => {
        const el = document.querySelector("#pg-60");
        return {
          role: el.getAttribute("role"),
          now: el.getAttribute("aria-valuenow"),
          min: el.getAttribute("aria-valuemin"),
          max: el.getAttribute("aria-valuemax"),
        };
      })
    ).toEqual({ role: "progressbar", now: "60", min: "0", max: "100" });

    expect(await page.locator("#card-click").ariaSnapshot()).toContain('button "可点击卡片"');

    await page.goto("/tests/fixtures/feedback.html");
    await waitForShadow(page, "#sb-color");
    expect(
      await page.evaluate(() => {
        const sb = document.querySelector("#sb-color");
        const collapse = document.querySelector("#cl-demo");
        return {
          role: sb.getAttribute("role"),
          live: sb.getAttribute("aria-live"),
          hidden: collapse.getAttribute("aria-hidden"),
          inert: collapse.inert,
        };
      })
    ).toEqual({ role: "status", live: "polite", hidden: "true", inert: true });

    await page.evaluate(() => document.querySelector("#cl-demo").removeAttribute("hide"));
    await page.waitForTimeout(400);
    expect(
      await page.evaluate(() => {
        const collapse = document.querySelector("#cl-demo");
        return { hidden: collapse.hasAttribute("aria-hidden"), inert: collapse.inert };
      })
    ).toEqual({ hidden: false, inert: false });
  });

  test("select：combobox / listbox / option 语义与展开状态", async ({ page }) => {
    await page.goto("/tests/fixtures/select.html");
    await waitForShadow(page, "st-select");

    await page.evaluate(() => document.querySelector("st-select").setAttribute("aria-label", "城市"));
    await page.waitForTimeout(100);
    expect(await page.locator("st-select").first().ariaSnapshot()).toContain('combobox "城市"');

    await page.locator("st-select").first().click();
    await page.waitForTimeout(200);
    expect(
      await page.evaluate(() => {
        const el = document.querySelector("st-select");
        const control = el.shadowRoot.querySelector("#st-control");
        const opt = el.shadowRoot.querySelector(".opt");
        return {
          role: control.getAttribute("role"),
          expanded: control.getAttribute("aria-expanded"),
          active: control.getAttribute("aria-activedescendant"),
          optionRole: opt.getAttribute("role"),
          selected: opt.getAttribute("aria-selected"),
        };
      })
    ).toMatchObject({ role: "combobox", expanded: "true", optionRole: "option", selected: "false" });
  });

  test("menu：panel role=menu，触发器 aria-haspopup / aria-expanded", async ({ page }) => {
    await page.goto("/tests/fixtures/collection.html");
    await waitForShadow(page, "#menu");

    expect(
      await page.evaluate(() => {
        const menu = document.querySelector("#menu");
        const trigger = menu.querySelector('[slot="trigger"]');
        return {
          panel: menu.shadowRoot.querySelector(".panel").getAttribute("role"),
          haspopup: trigger.getAttribute("aria-haspopup"),
          expanded: trigger.getAttribute("aria-expanded"),
          innerHaspopup: (trigger.shadowRoot?.querySelector("button") || trigger).getAttribute("aria-haspopup"),
        };
      })
    ).toEqual({ panel: "menu", haspopup: "menu", expanded: "false", innerHaspopup: "menu" });

    await page.locator("#menu [slot=trigger]").click();
    await page.waitForTimeout(200);
    expect(
      await page.evaluate(() =>
        document.querySelector("#menu [slot=trigger]").getAttribute("aria-expanded")
      )
    ).toBe("true");
  });
});

test.describe("对话框模态行为", () => {
  const openDialog = async (page, id) => {
    await page.evaluate((sel) => document.querySelector(sel).setAttribute("open", ""), id);
    await page.waitForFunction(
      (sel) => document.querySelector(sel)?.hasAttribute("open"),
      id
    );
    await page.waitForTimeout(100);
  };

  const isInside = (el, dialog) => {
    let node = el;
    while (node) {
      if (node === dialog) return true;
      const root = node.getRootNode();
      node = root.host || null;
    }
    return false;
  };

  test("role / aria-modal / 标题名称 / 焦点陷阱 / 滚动锁 / 焦点归还", async ({ page }) => {
    await page.goto("/tests/fixtures/dialog.html");
    await waitForShadow(page, "#dlg-autoclose");
    await page.evaluate(() => {
      document.body.style.height = "3000px";
    });

    await page.locator("#opener").click();
    await page.waitForFunction(() =>
      document.querySelector("#dlg-autoclose").hasAttribute("open")
    );
    await page.waitForTimeout(150);

    const dialog = page.locator("#dlg-autoclose");
    expect(await dialog.ariaSnapshot()).toContain('dialog "自动关闭"');
    expect(
      await page.evaluate(() => {
        const d = document.querySelector("#dlg-autoclose");
        return { role: d.getAttribute("role"), modal: d.getAttribute("aria-modal") };
      })
    ).toEqual({ role: "dialog", modal: "true" });

    // Tab 多次后焦点仍在对话框内部
    for (let i = 0; i < 4; i++) await page.keyboard.press("Tab");
    expect(
      await page.evaluate(
        ([dialogId]) => {
          const d = document.querySelector(dialogId);
          let active = document.activeElement;
          while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement;
          let node = active;
          while (node) {
            if (node === d) return true;
            node = node.parentElement || node.getRootNode().host || null;
          }
          return false;
        },
        ["#dlg-autoclose"]
      )
    ).toBe(true);

    // 模态打开时背景不可滚动
    await page.mouse.move(10, 500);
    await page.mouse.wheel(0, 600);
    await page.waitForTimeout(150);
    expect(await page.evaluate(() => scrollY)).toBe(0);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("hidden");

    await page.keyboard.press("Escape");
    await page.waitForTimeout(350);
    expect(
      await page.evaluate(() => document.querySelector("#dlg-autoclose").hasAttribute("open"))
    ).toBe(false);
    expect(await page.evaluate(() => document.body.style.overflow)).toBe("");
    expect(await page.evaluate(() => document.activeElement?.id)).toBe("opener");
  });

  test("叠加对话框：Escape 只关最上层", async ({ page }) => {
    await page.goto("/tests/fixtures/dialog.html");
    await waitForShadow(page, "#dlg-autoclose");

    await openDialog(page, "#dlg-autoclose");
    await openDialog(page, "#dlg-autoclose-2");
    await page.keyboard.press("Escape");
    await page.waitForTimeout(350);
    expect(
      await page.evaluate(() => ({
        first: document.querySelector("#dlg-autoclose").hasAttribute("open"),
        second: document.querySelector("#dlg-autoclose-2").hasAttribute("open"),
      }))
    ).toEqual({ first: true, second: false });

    await page.keyboard.press("Escape");
    await page.waitForTimeout(350);
    expect(
      await page.evaluate(() => document.querySelector("#dlg-autoclose").hasAttribute("open"))
    ).toBe(false);
  });
});

test.describe("已确认行为回归", () => {
  test("tooltip：setAttribute(open) 也能正确定位并跟随 aria-hidden", async ({ page }) => {
    await page.goto("/tests/fixtures/newcomp.html");
    await waitForShadow(page, "#tip-basic");

    await page.evaluate(() => document.querySelector("#tip-basic").setAttribute("open", ""));
    await page.waitForTimeout(250);
    const state = await page.evaluate(() => {
      const tip = document.querySelector("#tip-basic");
      const bubble = tip.shadowRoot.querySelector(".bubble");
      const b = bubble.getBoundingClientRect();
      const t = tip.getBoundingClientRect();
      return {
        centered: Math.abs(b.left + b.width / 2 - (t.left + t.width / 2)) < 20,
        hidden: bubble.getAttribute("aria-hidden"),
        above: b.bottom <= t.top + 1,
      };
    });
    expect(state.centered).toBe(true);
    expect(state.hidden).toBe("false");
    expect(state.above).toBe(true);
    expect(await page.evaluate(() => {
      const tip = document.querySelector("#tip-basic");
      const trigger = tip.querySelector("st-button");
      return trigger.shadowRoot.querySelector("button").getAttribute("aria-description");
    })).toBe("提示内容");
  });

  test("slider：隐藏后显示会重新计算，min/max 变更即时生效", async ({ page }) => {
    await page.goto("/tests/fixtures/newcomp.html");
    await waitForShadow(page, "#sl-basic");

    const state = await page.evaluate(async () => {
      const el = document.querySelector("#sl-basic");
      el.style.display = "none";
      await new Promise((r) => setTimeout(r, 80));
      el.value = "80";
      await new Promise((r) => setTimeout(r, 120));
      el.style.display = "";
      await new Promise((r) => setTimeout(r, 300));
      const afterShow = el.shadowRoot.querySelector(".thumb").style.left;

      el.setAttribute("max", "200");
      await new Promise((r) => setTimeout(r, 120));
      const max = el.shadowRoot.querySelector("input").max;
      el.setAttribute("max", "50");
      await new Promise((r) => setTimeout(r, 150));
      return {
        afterShow,
        width: el.clientWidth,
        max,
        clamped: el.value,
      };
    });
    expect(state.width).toBeGreaterThan(0);
    expect(parseFloat(state.afterShow)).toBeGreaterThan(0);
    expect(state.max).toBe("200");
    expect(state.clamped).toBe("50");
  });

  test("split-button：setAttribute(open) 打开面板并同步 aria-expanded", async ({ page }) => {
    await page.goto("/tests/fixtures/button.html");
    await waitForShadow(page, "#split");

    await page.evaluate(() => document.querySelector("#split").setAttribute("open", ""));
    await page.waitForTimeout(250);
    expect(
      await page.evaluate(() => {
        const el = document.querySelector("#split");
        return {
          open: el.hasAttribute("open"),
          displayed: getComputedStyle(el.shadowRoot.querySelector(".panel")).display,
          expanded: el.shadowRoot.querySelector(".caret-zone").getAttribute("aria-expanded"),
        };
      })
    ).toEqual({ open: true, displayed: "block", expanded: "true" });
  });
});

test("context-menu：子菜单开合不会误关根菜单", async ({ page }) => {
  await page.goto("/tests/fixtures/collection.html");
  await waitForShadow(page, "#menu");

  await page.evaluate(async () => {
    const { default: contextMenu } = await import("/packages/menu/context-menu.js");
    window.__cm = contextMenu({ x: 120, y: 120 }, [
      { id: "a", label: "菜单A" },
      {
        id: "b",
        label: "菜单B",
        children: [{ id: "b1", label: "子项B1" }],
      },
    ]);
  });
  await page.waitForSelector("body > st-menu[data-st-util]", { state: "attached" });
  await page.waitForFunction(() => {
    const menu = document.querySelector("body > st-menu[data-st-util]");
    return menu && getComputedStyle(menu.shadowRoot.querySelector(".panel")).display === "block";
  });
  const root = page.locator("body > st-menu[data-st-util]").first();

  await page.locator("st-menu-item", { hasText: "菜单B" }).first().hover();
  await page.waitForTimeout(450);
  await page.locator("st-menu-item", { hasText: "菜单A" }).first().hover();
  await page.waitForTimeout(700);

  expect(await root.count()).toBe(1);
  expect(await page.evaluate(() => !!document.querySelector("body > st-menu[data-st-util]"))).toBe(true);
});

test("split-button：transform 祖先内弹层仍对齐触发器", async ({ page }) => {
  await page.goto("/tests/fixtures/button.html");
  await waitForShadow(page, "#split");

  await page.evaluate(() => {
    const wrap = document.createElement("div");
    wrap.style.cssText =
      "position: fixed; left: 100px; top: 100px; transform: translate(40px, 30px);";
    document.body.appendChild(wrap);
    wrap.appendChild(document.querySelector("#split"));
  });
  await page.evaluate(() =>
    document.querySelector("#split").shadowRoot.querySelector(".caret-zone").click()
  );
  await page.waitForFunction(
    () => getComputedStyle(document.querySelector("#split").shadowRoot.querySelector(".panel")).display === "block"
  );
  await page.waitForTimeout(400);

  const state = await page.evaluate(() => {
    const el = document.querySelector("#split");
    const panel = el.shadowRoot.querySelector(".panel");
    const host = el.getBoundingClientRect();
    const box = panel.getBoundingClientRect();
    return {
      gap: Math.round(box.top - host.bottom),
      aligned: Math.abs(box.right - host.right) <= 8,
    };
  });
  expect(state.gap).toBeGreaterThanOrEqual(3);
  expect(state.gap).toBeLessThanOrEqual(12);
  expect(state.aligned).toBe(true);
});

test("menu：方向键在菜单项之间移动焦点", async ({ page }) => {
  await page.goto("/tests/fixtures/collection.html");
  await waitForShadow(page, "#menu");

  await page.locator("#menu [slot=trigger]").click();
  await page.waitForTimeout(200);
  await page.keyboard.press("ArrowDown");
  const first = await page.evaluate(() => {
    let a = document.activeElement;
    while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
    const item = a.closest?.("st-menu-item") || a.getRootNode()?.host;
    return item?.textContent.trim();
  });
  await page.keyboard.press("ArrowDown");
  const second = await page.evaluate(() => {
    let a = document.activeElement;
    while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
    const item = a.closest?.("st-menu-item") || a.getRootNode()?.host;
    return item?.textContent.trim();
  });
  expect(first).not.toBe(second);
  expect(second).toBeTruthy();
});

test("tabs / nav：方向键移动焦点并激活相邻项", async ({ page }) => {
  await page.goto("/tests/fixtures/collection.html");
  await waitForShadow(page, "#tabs");

  await page.locator("#tab-a").locator(".native").focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.events)).toContain("tab-b");
  expect(
    await page.evaluate(() => {
      let a = document.activeElement;
      while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
      const item = a.closest?.("st-tab-item") || a.getRootNode()?.host;
      return item?.id;
    })
  ).toBe("tab-b");

  await page.locator("#nav-a").locator(".native").focus();
  await page.keyboard.press("ArrowRight");
  await page.waitForTimeout(100);
  expect(await page.evaluate(() => window.events)).toContain("nav-b");
});

test("tabs：指示条在 transform 祖先内仍与 active 项对齐", async ({ page }) => {
  await page.goto("/tests/fixtures/collection.html");
  await waitForShadow(page, "#tabs");

  await page.evaluate(() => {
    const wrap = document.createElement("div");
    wrap.style.cssText =
      "position: fixed; left: 80px; top: 120px; transform: translate(40px, 30px);";
    document.body.appendChild(wrap);
    wrap.appendChild(document.querySelector("#tabs"));
  });
  await page.waitForTimeout(400);

  const state = await page.evaluate(() => {
    const bar = document.querySelector("#tabs");
    const active = bar.querySelector("st-tab-item[active]");
    const indicator = bar.shadowRoot.querySelector(".indicator");
    return {
      left: parseFloat(indicator.style.left),
      expected: active.offsetLeft,
      width: parseFloat(indicator.style.width),
      activeWidth: active.offsetWidth,
    };
  });
  expect(state.left).toBeCloseTo(state.expected, 0);
  expect(state.width).toBeCloseTo(state.activeWidth, 0);
});
