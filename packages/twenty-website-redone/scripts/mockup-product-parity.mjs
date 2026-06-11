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

// The desktop window: resize creates drag slack, drag moves and CLAMPS.
// Imperative style mutations during interaction + committed state after.
const windowPage = await browser.newPage({
  viewport: { width: 1440, height: 950 },
  deviceScaleFactor: 1,
});
await windowPage.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 240000 });
await windowPage.waitForTimeout(3000);
const win = await windowPage.locator('[data-app-window]').boundingBox();
assert(
  win !== null && Math.round(win.width) === 1040,
  `app window renders at scene width (${Math.round(win?.width ?? 0)})`,
);
// resize from the right edge: -240px
// the hittable handle band is the inner ~2px sliver inside the shell's
// clip (identical on the old site — verified by hit-test sweep)
await windowPage.mouse.move(win.x + win.width - 3, win.y + win.height / 2);
await windowPage.mouse.down();
await windowPage.mouse.move(win.x + win.width - 243, win.y + win.height / 2, {
  steps: 6,
});
await windowPage.mouse.up();
await windowPage.waitForTimeout(250);
const afterResize = await windowPage.locator('[data-app-window]').boundingBox();
assert(
  afterResize !== null && Math.round(afterResize.width) === 800,
  `right-edge resize commits (${Math.round(afterResize?.width ?? 0)} == 800)`,
);
// drag by the window bar: +500px right — must CLAMP at the scene edge
const bar = await windowPage.locator('[data-app-window]').boundingBox();
await windowPage.mouse.move(bar.x + bar.width / 2, bar.y + 14);
await windowPage.mouse.down();
await windowPage.mouse.move(bar.x + bar.width / 2 + 500, bar.y + 14, {
  steps: 8,
});
await windowPage.mouse.up();
await windowPage.waitForTimeout(250);
const afterDrag = await windowPage.locator('[data-app-window]').boundingBox();
const stage = await windowPage.locator('[data-mockup-stage]').boundingBox();
const movedRight = afterDrag.x > bar.x + 50;
const clampedInside =
  Math.round(afterDrag.x + afterDrag.width) <=
  Math.round(stage.x + stage.width) + 1;
assert(
  movedRight && clampedInside,
  `drag moves and clamps at the scene edge (moved ${Math.round(afterDrag.x - bar.x)}px, right edge ${Math.round(afterDrag.x + afterDrag.width)} <= ${Math.round(stage.x + stage.width)})`,
);
await windowPage.close();

await browser.close();

if (failures.length > 0) {
  console.error(`mockup-product-parity: FAILED (${failures.length})`);
  process.exit(1);
}
console.log('mockup-product-parity: OK');
