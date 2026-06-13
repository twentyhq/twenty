import { chromium } from 'playwright';

// Whole-page closing batteries: the context cap holds while every slot
// gets evidenced during a full scroll sweep, and the frame loops go idle
// when everything is offscreen.
const BASE_URL = process.env.VISUAL_BATTERY_URL ?? 'http://localhost:3004/';
// The cap is read LIVE from the budget via the test instrumentation —
// never duplicated here (a raised budget must fail loudly, not silently).
import { PENDING_VISUAL_SLOTS as PENDING_SLOTS } from './pending-visual-slots.mjs';

const failures = [];
const assert = (condition, message) => {
  console.log(`  ${condition ? '✓' : '✗'} ${message}`);
  if (!condition) {
    failures.push(message);
  }
};

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const page = await browser.newPage({
  viewport: { width: 1280, height: 2400 },
  deviceScaleFactor: 1,
});
// Wave-close gates: every same-origin request resolves, and the page's
// total image weight stays inside the budget. External fallbacks (e.g.
// twenty-icons.com favicons) are by-design misses and out of scope.
const sameOriginNotFound = [];
let totalImageBytes = 0;
page.on('response', (response) => {
  const url = response.url();
  const isSameOrigin = url.startsWith(BASE_URL.replace(/\/$/, ''));
  if (isSameOrigin && response.status() === 404) {
    sameOriginNotFound.push(new URL(url).pathname);
  }
  if (isSameOrigin && /\.(webp|png|jpe?g|svg|gif|avif)(\?|$)/.test(url)) {
    void response
      .body()
      .then((body) => {
        totalImageBytes += body.length;
      })
      .catch(() => {});
  }
});
await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 240000 });

const slots = await page.evaluate(() =>
  [...document.querySelectorAll('[data-illustration]')].map((el) =>
    el.getAttribute('data-illustration'),
  ),
);
console.log(`── sweep over ${slots.length} slots: ${slots.join(', ')}`);

const evidenced = new Set();
let maxCount = 0;
const pageHeight = await page.evaluate(
  () => document.documentElement.scrollHeight,
);
for (let y = 0; y <= pageHeight; y += 600) {
  // eslint-disable-next-line no-await-in-loop
  await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
  // eslint-disable-next-line no-await-in-loop
  await page.waitForTimeout(450);
  // eslint-disable-next-line no-await-in-loop
  const state = await page.evaluate(() => ({
    count: window.__visualRuntimeTest?.getActiveContextCount() ?? -1,
    withCanvas: [...document.querySelectorAll('[data-illustration]')]
      .filter((el) => el.querySelector('canvas'))
      .map((el) => el.getAttribute('data-illustration')),
  }));
  maxCount = Math.max(maxCount, state.count);
  state.withCanvas.forEach((name) => evidenced.add(name));
}

const liveCap = await page.evaluate(
  () => window.__visualRuntimeTest?.getContextCap() ?? -1,
);
assert(liveCap > 0, `context cap readable from instrumentation (${liveCap})`);
assert(
  maxCount <= liveCap,
  `context count never exceeds cap (max ${maxCount} ≤ ${liveCap})`,
);
const missing = slots.filter(
  (name) => !evidenced.has(name) && !PENDING_SLOTS.has(name),
);
const pending = slots.filter((name) => PENDING_SLOTS.has(name));
if (pending.length > 0) {
  console.log(
    `  - pending (AppPreview wave, expected empty): ${pending.join(', ')}`,
  );
}
const pendingButLive = pending.filter((name) => evidenced.has(name));
assert(
  pendingButLive.length === 0,
  `PENDING_SLOTS stays honest${pendingButLive.length ? ` (now live, remove: ${pendingButLive.join(', ')})` : ''}`,
);
assert(
  missing.length === 0,
  `every slot evidenced during sweep${missing.length ? ` (missing: ${missing.join(', ')})` : ''}`,
);

