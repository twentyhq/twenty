import { chromium } from 'playwright';
import sharp from 'sharp';

// The WebGL verification battery. Dot patterns are not pixel-comparable
// across runs (old-vs-old fails pixel identity), so the grammar is: box,
// coverage, dominant-hue class, liveliness, lifecycle — with thresholds
// calibrated against noise, never assumed.
//
// Usage: node scripts/visual-battery.mjs [visualKey ...]  (default: all)

const BASE_URL = process.env.VISUAL_BATTERY_URL ?? 'http://localhost:3004/';

const VISUALS = {
  hourglass: {
    slotSelector: '[data-illustration="hourglass"]',
    // blue #4a38f5
    hueRangeDegrees: [200, 260],
    minCoverage: 0.02,
    animated: true,
    interactive: false,
  },
  target: {
    slotSelector: '[data-illustration="target"]',
    // pink #ed87fc
    hueRangeDegrees: [270, 330],
    minCoverage: 0.01,
    // breathe-only: passive motion is sub-pixel; drag is the liveliness proof
    animated: false,
    interactive: true,
    settle: { stageProgress: 0.3 },
  },
  spaceship: {
    slotSelector: '[data-illustration="spaceship"]',
    // green #89fc9a
    hueRangeDegrees: [95, 160],
    minCoverage: 0.01,
    animated: false,
    interactive: true,
    settle: { stageProgress: 0.6 },
  },
  money: {
    slotSelector: '[data-illustration="money"]',
    // yellow #feffb7 (near-white: low saturation tolerated)
    hueRangeDegrees: [40, 80],
    minCoverage: 0.005,
    minSaturation: 0.12,
    animated: false,
    interactive: true,
    settle: { stageProgress: 0.9 },
  },
};

const MOTION_DIFF_FLOOR = 0.005;
const LOAD_TIMEOUT_MS = 30000;

const failures = [];
const assert = (condition, message) => {
  if (condition) {
    console.log(`  ✓ ${message}`);
  } else {
    failures.push(message);
    console.error(`  ✗ ${message}`);
  }
};

const readClip = async (page, box) => {
  const buffer = await page.screenshot({
    clip: {
      x: Math.max(0, box.x),
      y: Math.max(0, box.y),
      width: Math.max(1, box.width),
      height: Math.max(1, box.height),
    },
  });
  return sharp(buffer).raw().toBuffer({ resolveWithObject: true });
};

const rgbToHueSaturation = (r, g, b) => {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  const delta = max - min;
  let hue = 0;
  if (delta > 0) {
    if (max === r / 255) hue = (((g - b) / 255 / delta) % 6) * 60;
    else if (max === g / 255) hue = ((b - r) / 255 / delta + 2) * 60;
    else hue = ((r - g) / 255 / delta + 4) * 60;
  }
  if (hue < 0) hue += 360;
  const saturation = max === 0 ? 0 : delta / max;
  return { hue, saturation };
};

const analyzeClip = (
  { data, info },
  backgroundSample,
  minSaturation = 0.25,
) => {
  let foreground = 0;
  let hueWeightedSum = 0;
  let hueSamples = 0;
  const total = info.width * info.height;
  for (let i = 0; i < total; i += 1) {
    const offset = i * info.channels;
    const r = data[offset];
    const g = data[offset + 1];
    const b = data[offset + 2];
    const isBackground =
      Math.abs(r - backgroundSample[0]) <= 12 &&
      Math.abs(g - backgroundSample[1]) <= 12 &&
      Math.abs(b - backgroundSample[2]) <= 12;
    if (isBackground) continue;
    foreground += 1;
    const { hue, saturation } = rgbToHueSaturation(r, g, b);
    if (saturation > minSaturation) {
      hueWeightedSum += hue;
      hueSamples += 1;
    }
  }
  return {
    coverage: foreground / total,
    dominantHue: hueSamples > 0 ? hueWeightedSum / hueSamples : null,
  };
};

const diffClips = (a, b) => {
  const total = Math.min(a.data.length, b.data.length);
  let changed = 0;
  let compared = 0;
  for (let offset = 0; offset < total; offset += a.info.channels) {
    compared += 1;
    if (
      Math.abs(a.data[offset] - b.data[offset]) > 8 ||
      Math.abs(a.data[offset + 1] - b.data[offset + 1]) > 8 ||
      Math.abs(a.data[offset + 2] - b.data[offset + 2]) > 8
    ) {
      changed += 1;
    }
  }
  return changed / compared;
};

const cornerSample = ({ data }) => [data[0], data[1], data[2]];

