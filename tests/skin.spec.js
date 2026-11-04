import { test, expect } from "@playwright/test";

async function ready(page) {
  await page.waitForFunction(() => {
    const btn = document.querySelector("#btn-filled");
    const input = document.querySelector("#input-basic");
    return !!(
      btn &&
      btn.shadowRoot &&
      input &&
      input.shadowRoot &&
      input.shadowRoot.querySelector("input")
    );
  }, null, { timeout: 15_000 });
}

const waitForSkin = (page, expr) => page.waitForFunction(expr, null, { timeout: 5_000 });

const setSkin = (page, name) =>
  page.evaluate(async (skin) => {
    const mod = await import("/packages/skin/st-skin.js");
    return mod.setSkin(skin);
  }, name);

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/fixtures/skin.html");
  await page.evaluate(() => localStorage.removeItem("st-skin"));
  await page.reload();
  await ready(page);
});

test("默认皮肤 m3：圆角 / 阴影 / 内嵌焦点环保持内置默认值", async ({ page }) => {
  const state = await page.evaluate(() => {
    const btn = document.querySelector("#btn-filled");
    const input = document.querySelector("#input-basic");
    return {
      skin: document.documentElement.dataset.skin,
      radius: parseFloat(getComputedStyle(btn).borderRadius),
      shadow: getComputedStyle(btn).boxShadow,
      ringOpacity: getComputedStyle(input.shadowRoot.querySelector(".outline-ring")).opacity,
    };
  });
  expect(state.skin).toBe("m3");
  expect(state.radius).toBeGreaterThan(19);
  expect(state.shadow).toBe("none");
  expect(state.ringOpacity).toBe("0");
});

test("shadcn 皮肤：6px 圆角 / 细阴影 / 切 data-skin", async ({ page }) => {
  expect(await setSkin(page, "shadcn")).toBe("shadcn");
  expect(await page.evaluate(() => document.documentElement.dataset.skin)).toBe("shadcn");
  // 皮肤 CSS 是异步加载的：等圆角真正生效再断言
  await waitForSkin(page, () => {
    const btn = document.querySelector("#btn-filled");
    return btn && parseFloat(getComputedStyle(btn).borderRadius) < 7;
  });

  const state = await page.evaluate(() => {
    const btn = document.querySelector("#btn-filled");
    const cs = getComputedStyle(btn);
    return { radius: parseFloat(cs.borderRadius), shadow: cs.boxShadow };
  });
  expect(state.radius).toBeGreaterThan(5.5);
  expect(state.radius).toBeLessThan(7);
  expect(state.shadow).not.toBe("none");
});

test("apple 皮肤：毛玻璃 / 阴影 / 系统字体栈", async ({ page }) => {
  await setSkin(page, "apple");
  await waitForSkin(page, () => {
    const btn = document.querySelector("#btn-filled");
    return btn && getComputedStyle(btn).backdropFilter !== "none";
  });
  const state = await page.evaluate(() => {
    const btn = document.querySelector("#btn-filled");
    const cs = getComputedStyle(btn);
    const card = getComputedStyle(document.querySelector("#card-elev"));
    const alpha = (color) => {
      const n = color.match(/\/\s*([\d.]+)\)/);
      return n ? Number(n[1]) : 1;
    };
    return {
      blur: cs.backdropFilter,
      shadow: cs.boxShadow,
      font: cs.fontFamily,
      cardAlpha: alpha(card.backgroundColor),
      fillAlpha: getComputedStyle(document.documentElement).getPropertyValue("--st-fill-alpha").trim(),
    };
  });
  expect(state.blur).toContain("blur(18px)");
  expect(state.shadow).not.toBe("none");
  expect(state.font).toContain("-apple-system");
  expect(state.fillAlpha).toBe("68%");
  expect(state.cardAlpha).toBeLessThan(0.6);
});