// Idle: park between sections (helped stage top is canvas-free), wait out
// the dispose grace, then expect the rAF loops quiet.
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(6000);
const ticksBefore = await page.evaluate(
  () => window.__visualRuntimeTest?.getRafTicks() ?? -1,
);
await page.waitForTimeout(2000);
const ticksAfter = await page.evaluate(
  () => window.__visualRuntimeTest?.getRafTicks() ?? -1,
);
const heroAreaCanvases = await page.evaluate(
  () => document.querySelectorAll('canvas').length,
);
// The top of the page has live visuals only if slots sit in range; allow
// their loops, but if no canvases are mounted the loops must be silent.
if (heroAreaCanvases === 0) {
  assert(
    ticksAfter - ticksBefore <= 2,
    `rAF idle with nothing mounted (${ticksAfter - ticksBefore} ticks/2s)`,
  );
} else {
  console.log(
    `  - idle check skipped: ${heroAreaCanvases} canvases legitimately in range at page top`,
  );
}

// Composition checks — both encode bug classes the user caught by eye:
// a 40px off-center hero body (box left-aligned inside a centered grid)
// and muted ink silently bound to black-70 instead of the old site's 60.
await page.evaluate(() => window.scrollTo(0, 0));
await page.waitForTimeout(600);
const composition = await page.evaluate(() => {
  const center = window.innerWidth / 2;
  const measure = (element) => {
    const rect = element.getBoundingClientRect();
    return Math.round(rect.left + rect.width / 2 - center);
  };
  const h1 = document.querySelector('h1');
  const heroBody = h1?.closest('div')?.parentElement?.querySelector('p');
  const stage = document.querySelector('[data-mockup-stage]');
  const styles = getComputedStyle(document.body);
  return {
    h1Offset: h1 ? measure(h1) : null,
    bodyOffset: heroBody ? measure(heroBody) : null,
    stageOffset: stage ? measure(stage) : null,
    inkMuted: styles.getPropertyValue('--ink-muted').trim(),
    black60: styles.getPropertyValue('--color-black-60').trim(),
  };
});
for (const [label, offset] of [
  ['h1', composition.h1Offset],
  ['hero body', composition.bodyOffset],
  ['mockup stage', composition.stageOffset],
]) {
  assert(
    offset !== null && Math.abs(offset) <= 1,
    `${label} centered (offset ${offset}px)`,
  );
}
assert(
  composition.inkMuted !== '' && composition.inkMuted === composition.black60,
  `muted ink binds to black-60 (got "${composition.inkMuted}" vs "${composition.black60}")`,
);

// Universal eyebrow-to-heading measure: 24px everywhere the intro
// grammar runs (testimonials' 56px carousel header is the authored
// old-parity exception, asserted so drift is still caught).
const readEyebrowGaps = (target) =>
  target.evaluate(() =>
    [...document.querySelectorAll('p')]
      .filter(
        (el) =>
          el.querySelector('span[aria-hidden]') &&
          el.textContent.trim().length < 40,
      )
      .map((row) => {
        const block = row.parentElement;
        const heading =
          block.querySelector('h1, h2, h3') ??
          block.parentElement.querySelector('h1, h2, h3');
        const rect = row.getBoundingClientRect();
        const parentRect = row.parentElement.getBoundingClientRect();
        const centered =
          getComputedStyle(row.parentElement).textAlign === 'center';
        return {
          label: row.textContent.trim(),
          gap: heading
            ? Math.round(heading.getBoundingClientRect().top - rect.bottom)
            : null,
          // Centered intros must center the row as one unit (a grid
          // ancestor blockifying the inline-flex eyebrow broke this once).
          misaligned:
            centered &&
            Math.abs(
              rect.left - parentRect.left - (parentRect.right - rect.right),
            ) > 2,
        };
      }),
  );
const EYEBROW_GAP_PX = 24;
const TESTIMONIALS_EYEBROW = 'They are the real sales';
const TESTIMONIALS_GAP_PX = 56;

