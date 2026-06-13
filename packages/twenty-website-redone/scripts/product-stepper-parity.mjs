import {
  createBattery,
  launchBrowser,
  NEW_BASE,
  OLD_BASE,
  openPage,
} from './battery-kit.mjs';

// A/B battery for the product stepper: section chrome, the sticky scroll
// choreography at pinned positions, the visual crossfade, and the three
// interactive editors (entity drag, workflow beat, layout toggle+reorder).

const HEADING = 'Go the extra mile';

const { compare, fail, finish, ok } = createBattery('product-stepper-parity');

// The old site tints the stepper section with 5% black over white; ours
// bakes the same color as a solid token. Composite before comparing.
const compositeOverWhite = (cssColor) => {
  const match = /rgba?\(([\d.]+), ([\d.]+), ([\d.]+)(?:, ([\d.]+))?\)/.exec(
    cssColor ?? '',
  );
  if (!match) return cssColor;
  const alpha = match[4] === undefined ? 1 : Number(match[4]);
  const channel = (value) =>
    Math.round(Number(value) * alpha + 255 * (1 - alpha));
  return `rgb(${channel(match[1])}, ${channel(match[2])}, ${channel(match[3])})`;
};

const browser = await launchBrowser();

// Scrolls the stepper section to a fraction of its own scrollable track.
async function scrollSectionTo(page, trackFraction) {
  await page.evaluate(
    ({ needle, fraction }) => {
      const heading = [...document.querySelectorAll('h2')].find((el) =>
        el.textContent.includes(needle),
      );
      const section = heading?.closest('section');
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const top = rect.top + window.scrollY;
      const scrollable = section.offsetHeight - window.innerHeight;
      window.scrollTo(0, top + fraction * Math.max(scrollable, 0));
    },
    { needle: HEADING, fraction: trackFraction },
  );
  await page.waitForTimeout(700);
}

function readStepperState(page) {
  return page.evaluate((needle) => {
    const heading = [...document.querySelectorAll('h2')].find((el) =>
      el.textContent.includes(needle),
    );
    const section = heading?.closest('section');
    if (!section) return null;
    const sectionStyle = getComputedStyle(section);
    const headingStyle = getComputedStyle(heading);

    // Step rows: each holds a 22px icon box; read its block's inline
    // opacity/transform vars or styles.
    const stepLabels = ['Data model', 'Automation', 'Layout'];
    const steps = stepLabels.map((label) => {
      const labelNode = [...section.querySelectorAll('span, h3, div')].find(
        (el) => el.childElementCount === 0 && el.textContent.trim() === label,
      );
      let block = labelNode;
      while (block && block.parentElement !== null) {
        const style = getComputedStyle(block);
        if (style.transitionProperty.includes('opacity')) break;
        block = block.parentElement;
      }
      const blockStyle = block ? getComputedStyle(block) : null;
      const iconBox = labelNode?.parentElement?.querySelector('div');
      return {
        opacity: blockStyle ? Number(blockStyle.opacity).toFixed(2) : null,
        moving: blockStyle ? blockStyle.transform !== 'none' : null,
        iconBoxBackground: iconBox
          ? getComputedStyle(iconBox).backgroundColor
          : null,
      };
    });

    // The visual slides: absolute crossfading layers inside the frame.
    const slides = [...section.querySelectorAll('div')].filter((el) => {
      const style = getComputedStyle(el);
      return (
        style.position === 'absolute' &&
        style.transitionProperty.includes('opacity') &&
        style.transitionDuration.includes('0.4s') &&
        el.querySelector('svg')
      );
    });

    const frame = [...section.querySelectorAll('div')].find((el) => {
      const ratio = el.offsetWidth / el.offsetHeight;
      return el.querySelector('img') && Math.abs(ratio - 672 / 705) < 0.01;
    });
    const frameImages = frame
      ? [...frame.querySelectorAll('img')].map((img) => img.naturalWidth > 0)
      : [];

    return {
      sectionBackground: sectionStyle.backgroundColor,
      headingStyle: `${headingStyle.fontSize} ${headingStyle.fontWeight}`,
      steps,
      slideOpacities: slides.map((el) => Number(getComputedStyle(el).opacity)),
      frameAspectOk: Boolean(frame),
      frameImages,
    };
  }, HEADING);
}

