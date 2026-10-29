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
    return { blur: cs.backdropFilter, shadow: cs.boxShadow, font: cs.fontFamily };
  });
  expect(state.blur).toContain("blur(18px)");
  expect(state.shadow).not.toBe("none");
  expect(state.font).toContain("-apple-system");
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