const readSectionRhythms = (target) =>
  target.evaluate(() =>
    [...document.querySelectorAll('section')].map((el) => {
      const previous = el.previousElementSibling;
      return {
        rhythm: el.getAttribute('data-rhythm'),
        paddingTop: getComputedStyle(el).paddingTop,
        paddingBottom: getComputedStyle(el).paddingBottom,
        // Same-scheme neighbors share one surface: the second section
        // drops its top padding (flush neighbors contribute no spacing,
        // so they never trigger the collapse).
        collapsesTop:
          previous?.tagName === 'SECTION' &&
          previous.getAttribute('data-scheme') ===
            el.getAttribute('data-scheme') &&
          previous.getAttribute('data-rhythm') !== 'flush',
      };
    }),
  );
const homeSections = await readSectionRhythms(page);
const homeEyebrows = await readEyebrowGaps(page);

// The product page joins the 404 net (its slots/composition have their
// own battery; the sweep guards asset integrity site-wide).
await page.goto(`${BASE_URL.replace(/\/$/, '')}/product`, {
  waitUntil: 'networkidle',
  timeout: 240000,
});
const productPageHeight = await page.evaluate(
  () => document.documentElement.scrollHeight,
);
for (let y = 0; y <= productPageHeight; y += 600) {
  // eslint-disable-next-line no-await-in-loop
  await page.evaluate((scrollY) => window.scrollTo(0, scrollY), y);
  // eslint-disable-next-line no-await-in-loop
  await page.waitForTimeout(350);
}

// Universal section rhythm: every <section> is a SectionShell with a
// rhythm class, and its block padding is exactly the token value
// (md tier at this viewport — src/tokens/rhythm.ts, spacing unit 4px).
const RHYTHM_MD_PADDING = {
  hero: '48px',
  section: '64px',
  flush: '0px',
  spacious: '120px',
};
const offRhythmSections = [
  ...homeSections,
  ...(await readSectionRhythms(page)),
];
const allEyebrows = [...homeEyebrows, ...(await readEyebrowGaps(page))];
const eyebrowViolations = allEyebrows.filter(
  (eyebrow) =>
    eyebrow.misaligned ||
    (eyebrow.label.startsWith(TESTIMONIALS_EYEBROW)
      ? eyebrow.gap !== TESTIMONIALS_GAP_PX
      : eyebrow.gap !== EYEBROW_GAP_PX),
);
assert(
  allEyebrows.length > 0 && eyebrowViolations.length === 0,
  `every eyebrow sits ${EYEBROW_GAP_PX}px above its heading, centered intros centered (${allEyebrows.length} eyebrows${eyebrowViolations.length > 0 ? `; violations: ${JSON.stringify(eyebrowViolations)}` : ''})`,
);

const rhythmViolations = offRhythmSections.filter(
  (section) =>
    !(section.rhythm in RHYTHM_MD_PADDING) ||
    section.paddingTop !==
      (section.collapsesTop ? '0px' : RHYTHM_MD_PADDING[section.rhythm]) ||
    section.paddingBottom !== RHYTHM_MD_PADDING[section.rhythm],
);
assert(
  offRhythmSections.length > 0 && rhythmViolations.length === 0,
  `every section carries token rhythm padding (same-scheme seams collapsed) (${offRhythmSections.length} sections${rhythmViolations.length > 0 ? `; violations: ${JSON.stringify(rhythmViolations)}` : ''})`,
);

assert(
  sameOriginNotFound.length === 0,
  `no same-origin 404s during the sweep${sameOriginNotFound.length > 0 ? ` (${sameOriginNotFound.join(', ')})` : ''}`,
);
// Budget calibrated against the swept page (all scenes + shared assets
// measured ~1.1MB); headroom covers compression variance, not new art.
// + the product page's backdrop art (sweept since the product wave).
const IMAGE_BYTES_BUDGET = 1_800_000;
assert(
  totalImageBytes > 0 && totalImageBytes <= IMAGE_BYTES_BUDGET,
  `total same-origin image bytes within budget (${Math.round(totalImageBytes / 1024)}KB ≤ ${Math.round(IMAGE_BYTES_BUDGET / 1024)}KB)`,
);

await browser.close();

if (failures.length > 0) {
  console.error(`visual-sweep: FAILED (${failures.length})`);
  process.exit(1);
}
console.log('visual-sweep: OK');