test("windows 皮肤：4px 控件 / 8px 表面 / Mica + Acrylic", async ({ page }) => {
  expect(await setSkin(page, "windows")).toBe("windows");
  expect(await page.evaluate(() => document.documentElement.dataset.skin)).toBe("windows");
  await waitForSkin(page, () => {
    const btn = document.querySelector("#btn-filled");
    return btn && parseFloat(getComputedStyle(btn).borderRadius) < 5;
  });

  const state = await page.evaluate(() => {
    const btn = document.querySelector("#btn-filled");
    const card = document.querySelector("#card-elev");
    const menuPanel = document.querySelector("#menu-skin").shadowRoot.querySelector(".panel");
    const icon = document.querySelector("#icon-skin");
    return {
      radius: parseFloat(getComputedStyle(btn).borderRadius),
      cardRadius: parseFloat(getComputedStyle(card).borderRadius),
      menuRadius: parseFloat(getComputedStyle(menuPanel).borderRadius),
      menuBlur: getComputedStyle(menuPanel).backdropFilter,
      cardBlur: getComputedStyle(card).backdropFilter,
      iconRadius: parseFloat(getComputedStyle(icon).borderRadius),
      font: getComputedStyle(btn).fontFamily,
      fillAlpha: getComputedStyle(document.documentElement).getPropertyValue("--st-fill-alpha").trim(),
    };
  });
  expect(state.radius).toBeGreaterThan(3.5);
  expect(state.radius).toBeLessThan(4.5);
  expect(state.cardRadius).toBeGreaterThan(7.5);
  expect(state.cardRadius).toBeLessThan(8.5);
  expect(state.menuRadius).toBeGreaterThan(7.5);
  // 浮层是 Acrylic（模糊），常驻卡片是 Mica（只着色、不模糊正文）
  expect(state.menuBlur).toContain("blur(30px)");
  expect(state.cardBlur).toBe("none");
  // Windows 图标按钮是 4px 圆角方形，不是圆形
  expect(state.iconRadius).toBeLessThan(5);
  expect(state.font).toContain("Segoe UI");
  expect(state.fillAlpha).toBe("100%");
});

test("cyberpunk 皮肤：零圆角 / 等宽字 / 霓虹外发光", async ({ page }) => {
  expect(await setSkin(page, "cyberpunk")).toBe("cyberpunk");
  expect(await page.evaluate(() => document.documentElement.dataset.skin)).toBe("cyberpunk");
  await waitForSkin(page, () => {
    const btn = document.querySelector("#btn-filled");
    return btn && parseFloat(getComputedStyle(btn).borderRadius) === 0;
  });

  const state = await page.evaluate(() => {
    const btn = document.querySelector("#btn-filled");
    const card = document.querySelector("#card-elev");
    const icon = document.querySelector("#icon-skin");
    const sw = document.querySelector("#sw-skin").shadowRoot.querySelector(".bg");
    const thumb = document.querySelector("#slider-skin").shadowRoot.querySelector(".thumb");
    const cs = getComputedStyle(btn);
    return {
      radius: parseFloat(cs.borderRadius),
      cardRadius: parseFloat(getComputedStyle(card).borderRadius),
      iconRadius: parseFloat(getComputedStyle(icon).borderRadius),
      switchRadius: parseFloat(getComputedStyle(sw).borderRadius),
      thumbRadius: parseFloat(getComputedStyle(thumb).borderRadius),
      font: cs.fontFamily,
      shadow: cs.boxShadow,
      sheen: cs.backgroundImage,
      backdrop: cs.backdropFilter,
      fillAlpha: getComputedStyle(document.documentElement).getPropertyValue("--st-fill-alpha").trim(),
    };
  });
  expect(state.radius).toBe(0);
  expect(state.cardRadius).toBe(0);
  expect(state.iconRadius).toBe(0);
  expect(state.switchRadius).toBe(0);
  expect(state.thumbRadius).toBe(0);
  expect(state.font.toLowerCase()).toContain("monospace");
  // 霓虹边缘 = 多层发光阴影；CRT 扫描线高光只作用在控件表面
  expect(state.shadow).not.toBe("none");
  expect(state.sheen).toContain("repeating-linear-gradient");
  expect(state.backdrop).toBe("none");
  expect(state.fillAlpha).toBe("100%");
});

test("皮肤焦点材质跟随 color 语义色：error 变红而不是主题主色", async ({ page }) => {
  const isRed = (value) => {
    const colors = value.match(/rgba?\([^)]+\)|color\(srgb [^)]+\)/g) || [];
    return colors.some((c) => {
      const n = c.match(/[\d.]+/g).map(Number);
      const [r, g, b] = c.startsWith("color(") ? n.slice(0, 3).map((v) => v * 255) : n.slice(0, 3);
      return r > g * 2 && r > b * 2;
    });
  };

  for (const skin of ["apple", "windows", "shadcn"]) {
    await setSkin(page, skin);
    await page.waitForTimeout(500);
    const state = await page.evaluate(() => {
      const input = document.querySelector("#input-basic");
      input.setAttribute("color", "error");
      input.shadowRoot.querySelector("input").focus();
      return new Promise((resolve) =>
        setTimeout(() => {
          const ring = input.shadowRoot.querySelector(".outline-ring");
          resolve({
            shadow: getComputedStyle(input).boxShadow,
            ringColor: getComputedStyle(ring).borderColor,
            ringOpacity: getComputedStyle(ring).opacity,
          });
        }, 350)
      );
    });

    // 内嵌描边在皮肤里可能关闭，但皮肤自己的焦点材质必须消费 accent 语义色
    expect(isRed(state.ringColor)).toBe(true);
    expect(isRed(state.shadow)).toBe(true);
    expect(state.ringOpacity).toBe("0");
  }
});