// Finds a draggable card by its label inside the active slide and returns
// its center plus the connector layer's path data for follow checks.
function readDraggable(page, labelText) {
  return page.evaluate((label) => {
    const node = [...document.querySelectorAll('span, div')].find(
      (el) => el.childElementCount === 0 && el.textContent.trim() === label,
    );
    let card = node;
    while (card) {
      const style = getComputedStyle(card);
      if (style.position === 'absolute' && style.cursor === 'grab') break;
      card = card.parentElement;
    }
    if (!card) return null;
    const rect = card.getBoundingClientRect();
    const svg = card.parentElement?.querySelector('svg');
    return {
      x: rect.x + rect.width / 2,
      y: rect.y + 10,
      left: rect.x,
      paths: svg
        ? [...svg.querySelectorAll('path')].map((p) => p.getAttribute('d'))
        : [],
    };
  }, labelText);
}

const oldPage = await openPage(browser, `${OLD_BASE}/product`);
const newPage = await openPage(browser, `${NEW_BASE}/product`);
const pages = [
  ['old', oldPage],
  ['new', newPage],
];

// --- Step 1: section chrome + initial choreography ---------------------
await scrollSectionTo(oldPage, 0.05);
await scrollSectionTo(newPage, 0.05);
const oldStart = await readStepperState(oldPage);
const newStart = await readStepperState(newPage);

if (!oldStart || !newStart) {
  fail(
    'stepper present on both sites',
    `old=${Boolean(oldStart)} new=${Boolean(newStart)}`,
  );
} else {
  compare(
    'section background (composited)',
    compositeOverWhite(oldStart.sectionBackground),
    compositeOverWhite(newStart.sectionBackground),
  );
  compare('heading style', oldStart.headingStyle, newStart.headingStyle);
  compare(
    'step choreography at start',
    oldStart.steps.map((step) => `${step.opacity}|${step.moving}`),
    newStart.steps.map((step) => `${step.opacity}|${step.moving}`),
  );
  compare(
    'active step icon box ink',
    oldStart.steps[0].iconBoxBackground,
    newStart.steps[0].iconBoxBackground,
  );
  compare(
    'first slide active, rest hidden',
    oldStart.slideOpacities,
    newStart.slideOpacities,
  );
  if (newStart.frameAspectOk && newStart.frameImages.every(Boolean)) {
    ok('frame holds 672/705 with both artwork images loaded');
  } else {
    fail(
      'frame holds 672/705 with both artwork images loaded',
      JSON.stringify(newStart),
    );
  }
}

// --- Mid-track: second step takes over ----------------------------------
await scrollSectionTo(oldPage, 0.5);
await scrollSectionTo(newPage, 0.5);
const oldMid = await readStepperState(oldPage);
const newMid = await readStepperState(newPage);
compare(
  'step choreography mid-track',
  oldMid.steps.map((step) => `${step.opacity}|${step.moving}`),
  newMid.steps.map((step) => `${step.opacity}|${step.moving}`),
);
compare(
  'second slide active mid-track',
  oldMid.slideOpacities,
  newMid.slideOpacities,
);

// Workflow beat: while the second slide is active, check badges tick in.
for (const [name, page] of pages) {
  // eslint-disable-next-line no-await-in-loop
  await page.waitForTimeout(2600);
  // eslint-disable-next-line no-await-in-loop
  const visibleChecks = await page.evaluate(() => {
    return [...document.querySelectorAll('span')].filter((el) => {
      const style = getComputedStyle(el);
      return (
        style.width === '12px' &&
        style.height === '12px' &&
        Number(style.opacity) === 1 &&
        el.querySelector('svg')
      );
    }).length;
  });
  if (visibleChecks >= 1) {
    ok(`workflow beat ticks check badges on ${name} site`, `${visibleChecks}`);
  } else {
    fail(`workflow beat ticks check badges on ${name} site`, '0 visible');
  }
}

