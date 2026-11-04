import { test, expect } from "@playwright/test";
import { generateM3Theme } from "../packages/color/m3-theme.js";

const luminance = (hex) => {
  const value = parseInt(hex.slice(1), 16);
  const channels = [(value >> 16) & 255, (value >> 8) & 255, value & 255].map((channel) => {
    const c = channel / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

const contrastRatio = (a, b) => {
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

test.beforeEach(async ({ page }) => {
  await page.goto("/tests/fixtures/color-contrast.html");
  await page.waitForFunction(() => window.__m3 !== undefined);
});

test("不传 contrast 时输出与标准 M3 一致（默认不改变旧配色）", async ({ page }) => {
  const theme = await page.evaluate(() => {
    const { generateM3Theme } = window.__m3;
    return generateM3Theme("#0061A4");
  });
  expect(theme.light.primary).toBe("#0061a4");
  expect(theme.light.surface).toBe("#fdfcff");
  expect(theme.dark.surface).toBe("#1a1c1e");
  expect(theme.dark.onErrorContainer).toBe("#ffb4ab");
});

test("contrast: 1 加深角色色、压暗深色表面并提亮描边", async ({ page }) => {
  const { base, boosted } = await page.evaluate(() => {
    const { generateM3Theme } = window.__m3;
    return {
      base: generateM3Theme("#FF2E97", { tertiary: "#00E5FF" }),
      boosted: generateM3Theme("#FF2E97", { tertiary: "#00E5FF" }, { contrast: 1 }),
    };
  });
  expect(boosted.dark.primary).not.toBe(base.dark.primary);
  expect(boosted.light.primary).not.toBe(base.light.primary);
  expect(boosted.dark.surface).not.toBe(base.dark.surface);
  // 深色表面更暗、描边更亮，角色色对表面的对比度仍然达标
  expect(luminance(boosted.dark.surface)).toBeLessThan(luminance(base.dark.surface));
  expect(luminance(boosted.dark.outline)).toBeGreaterThan(luminance(base.dark.outline));
  expect(contrastRatio(boosted.dark.primary, boosted.dark.surface)).toBeGreaterThan(4.5);
  // 浅色模式表面推向白、角色色加深
  expect(luminance(boosted.light.surface)).toBeGreaterThan(luminance(base.light.surface));
});

test("按角色设置 contrast 只影响该角色的四配对 token", async ({ page }) => {
  const { base, boosted } = await page.evaluate(() => {
    const { generateM3Theme } = window.__m3;
    return {
      base: generateM3Theme("#0061A4"),
      boosted: generateM3Theme("#0061A4", {}, { contrast: { primary: 1 } }),
    };
  });
  for (const mode of ["light", "dark"]) {
    for (const token of ["primary", "primaryContainer", "onPrimaryContainer"]) {
      expect(boosted[mode][token]).not.toBe(base[mode][token]);
    }
    // on-primary 在浅色下已经是 tone 100，没有继续提亮空间
    expect(boosted.light.onPrimary).toBe(base.light.onPrimary);
    expect(boosted.dark.onPrimary).not.toBe(base.dark.onPrimary);
    for (const token of ["secondary", "tertiary", "error", "surface", "outline"]) {
      expect(boosted[mode][token]).toBe(base[mode][token]);
    }
  }
});

test("neutral 只影响中性色，不改变角色色", async ({ page }) => {
  const { base, boosted } = await page.evaluate(() => {
    const { generateM3Theme } = window.__m3;
    return {
      base: generateM3Theme("#0061A4"),
      boosted: generateM3Theme("#0061A4", {}, { contrast: { neutral: 1 } }),
    };
  });
  expect(boosted.light.surface).not.toBe(base.light.surface);
  expect(boosted.light.outline).not.toBe(base.light.outline);
  expect(boosted.light.primary).toBe(base.light.primary);
  expect(boosted.dark.primary).toBe(base.dark.primary);
});

test("themeToCss / applyTheme 与 generateM3Theme 的对比度结果一致", async ({ page }) => {
  const result = await page.evaluate(() => {
    const { generateM3Theme, themeToCss, applyTheme } = window.__m3;
    const options = { contrast: 0.8 };
    const generated = generateM3Theme("#FF2E97", {}, options);
    const css = themeToCss("#FF2E97", {}, {}, options);
    const applied = applyTheme("#FF2E97", {}, {}, options);
    return { generated, css, applied };
  });
  expect(result.css).toContain(result.generated.light.primary);
  expect(result.css).toContain(result.generated.dark.primary);
  expect(result.applied.light.primary).toBe(result.generated.light.primary);
  expect(result.applied.dark.surface).toBe(result.generated.dark.surface);
});

test("自定义颜色变量也支持对比度（custom / 整体数字）", async ({ page }) => {
  const result = await page.evaluate(() => {
    const { expandCustoms } = window.__m3;
    return {
      base: expandCustoms({ brand: "#FF0000" }),
      boosted: expandCustoms({ brand: "#FF0000" }, { contrast: 1 }),
      role: expandCustoms({ brand: "#FF0000" }, { contrast: { primary: 1 } }),
    };
  });
  expect(result.boosted.light["--brand"]).not.toBe(result.base.light["--brand"]);
  expect(result.boosted.light["--brand-container"]).not.toBe(
    result.base.light["--brand-container"]
  );
  expect(result.boosted.light["--on-brand-container"]).not.toBe(
    result.base.light["--on-brand-container"]
  );
  expect(result.boosted.dark["--brand-container"]).not.toBe(
    result.base.dark["--brand-container"]
  );
  // 只设置 primary 不影响 custom
  expect(result.role.light["--brand"]).toBe(result.base.light["--brand"]);
});

test("contrastTone: bright 提亮深色角色色，浅色与中性色不变", async ({ page }) => {
  const result = await page.evaluate(() => {
    const { generateM3Theme, expandCustoms } = window.__m3;
    const base = { contrast: 1 };
    return {
      deep: generateM3Theme("#D6FE78", {}, { ...base, contrastTone: "deep" }),
      bright: generateM3Theme("#D6FE78", {}, { ...base, contrastTone: "bright" }),
      deepCustom: expandCustoms({ brand: "#D6FE78" }, { ...base, contrastTone: "deep" }),
      brightCustom: expandCustoms({ brand: "#D6FE78" }, { ...base, contrastTone: "bright" }),
    };
  });
  // 深色角色更亮、on-角色更暗；表面与容器不受方向影响
  expect(luminance(result.bright.dark.primary)).toBeGreaterThan(
    luminance(result.deep.dark.primary)
  );
  expect(luminance(result.bright.dark.onPrimary)).toBeLessThan(
    luminance(result.deep.dark.onPrimary)
  );
  expect(result.bright.dark.surface).toBe(result.deep.dark.surface);
  expect(result.bright.dark.primaryContainer).toBe(result.deep.dark.primaryContainer);
  // 浅色模式不受影响
  expect(result.bright.light.primary).toBe(result.deep.light.primary);
  // 自定义变量同样跟随方向
  expect(luminance(result.brightCustom.dark["--brand"])).toBeGreaterThan(
    luminance(result.deepCustom.dark["--brand"])
  );
  expect(result.brightCustom.light["--brand"]).toBe(result.deepCustom.light["--brand"]);
});

test("st-color-init 读取配置里的 contrast 并注入增强后的 token", async ({ page }) => {
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/tests/fixtures/color-scheme.html");
  await page.evaluate(() => {
    localStorage.setItem(
      "st-color-config",
      JSON.stringify({
        seed: "#0061A4",
        overrides: {},
        customs: [],
        contrast: 1,
        contrastTone: "bright",
      })
    );
    localStorage.removeItem("st-theme-css");
  });
  await page.reload();
  await page.waitForFunction(() => document.getElementById("st-dynamic-theme") !== null);
  const vars = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      primary: style.getPropertyValue("--md-sys-color-primary").trim(),
      surface: style.getPropertyValue("--md-sys-color-surface").trim(),
    };
  });
  const expected = generateM3Theme("#0061A4", {}, {
    contrast: 1,
    contrastTone: "bright",
  }).dark.primary;
  expect(vars.primary).toBe(expected);
  expect(vars.surface).not.toBe("#1a1c1e");
  expect(contrastRatio(vars.primary, vars.surface)).toBeGreaterThan(4.5);
});