test("换肤不破坏 M3 语义色：color=error 仍然等于 error 角色", async ({ page }) => {
  await setSkin(page, "shadcn");
  await waitForSkin(page, () => {
    const btn = document.querySelector("#btn-filled");
    return btn && parseFloat(getComputedStyle(btn).borderRadius) < 7;
  });
  const state = await page.evaluate(() => {
    const btn = document.querySelector("#btn-error");
    const probe = document.createElement("span");
    probe.style.color = "var(--md-sys-color-error)";
    document.body.appendChild(probe);
    const error = getComputedStyle(probe).color;
    probe.style.color = "var(--md-sys-color-on-error)";
    const onError = getComputedStyle(probe).color;
    probe.remove();
    // color-mix 的输出可能是 color(srgb r g b)，统一换算成 0-255 通道再比较
    const parse = (value) => {
      const n = value.match(/[\d.]+/g).map(Number);
      return value.startsWith("color(")
        ? n.slice(0, 3).map((v) => Math.round(v * 255))
        : n.slice(0, 3);
    };
    const cs = getComputedStyle(btn);
    return { bg: parse(cs.backgroundColor), color: parse(cs.color), error: parse(error), onError: parse(onError) };
  });
  expect(state.bg).toEqual(state.error);
  expect(state.color).toEqual(state.onError);
});

test("皮肤可关闭波纹：shadcn 下波纹初始 opacity 为 0", async ({ page }) => {
  await setSkin(page, "shadcn");
  await waitForSkin(page, () => {
    const btn = document.querySelector("#btn-filled");
    return btn && getComputedStyle(btn).boxShadow !== "none";
  });
  await expect
    .poll(
      () =>
        page.evaluate(() => {
          const btn = document.querySelector("#btn-filled");
          btn.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, composed: true, clientX: 8, clientY: 8 }));
          btn.dispatchEvent(new PointerEvent("pointerup", { bubbles: true, composed: true }));
          return new Promise((resolve) =>
            setTimeout(() => {
              const ripple = btn.shadowRoot.querySelector("st-ripple")?.shadowRoot?.querySelector(".ripple");
              resolve(ripple ? getComputedStyle(ripple).opacity : "missing");
            }, 60)
          );
        }),
      { timeout: 3_000 }
    )
    .toBe("0");
});

test("输入框焦点环：shadcn 藏内嵌描边、改画外侧 ring", async ({ page }) => {
  await setSkin(page, "shadcn");
  await waitForSkin(page, () => {
    const btn = document.querySelector("#btn-filled");
    return btn && parseFloat(getComputedStyle(btn).borderRadius) < 7;
  });
  const state = await page.evaluate(() => {
    const input = document.querySelector("#input-basic");
    input.shadowRoot.querySelector("input").focus();
    return new Promise((resolve) =>
      setTimeout(() => {
        resolve({
          ring: getComputedStyle(input.shadowRoot.querySelector(".outline-ring")).opacity,
          shadow: getComputedStyle(input).boxShadow,
        });
      }, 300)
    );
  });
  expect(state.ring).toBe("0");
  expect(state.shadow).toContain("0px 0px 0px 2px");
});

test("皮肤选择持久化：刷新后仍是 apple", async ({ page }) => {
  await setSkin(page, "apple");
  await waitForSkin(page, () => {
    const btn = document.querySelector("#btn-filled");
    return btn && getComputedStyle(btn).backdropFilter !== "none";
  });
  await page.reload();
  await ready(page);
  await waitForSkin(page, () => {
    const btn = document.querySelector("#btn-filled");
    return btn && getComputedStyle(btn).backdropFilter !== "none";
  });
  const state = await page.evaluate(() => ({
    skin: document.documentElement.dataset.skin,
    radius: parseFloat(getComputedStyle(document.querySelector("#btn-filled")).borderRadius),
  }));
  expect(state.skin).toBe("apple");
  expect(state.radius).toBeLessThan(11);
});

