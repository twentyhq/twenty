import { readFileSync } from 'node:fs';

import {
  createBattery,
  launchBrowser,
  NEW_BASE,
  openPage,
} from './battery-kit.mjs';

// Decorative section backgrounds (gradients, halftones, notched cards,
// crosshairs) must never bleed past the content column — only the section's
// solid colour is full-bleed. The cap is read from the token itself, so this
// guard can never drift from it. Measured well past the cap so the centring is
// exercised: every [data-background-layer] must land <= the cap and centred.
const tokenSource = readFileSync(
  new URL('../src/tokens/max-content-width.ts', import.meta.url),
  'utf8',
);
const MAX_CONTENT_WIDTH_PX = Number(
  /MAX_CONTENT_WIDTH_PX\s*=\s*(\d+)/.exec(tokenSource)?.[1],
);
const WIDE_VIEWPORT = { height: 1200, width: 2400 };
const PAGES = [
  '/',
  '/product',
  '/pricing',
  '/customers',
  '/partners',
  '/why-twenty',
  '/releases',
];

const battery = createBattery('background-cap');
const browser = await launchBrowser();

for (const pagePath of PAGES) {
  // eslint-disable-next-line no-await-in-loop
  const page = await openPage(browser, `${NEW_BASE}${pagePath}`, {
    settleMs: 1000,
    viewport: WIDE_VIEWPORT,
  });

  // eslint-disable-next-line no-await-in-loop
  const pageHeight = await page.evaluate(
    () => document.documentElement.scrollHeight,
  );
  for (let y = 0; y <= pageHeight; y += 800) {
    // eslint-disable-next-line no-await-in-loop
    await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
    // eslint-disable-next-line no-await-in-loop
    await page.waitForTimeout(150);
  }

  // eslint-disable-next-line no-await-in-loop
  const layers = await page.evaluate(() =>
    [...document.querySelectorAll('[data-background-layer]')]
      .map((element) => element.getBoundingClientRect())
      .filter((rect) => rect.width > 0)
      .map((rect) => ({
        leftMargin: Math.round(rect.left),
        rightMargin: Math.round(window.innerWidth - rect.right),
        width: Math.round(rect.width),
      })),
  );
  // eslint-disable-next-line no-await-in-loop
  await page.close();

  if (layers.length === 0) {
    battery.ok(`${pagePath} — no capped background layers rendered`, 'none');
    continue;
  }

  const overflowing = layers.filter(
    (layer) => layer.width > MAX_CONTENT_WIDTH_PX + 1,
  );
  const offCentre = layers.filter(
    (layer) => Math.abs(layer.leftMargin - layer.rightMargin) > 2,
  );

  if (overflowing.length > 0) {
    battery.fail(
      `${pagePath} background layers exceed ${MAX_CONTENT_WIDTH_PX}px`,
      JSON.stringify(overflowing),
    );
  }
  if (offCentre.length > 0) {
    battery.fail(
      `${pagePath} background layers not centred`,
      JSON.stringify(offCentre),
    );
  }
  if (overflowing.length === 0 && offCentre.length === 0) {
    const widths = [...new Set(layers.map((layer) => layer.width))].toSorted(
      (first, second) => second - first,
    );
    battery.ok(
      `${pagePath} — ${layers.length} background layers capped + centred`,
      `widths ${widths.join(', ')}px <= ${MAX_CONTENT_WIDTH_PX}`,
    );
  }
}

await battery.finish(browser);
