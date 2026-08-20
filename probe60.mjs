// 用 Playwright 官方 test runner 跑完全一致的步骤，打印值
import { test } from '@playwright/test';
test('debug radius', async ({ page }) => {
  await page.goto('/tests/fixtures/button.html');
  await page.waitForFunction(() => {
    const grp = document.querySelector('#grp');
    const split = document.querySelector('#split');
    return (
      grp &&
      split?.shadowRoot?.querySelector('.main-zone') &&
      document.querySelector('#g1')?.shadowRoot?.querySelector('button')
    );
  }, { timeout: 20000 });
  await page.waitForTimeout(300);
  const radii = await page.evaluate(() => {
    const get = (sel) => {
      const cs = getComputedStyle(document.querySelector(sel));
      return [cs.borderTopLeftRadius, cs.borderTopRightRadius].join('/');
    };
    return { first: get('#g1'), mid: get('#g2'), last: get('#g3'),
      inline: document.querySelector('#g1').style.borderRadius || '(none)' };
  });
  console.log('RADII:', JSON.stringify(radii));
});