test("皮肤覆盖浮动层：dialog / menu / card / select / tooltip / snackbar", async ({ page }) => {
  await page.waitForFunction(() => {
    const names = ["st-dialog", "st-menu", "st-card", "st-select", "st-tooltip", "st-snackbar"];
    return names.every((tag) => document.querySelector(tag)?.shadowRoot);
  }, null, { timeout: 20_000 });

  await setSkin(page, "shadcn");
  await waitForSkin(page, () => {
    const d = document.querySelector("#dialog-skin");
    return d && parseFloat(getComputedStyle(d.shadowRoot.querySelector(".panel")).borderRadius) < 12;
  });

  const shadcn = await page.evaluate(() => {
    const radius = (el) => parseFloat(getComputedStyle(el).borderRadius);
    const dlg = document.querySelector("#dialog-skin");
    const menu = document.querySelector("#menu-skin");
    const card = document.querySelector("#card-elev");
    const select = document.querySelector("#select-skin");
    return {
      dialog: radius(dlg.shadowRoot.querySelector(".panel")),
      menu: radius(menu.shadowRoot.querySelector(".panel")),
      card: radius(card),
      select: radius(select),
      checkbox: radius(document.querySelector("#cb-skin").shadowRoot.querySelector(".box")),
      tabIndicator: getComputedStyle(
        document.querySelector("#tabbar-skin").shadowRoot.querySelector(".indicator")
      ).borderRadius,
      switchBorder: parseFloat(
        getComputedStyle(document.querySelector("#sw-skin").shadowRoot.querySelector(".bg")).borderWidth
      ),
      sliderShadow: getComputedStyle(
        document.querySelector("#slider-skin").shadowRoot.querySelector(".thumb")
      ).boxShadow,
      navPill: radius(document.querySelector("#navbar-skin").shadowRoot.querySelector(".active-bg")),
    };
  });
  expect(shadcn.dialog).toBeLessThan(12);
  expect(shadcn.menu).toBeLessThan(7);
  expect(shadcn.card).toBeLessThan(7);
  expect(shadcn.select).toBeLessThan(7);
  expect(shadcn.checkbox).toBeLessThanOrEqual(4.5);
  expect(parseFloat(shadcn.tabIndicator)).toBeGreaterThan(100);
  expect(shadcn.switchBorder).toBeLessThan(1.2);
  expect(shadcn.sliderShadow).not.toBe("none");
  expect(shadcn.navPill).toBeLessThan(7);

  await setSkin(page, "apple");
  await waitForSkin(page, () => {
    const d = document.querySelector("#dialog-skin");
    return getComputedStyle(d.shadowRoot.querySelector(".panel")).backdropFilter.includes("blur(24px)");
  });
  const apple = await page.evaluate(() => {
    const filter = (sel, inner) => {
      const el = document.querySelector(sel);
      return getComputedStyle(inner ? el.shadowRoot.querySelector(inner) : el).backdropFilter;
    };
    return {
      dialog: filter("#dialog-skin", ".panel"),
      menu: filter("#menu-skin", ".panel"),
      card: filter("#card-elev"),
      tooltip: filter("#tip-skin", ".bubble"),
      checkbox: parseFloat(
        getComputedStyle(document.querySelector("#cb-skin").shadowRoot.querySelector(".box")).borderRadius
      ),
      dialogRadius: parseFloat(
        getComputedStyle(document.querySelector("#dialog-skin").shadowRoot.querySelector(".panel")).borderRadius
      ),
      switchBorder: parseFloat(
        getComputedStyle(document.querySelector("#sw-skin").shadowRoot.querySelector(".bg")).borderWidth
      ),
      sliderShadow: getComputedStyle(
        document.querySelector("#slider-skin").shadowRoot.querySelector(".thumb")
      ).boxShadow,
      switchBlur: filter("#sw-skin", ".bg"),
      checkboxBlur: filter("#cb-skin", ".box"),
      sliderBlur: filter("#slider-skin", ".thumb"),
    };
  });
  expect(apple.dialog).toContain("blur(24px)");
  expect(apple.menu).toContain("blur(8px)");
  expect(apple.card).toContain("blur(18px)");
  expect(apple.tooltip).toContain("blur(18px)");
  expect(apple.checkbox).toBeGreaterThan(5);
  expect(apple.dialogRadius).toBeGreaterThan(18);
  expect(apple.switchBorder).toBeGreaterThan(1.8);
  expect(apple.sliderShadow).not.toBe("none");
  // Apple 下选中态的开关轨道 / 复选框 / 滑块拇指带半透明 + backdrop blur
  expect(apple.switchBlur).toContain("blur(");
  expect(apple.checkboxBlur).toContain("blur(");
  expect(apple.sliderBlur).toContain("blur(");
});

