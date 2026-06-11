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

await browser.close();

if (failures.length > 0) {
  console.error(`visual-sweep: FAILED (${failures.length})`);
  process.exit(1);
}
console.log('visual-sweep: OK');
