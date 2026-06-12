import { chromium } from 'playwright';

// A/B battery for the product hero's scroll choreography: both sites are
// driven to the same morph positions (derived from each site's own track
// geometry) and compared on the values the old site defines as law.
const OLD_URL = process.env.MOCKUP_OLD_URL ?? 'http://localhost:3002/product';
const NEW_URL =
  process.env.VISUAL_BATTERY_URL ?? 'http://localhost:3004/product';

const VIEWPORT = { width: 1440, height: 900 };

const failures = [];
const ok = (label, detail) => console.log(`  ✓ ${label}${detail ? ` (${detail})` : ''}`);
const fail = (label, detail) => {
  failures.push(`${label}: ${detail}`);
  console.log(`  ✗ ${label}: ${detail}`);
};

const browser = await chromium.launch({ channel: 'chrome', headless: true });

async function openHero(url) {
  const page = await browser.newPage({ viewport: VIEWPORT });
  await page.goto(url, { waitUntil: 'load', timeout: 240000 });
  await page.waitForTimeout(1200);
  return page;
}

// The 200vh scroll track, found by its geometry on both sites.
async function trackGeometry(page) {
  return page.evaluate(() => {
    const candidates = [...document.querySelectorAll('section, div')];
    const track = candidates.find(
      (el) =>
        Math.abs(el.offsetHeight - window.innerHeight * 2) < 8 &&
        el.querySelector('h1, h2'),
    );
    if (!track) return null;
    const rect = track.getBoundingClientRect();
    return {
      top: rect.top + window.scrollY,
      height: track.offsetHeight,
    };
  });
}

async function scrollToProgress(page, geometry, progress) {
  const scrollable = geometry.height - VIEWPORT.height;
  await page.evaluate(
    ({ top }) => window.scrollTo(0, top),
    { top: geometry.top + progress * scrollable },
  );
  await page.waitForTimeout(450);
}

// The dark AI layer: the element carrying a clip-path inset.
async function readHeroState(page) {
  return page.evaluate(() => {
    const layers = [...document.querySelectorAll('div')];
    const dark = layers.find((el) => {
      const style = getComputedStyle(el);
      return (
        style.clipPath !== 'none' &&
        style.clipPath.includes('inset') &&
        style.position === 'absolute'
      );
    });
    // The sticky menu bar: 64px tall, pinned to the top on both sites.
    const header = [...document.querySelectorAll('header, section')].find(
      (el) => {
        const style = getComputedStyle(el);
        return (
          (style.position === 'fixed' || style.position === 'sticky') &&
          el.getBoundingClientRect().top <= 1 &&
          el.offsetHeight >= 40 &&
          el.offsetHeight <= 120
        );
      },
    );
    const headerStyle = header ? getComputedStyle(header) : null;
    const cursorNames = ['Alice', 'Ben', 'Cara'].filter((name) =>
      [...document.querySelectorAll('span')].some(
        (el) => el.textContent === name.toUpperCase() || el.textContent === name,
      ),
    );
    const darkStyle = dark ? getComputedStyle(dark) : null;
    return {
      clipPath: darkStyle?.clipPath ?? null,
      darkBackground: darkStyle?.backgroundColor ?? null,
      darkPointerEvents: darkStyle?.pointerEvents ?? null,
      menuBackground: headerStyle?.backgroundColor ?? null,
      cursorNames,
      hasStackCards:
        [...document.querySelectorAll('[role="tab"]')].length >= 4,
    };
  });
}