test("皮肤不改变语义色：card / menu / snackbar 仍消费 M3 角色", async ({ page }) => {
  await page.waitForFunction(() => !!document.querySelector("#card-elev")?.shadowRoot);
  await setSkin(page, "shadcn");
  await waitForSkin(page, () => {
    const d = document.querySelector("#dialog-skin");
    const r = d && parseFloat(getComputedStyle(d.shadowRoot.querySelector(".panel")).borderRadius);
    return r > 0 && r < 12;
  });

  const state = await page.evaluate(() => {
    const probe = document.createElement("span");
    document.body.appendChild(probe);
    const role = (name) => {
      probe.style.color = `var(--md-sys-color-${name})`;
      const value = getComputedStyle(probe).color;
      return value;
    };
    const card = getComputedStyle(document.querySelector("#card-elev"));
    const menu = getComputedStyle(document.querySelector("#menu-skin").shadowRoot.querySelector(".panel"));
    const result = { cardBg: card.backgroundColor, cardRole: role("surface"), menuBg: menu.backgroundColor, menuRole: role("surface") };
    probe.remove();
    return result;
  });
  expect(state.cardBg).toBe(state.cardRole);
  expect(state.menuBg).toBe(state.menuRole);
});

test("m3 默认皮肤：迁移后的表面保持原值", async ({ page }) => {
  await page.waitForFunction(() => {
    const names = ["st-dialog", "st-menu", "st-card", "st-textarea", "st-checkbox", "st-progress"];
    return names.every((tag) => document.querySelector(tag)?.shadowRoot);
  }, null, { timeout: 20_000 });

  await page.evaluate(() => document.querySelector("#dialog-skin").setAttribute("open", ""));
  await page.waitForFunction(() => {
    const d = document.querySelector("#dialog-skin");
    return d?.hasAttribute("open") && d.shadowRoot.querySelector(".panel").getBoundingClientRect().height > 0;
  });
  const state = await page.evaluate(() => {
    const radius = (el) => parseFloat(getComputedStyle(el).borderRadius);
    const dlg = document.querySelector("#dialog-skin");
    const menu = document.querySelector("#menu-skin");
    const tabbar = document.querySelector("#tabbar-skin");
    return {
      dialog: radius(dlg.shadowRoot.querySelector(".panel")),
      card: radius(document.querySelector("#card-elev")),
      menu: radius(menu.shadowRoot.querySelector(".panel")),
      textarea: radius(document.querySelector("#textarea-skin")),
      checkbox: radius(document.querySelector("#cb-skin").shadowRoot.querySelector(".box")),
      progress: parseFloat(
        getComputedStyle(document.querySelector("#progress-skin").shadowRoot.querySelector(".linear")).height
      ),
      indicatorRadius: getComputedStyle(
        tabbar.shadowRoot.querySelector(".indicator")
      ).borderRadius,
    };
  });
  expect(state.dialog).toBeGreaterThan(23);
  expect(state.dialog).toBeLessThan(25);
  expect(state.card).toBeGreaterThan(11);
  expect(state.card).toBeLessThan(13);
  expect(state.menu).toBeGreaterThan(11);
  expect(state.menu).toBeLessThan(13);
  expect(state.textarea).toBeGreaterThan(6);
  expect(state.textarea).toBeLessThan(8);
  expect(state.checkbox).toBeGreaterThan(3.5);
  expect(state.checkbox).toBeLessThan(4.5);
  expect(state.progress).toBeGreaterThan(3.5);
  expect(state.progress).toBeLessThan(4.5);
  expect(parseFloat(state.indicatorRadius)).toBe(0);
});

test("未加载皮肤时仍回退到组件原默认材质", async ({ page }) => {
  await page.goto("/tests/fixtures/dialog.html");
  await page.waitForFunction(() => !!document.querySelector("#dlg-autoclose")?.shadowRoot);
  await page.evaluate(() => document.querySelector("#dlg-autoclose").setAttribute("open", ""));
  await page.waitForTimeout(150);
  const state = await page.evaluate(() => {
    const panel = document.querySelector("#dlg-autoclose").shadowRoot.querySelector(".panel");
    const cs = getComputedStyle(panel);
    return { radius: parseFloat(cs.borderRadius), shadow: cs.boxShadow, bg: cs.backgroundColor };
  });
  expect(state.radius).toBeGreaterThan(23);
  expect(state.radius).toBeLessThan(25);
  expect(state.shadow).not.toBe("none");
  expect(state.bg).not.toBe("rgba(0, 0, 0, 0)");
});