// --- Back to step 1: entity drag + edges follow -------------------------
for (const [name, page] of pages) {
  // eslint-disable-next-line no-await-in-loop
  await scrollSectionTo(page, 0.05);
  // eslint-disable-next-line no-await-in-loop
  await page.waitForTimeout(600);
  // eslint-disable-next-line no-await-in-loop
  const before = await readDraggable(page, 'Workspaces');
  if (!before) {
    fail(`entity card found on ${name} site`, 'no Workspaces card');
    continue;
  }
  // eslint-disable-next-line no-await-in-loop
  await page.mouse.move(before.x, before.y);
  // eslint-disable-next-line no-await-in-loop
  await page.mouse.down();
  for (const step of [10, 25, 40]) {
    // eslint-disable-next-line no-await-in-loop
    await page.mouse.move(before.x + step, before.y + step);
  }
  // eslint-disable-next-line no-await-in-loop
  await page.mouse.up();
  // eslint-disable-next-line no-await-in-loop
  const after = await readDraggable(page, 'Workspaces');
  const moved = after && Math.abs(after.left - before.left) >= 30;
  const edgesFollowed =
    after && JSON.stringify(after.paths) !== JSON.stringify(before.paths);
  if (moved && edgesFollowed) {
    ok(`entity drag moves card and edges follow on ${name} site`);
  } else {
    fail(
      `entity drag moves card and edges follow on ${name} site`,
      `moved=${moved} edges=${edgesFollowed}`,
    );
  }
}

// --- Step 3: layout visibility toggle ------------------------------------
for (const [name, page] of pages) {
  // eslint-disable-next-line no-await-in-loop
  await scrollSectionTo(page, 0.85);
  // eslint-disable-next-line no-await-in-loop
  await page.waitForTimeout(700);
  // eslint-disable-next-line no-await-in-loop
  const eye = await page.evaluate(() => {
    // The hidden ICP field renders the slashed eye (a 3-13 diagonal line).
    const slashed = [...document.querySelectorAll('svg')].find((svg) =>
      [...svg.querySelectorAll('path')].some(
        (path) => path.getAttribute('d') === 'M3 3l10 10',
      ),
    );
    if (!slashed) return null;
    const rect = slashed.getBoundingClientRect();
    return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 };
  });
  if (!eye) {
    fail(`hidden-field eye found on ${name} site`, 'no slashed eye glyph');
    continue;
  }
  // The field row captures the pointer on press (drag affordance), which
  // retargets synthesized clicks on both sites — drive the button itself.
  // eslint-disable-next-line no-await-in-loop
  await page.evaluate(() => {
    const slashed = [...document.querySelectorAll('svg')].find((svg) =>
      [...svg.querySelectorAll('path')].some(
        (path) => path.getAttribute('d') === 'M3 3l10 10',
      ),
    );
    slashed?.closest('span, div')?.click();
  });
  // eslint-disable-next-line no-await-in-loop
  await page.waitForTimeout(250);
  // eslint-disable-next-line no-await-in-loop
  const slashedCount = await page.evaluate(
    () =>
      [...document.querySelectorAll('svg')].filter((svg) =>
        [...svg.querySelectorAll('path')].some(
          (path) => path.getAttribute('d') === 'M3 3l10 10',
        ),
      ).length,
  );
  if (slashedCount === 0) {
    ok(`layout eye toggle reveals the hidden field on ${name} site`);
  } else {
    fail(
      `layout eye toggle reveals the hidden field on ${name} site`,
      `${slashedCount} slashed eyes remain`,
    );
  }
}

await finish(browser);