function parseInsetTop(clipPath) {
  const match = /inset\(([\d.]+)%/.exec(clipPath ?? '');
  return match ? Number(match[1]) : null;
}

const oldPage = await openHero(OLD_URL);
const newPage = await openHero(NEW_URL);

const oldGeometry = await trackGeometry(oldPage);
const newGeometry = await trackGeometry(newPage);

if (!oldGeometry || !newGeometry) {
  fail('scroll track present on both sites', `old=${Boolean(oldGeometry)} new=${Boolean(newGeometry)}`);
} else {
  ok('scroll track present on both sites');

  // scrollProgress -> expected morph via the shared smoothstep law.
  const CHECKPOINTS = [0, 0.1375, 0.275, 0.41, 0.6];

  // Checkpoints are inherently sequential: scroll, settle, read.
  for (const progress of CHECKPOINTS) {
    // eslint-disable-next-line no-await-in-loop
    await scrollToProgress(oldPage, oldGeometry, progress);
    // eslint-disable-next-line no-await-in-loop
    await scrollToProgress(newPage, newGeometry, progress);

    // eslint-disable-next-line no-await-in-loop
    const oldState = await readHeroState(oldPage);
    // eslint-disable-next-line no-await-in-loop
    const newState = await readHeroState(newPage);

    const oldInset = parseInsetTop(oldState.clipPath);
    const newInset = parseInsetTop(newState.clipPath);

    if (
      oldInset !== null &&
      newInset !== null &&
      Math.abs(oldInset - newInset) <= 1.5
    ) {
      ok(
        `wipe position matches at progress ${progress}`,
        `old ${oldInset?.toFixed(1)}% vs new ${newInset?.toFixed(1)}%`,
      );
    } else {
      fail(
        `wipe position matches at progress ${progress}`,
        `old ${oldState.clipPath} vs new ${newState.clipPath}`,
      );
    }

    if (oldState.menuBackground === newState.menuBackground) {
      ok(
        `menu background matches at progress ${progress}`,
        newState.menuBackground,
      );
    } else {
      fail(
        `menu background matches at progress ${progress}`,
        `old ${oldState.menuBackground} vs new ${newState.menuBackground}`,
      );
    }

    if (oldState.darkPointerEvents === newState.darkPointerEvents) {
      ok(
        `AI layer interactivity matches at progress ${progress}`,
        newState.darkPointerEvents,
      );
    } else {
      fail(
        `AI layer interactivity matches at progress ${progress}`,
        `old ${oldState.darkPointerEvents} vs new ${newState.darkPointerEvents}`,
      );
    }
  }

  // At rest: the collaborative cursors tour the intro on both sites.
  await scrollToProgress(oldPage, oldGeometry, 0);
  await scrollToProgress(newPage, newGeometry, 0);
  const oldRest = await readHeroState(oldPage);
  const newRest = await readHeroState(newPage);

  if (
    oldRest.cursorNames.length === 3 &&
    newRest.cursorNames.length === 3
  ) {
    ok('three collaborator cursors at rest on both sites');
  } else {
    fail(
      'three collaborator cursors at rest on both sites',
      `old ${oldRest.cursorNames.join(',')} vs new ${newRest.cursorNames.join(',')}`,
    );
  }

  if (oldRest.darkBackground === newRest.darkBackground) {
    ok('dark layer surface matches', newRest.darkBackground);
  } else {
    fail(
      'dark layer surface matches',
      `old ${oldRest.darkBackground} vs new ${newRest.darkBackground}`,
    );
  }

  // Fully morphed: playback starts (agent steps / streamed copy appear).
  await scrollToProgress(newPage, newGeometry, 0.6);
  await newPage.waitForTimeout(4500);
  // By 4.5s the steps have collapsed behind the summary and the answer
  // streams: either trace proves playback ran.
  const playbackStarted = await newPage.evaluate(
    () =>
      document.body.textContent.includes('Organized your open deals') ||
      document.body.textContent.includes('3 steps') ||
      document.body.textContent.includes('Read 24 deals'),
  );
  if (playbackStarted) {
    ok('AI playback runs once fully morphed (first scene steps complete)');
  } else {
    fail('AI playback runs once fully morphed', 'no completed step copy found');
  }

  if (newRest.hasStackCards) {
    ok('stacked tab deck renders four tabs');
  } else {
    fail('stacked tab deck renders four tabs', 'fewer than 4 role=tab');
  }

  // RATIFIED DIVERGENCE (user, 2026-06-12): the exit crossing hands off
  // transparently like the entry; the old site faded through greys that
  // matched neither surface. Asserting the difference keeps it deliberate.
  const exitProgress =
    (oldGeometry.height - VIEWPORT.height + (VIEWPORT.height - 32)) /
    (oldGeometry.height - VIEWPORT.height);
  await scrollToProgress(oldPage, oldGeometry, exitProgress);
  await scrollToProgress(newPage, newGeometry, exitProgress);
  const oldExit = await readHeroState(oldPage);
  const newExit = await readHeroState(newPage);
  const newExitTransparent =
    newExit.menuBackground === 'rgba(0, 0, 0, 0)' ||
    newExit.menuBackground === 'transparent';
  if (newExitTransparent && newExit.menuBackground !== oldExit.menuBackground) {
    ok(
      'exit crossing hands off transparently (ledgered divergence)',
      `old ${oldExit.menuBackground} vs new ${newExit.menuBackground}`,
    );
  } else {
    fail(
      'exit crossing hands off transparently (ledgered divergence)',
      `old ${oldExit.menuBackground} vs new ${newExit.menuBackground}`,
    );
  }
}

await browser.close();

if (failures.length > 0) {
  console.error(`product-hero-parity: FAILED (${failures.length})`);
  process.exitCode = 1;
} else {
  console.log('product-hero-parity: OK');
}