const waitForLoadedCanvas = async (page, slotSelector) => {
  const deadline = Date.now() + LOAD_TIMEOUT_MS;
  // Polling: sequential await is the semantics, not an oversight.
  while (Date.now() < deadline) {
    // eslint-disable-next-line no-await-in-loop
    const box = await page
      .locator(`${slotSelector} canvas`)
      .first()
      .boundingBox()
      .catch(() => null);
    if (box) {
      // eslint-disable-next-line no-await-in-loop
      const clip = await readClip(page, box);
      const sample = cornerSample(clip);
      const { coverage } = analyzeClip(clip, sample);
      if (coverage > 0.001) {
        return box;
      }
    }
    // eslint-disable-next-line no-await-in-loop
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return null;
};

const settleForSpec = async (page, spec) => {
  if (spec.settle?.stageProgress !== undefined) {
    // The helped cards travel a 280vh fan; each card is readable only in
    // its own hold window of the stage progress.
    await page.evaluate((progress) => {
      const stage = document.querySelector('#homepage-cases');
      if (stage) {
        const rect = stage.getBoundingClientRect();
        const top = rect.top + window.scrollY;
        const scrollable = rect.height - window.innerHeight;
        window.scrollTo(0, top + progress * scrollable);
      }
    }, spec.settle.stageProgress);
    await page.waitForTimeout(800);
    return;
  }
  await page.locator(spec.slotSelector).first().scrollIntoViewIfNeeded();
};

const runVisual = async (browser, key, spec) => {
  console.log(`── ${key}`);
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  await page.goto(BASE_URL, { waitUntil: 'networkidle', timeout: 180000 });

  const slot = page.locator(spec.slotSelector).first();
  await settleForSpec(page, spec);
  const slotBox = await slot.boundingBox();
  assert(slotBox !== null, 'slot exists');

  const canvasBox = await waitForLoadedCanvas(page, spec.slotSelector);
  assert(
    canvasBox !== null,
    'canvas renders non-uniform pixels before timeout',
  );
  if (canvasBox === null) {
    await page.close();
    return;
  }

  const sizeMatches =
    Math.abs(canvasBox.width - slotBox.width) <= 2 &&
    canvasBox.height <= slotBox.height + 2;
  assert(
    sizeMatches,
    `canvas box ≈ slot box (${Math.round(canvasBox.width)}x${Math.round(canvasBox.height)} in ${Math.round(slotBox.width)}x${Math.round(slotBox.height)})`,
  );

  const clipA = await readClip(page, canvasBox);
  const background = cornerSample(clipA);
  const { coverage, dominantHue } = analyzeClip(
    clipA,
    background,
    spec.minSaturation,
  );
  assert(
    coverage >= spec.minCoverage,
    `coverage ${(coverage * 100).toFixed(1)}% ≥ ${spec.minCoverage * 100}%`,
  );
  if (dominantHue !== null) {
    assert(
      dominantHue >= spec.hueRangeDegrees[0] &&
        dominantHue <= spec.hueRangeDegrees[1],
      `dominant hue ${Math.round(dominantHue)}° within [${spec.hueRangeDegrees}]`,
    );
  } else {
    assert(false, 'saturated pixels present for hue measurement');
  }

  if (spec.animated) {
    await page.waitForTimeout(400);
    const clipB = await readClip(page, canvasBox);
    const motionDiff = diffClips(clipA, clipB);
    assert(
      motionDiff > MOTION_DIFF_FLOOR,
      `motion alive (diff ${(motionDiff * 100).toFixed(2)}%)`,
    );
  }

  if (spec.interactive) {
    const centerX = canvasBox.x + canvasBox.width / 2;
    const centerY = canvasBox.y + canvasBox.height / 2;
    const before = await readClip(page, canvasBox);
    await page.mouse.move(centerX, centerY);
    await page.mouse.down();
    for (let step = 1; step <= 5; step += 1) {
      // eslint-disable-next-line no-await-in-loop
      await page.mouse.move(centerX + step * 14, centerY + step * 6);
    }
    await page.mouse.up();
    await page.waitForTimeout(250);
    const after = await readClip(page, canvasBox);
    const dragDiff = diffClips(before, after);
    assert(
      dragDiff > MOTION_DIFF_FLOOR,
      `drag changes pixels (diff ${(dragDiff * 100).toFixed(2)}%)`,
    );
  }

  // Lifecycle: scroll far away, wait past the dispose grace, expect release.
  const counts = () =>
    page.evaluate(
      () => window.__visualRuntimeTest?.getActiveContextCount() ?? -1,
    );
  const activeWhileVisible = await counts();
  assert(
    activeWhileVisible >= 1,
    `context held while visible (count ${activeWhileVisible})`,
  );
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(5500);
  const activeAfterLeave = await counts();
  assert(
    activeAfterLeave < activeWhileVisible || activeAfterLeave === 0,
    `context released after leaving (count ${activeAfterLeave})`,
  );
  await settleForSpec(page, spec);
  const reacquired = await waitForLoadedCanvas(page, spec.slotSelector);
  assert(reacquired !== null, 'scene re-acquires on return');

  await page.close();

  // Reduced motion: designed scenes render one frozen frame.
  const reducedPage = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
    reducedMotion: 'reduce',
  });
  await reducedPage.goto(BASE_URL, {
    waitUntil: 'networkidle',
    timeout: 180000,
  });
  await settleForSpec(reducedPage, spec);
  const reducedCanvas = await waitForLoadedCanvas(
    reducedPage,
    spec.slotSelector,
  );
  if (reducedCanvas !== null) {
    const frozenA = await readClip(reducedPage, reducedCanvas);
    await reducedPage.waitForTimeout(400);
    const frozenB = await readClip(reducedPage, reducedCanvas);
    const frozenDiff = diffClips(frozenA, frozenB);
    assert(
      frozenDiff <= MOTION_DIFF_FLOOR,
      `reduced motion frozen (diff ${(frozenDiff * 100).toFixed(2)}%)`,
    );
  } else {
    // poster mode: no canvas at all is also a pass
    const canvasCount = await reducedPage
      .locator(`${spec.slotSelector} canvas`)
      .count();
    assert(canvasCount === 0, 'reduced motion shows poster (no canvas)');
  }
  await reducedPage.close();
};

const keys =
  process.argv.slice(2).length > 0
    ? process.argv.slice(2)
    : Object.keys(VISUALS);
const browser = await chromium.launch({ channel: 'chrome', headless: true });
for (const key of keys) {
  const spec = VISUALS[key];
  if (!spec) {
    failures.push(`unknown visual: ${key}`);
    continue;
  }
  // Visuals run one at a time so context counts stay interpretable.
  // eslint-disable-next-line no-await-in-loop
  await runVisual(browser, key, spec);
}
await browser.close();

if (failures.length > 0) {
  console.error(`\nvisual-battery: FAILED (${failures.length})`);
  process.exit(1);
}
console.log('\nvisual-battery: OK');
