import { chromium } from 'playwright';

import { appPreviewTokenGeneration } from './app-preview-token-generation.mjs';

// PRODUCT-parity battery: asserts the rendered mockup against the SAME
// generator the committed tokens come from — zero product literals here.
// Chain of trust: DOM == generator(product sources); the lint drift check
// pins committed tokens == generator.
const BASE_URL = process.env.VISUAL_BATTERY_URL ?? 'http://localhost:3004/';

const failures = [];
const assert = (condition, message) => {
  console.log(`  ${condition ? '✓' : '✗'} ${message}`);
  if (!condition) {
    failures.push(message);
  }
};

const { values: product } = await appPreviewTokenGeneration.buildTheme();

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({
  viewport: { width: 1440, height: 950 },
  deviceScaleFactor: 1,
});
await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 240000 });
await page.waitForTimeout(3000);

const measured = await page.evaluate(() => {
  const stage = document.querySelector('[data-mockup-stage]');
  if (!stage) {
    return null;
  }
  const sidebar = stage.querySelector('aside');
  const itemRow = stage.querySelector('aside [data-nav-item]');
  const dataRow = stage.querySelector('[data-row-id="anthropic"]');
  const cell = dataRow?.firstElementChild;
  const crumb = [...stage.querySelectorAll('span')].find(
    (el) => el.textContent === 'Companies' && !el.closest('aside'),
  );
  // page.evaluate serializes this callback: helpers must live inside it.
  // eslint-disable-next-line unicorn/consistent-function-scoping
  const styleOf = (el) => (el ? getComputedStyle(el) : null);
  return {
    sidebarWidth: sidebar
      ? Math.round(sidebar.getBoundingClientRect().width)
      : null,
    itemRowHeight: itemRow
      ? Math.round(itemRow.getBoundingClientRect().height)
      : null,
    rowHeight: cell ? Math.round(cell.getBoundingClientRect().height) : null,
    cellFont: styleOf(cell?.querySelector('span') ?? cell)?.fontSize ?? null,
    cellFontFamily:
      styleOf(cell?.querySelector('span') ?? cell)?.fontFamily ?? null,
    crumbFont: styleOf(crumb)?.fontSize ?? null,
  };
});

assert(measured !== null, 'mockup stage renders');
if (measured) {
  assert(
    measured.sidebarWidth === product.chrome.navigationDrawerWidthPx,
    `sidebar width == product drawer (${measured.sidebarWidth} == ${product.chrome.navigationDrawerWidthPx})`,
  );
  assert(
    measured.itemRowHeight === product.chrome.navigationItemHeightPx,
    `nav item height == product (${measured.itemRowHeight} == ${product.chrome.navigationItemHeightPx})`,
  );
  assert(
    measured.rowHeight === product.chrome.recordTableRowHeightPx,
    `table row height == product (${measured.rowHeight} == ${product.chrome.recordTableRowHeightPx})`,
  );
  assert(
    measured.cellFont === `${product.font.sizePx.md}px`,
    `cell font == product md at rendered base (${measured.cellFont} == ${product.font.sizePx.md}px)`,
  );
  assert(
    measured.cellFontFamily?.startsWith('Inter') === true,
    `cell font family is the product's (${measured.cellFontFamily})`,
  );
  assert(
    measured.crumbFont === `${product.font.sizePx.md}px`,
    `breadcrumb font == product md (${measured.crumbFont})`,
  );
}

// The product's record table pins the first column under horizontal
// scroll (the old mockup ships this broken — ratified improvement).
// A fresh page scrolls MID-REVEAL: the pin must hold at every instant,
// not only after the entrance animation settles.
const stickyPage = await browser.newPage({
  viewport: { width: 1440, height: 950 },
  deviceScaleFactor: 1,
});
await stickyPage.goto(BASE_URL, {
  waitUntil: 'domcontentloaded',
  timeout: 240000,
});
await stickyPage.waitForTimeout(650);
const sticky = await stickyPage.evaluate(() => {
  const rows = [...document.querySelectorAll('[data-row-id]')];
  if (rows.length === 0) {
    return null;
  }
  let scroller = rows[0].parentElement;
  while (scroller && getComputedStyle(scroller).overflowX !== 'auto') {
    scroller = scroller.parentElement;
  }
  if (scroller) {
    scroller.scrollLeft = 300;
  }
  const moved = rows.filter((row) => {
    const before = row.firstElementChild.getBoundingClientRect().left;
    return (
      Math.round(before) !==
      Math.round(row.firstElementChild.getBoundingClientRect().left)
    );
  });
  const lefts = rows.map((row) =>
    Math.round(row.firstElementChild.getBoundingClientRect().left),
  );
  return {
    scrolled: scroller?.scrollLeft ?? 0,
    allPinned: new Set(lefts).size === 1,
    rowCount: rows.length,
    movedCount: moved.length,
  };
});
await stickyPage.close();
assert(
  sticky !== null && sticky.scrolled > 0 && sticky.allPinned,
  `every first-column cell pins mid-reveal (${sticky?.rowCount} rows, scroll ${sticky?.scrolled})`,
);

await browser.close();

if (failures.length > 0) {
  console.error(`mockup-product-parity: FAILED (${failures.length})`);
  process.exit(1);
}
console.log('mockup-product-parity: OK');
