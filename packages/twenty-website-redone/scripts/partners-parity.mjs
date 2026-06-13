import {
  createBattery,
  launchBrowser,
  NEW_BASE,
  openPage,
} from './battery-kit.mjs';

// Invariant battery for the partners landing. The hero/promo WebGL visuals are
// reserved frames that differ from :3002 by design, so this pins the redone's
// OWN load-bearing mechanisms rather than an A/B: the connectsUp frame seam
// (the audit flagged it as net-new behaviour on a shared, locked primitive with
// no test), the localized case-study count, and every hero's h1.
const { fail, finish, ok } = createBattery('partners-parity');

const assert = (label, condition, detail) =>
  condition ? ok(label, detail) : fail(label, detail);

const browser = await launchBrowser();

// connectsUp: the promo makes the TrustedBy band above it yield its bottom
// rhythm and show overflow, so the two read as one continuous frame across the
// seam. If a future refactor of the `:has(+ [data-connect-up])` rule breaks
// this, the corner markers re-clip and the frame splits.
const partners = await openPage(browser, `${NEW_BASE}/partners`, {
  viewport: { width: 1440, height: 1400 },
  settleMs: 500,
});
const seam = await partners.evaluate(() => {
  const band = [...document.querySelectorAll('section')].find((s) =>
    /trusted by/i.test(s.textContent || ''),
  );
  const style = getComputedStyle(band);
  return {
    bottom: style.paddingBottom,
    overflow: style.overflowY,
    hasCount: /\d+ Case Studies/.test(document.body.textContent || ''),
  };
});
assert(
  'connectsUp drops the band bottom rhythm',
  seam.bottom === '0px',
  `padding-bottom ${seam.bottom}`,
);
assert(
  'connectsUp shows the band overflow',
  seam.overflow === 'visible',
  `overflow-y ${seam.overflow}`,
);
assert('case-study count renders', seam.hasCount, 'no "N Case Studies"');
await partners.close();

// Every hero renders its h1 (the shared hero composition holds across schemes).
async function heroH1(path) {
  const page = await openPage(browser, `${NEW_BASE}${path}`, {
    viewport: { width: 1440, height: 1000 },
    settleMs: 300,
  });
  const text = await page.evaluate(
    () => document.querySelector('main h1')?.textContent || '',
  );
  await page.close();
  return text;
}

assert(
  'partners hero h1',
  (await heroH1('/partners')).includes('our partner'),
  'missing',
);
assert(
  'why-twenty hero h1',
  (await heroH1('/why-twenty')).includes('not bought'),
  'missing',
);
assert(
  'releases hero h1',
  (await heroH1('/releases')).includes('Releases'),
  'missing',
);
assert(
  'customers hero h1',
  (await heroH1('/customers')).includes('on Twenty'),
  'missing',
);

await finish(browser);
