import { chromium } from 'playwright';

// A/B battery for the ProductFeature section: both sites are driven down
// the tile grid and compared on lattice styles, tile content styles, the
// counter format, the entrance fade, and the interactive visuals
// (donut sweep, contacts checkbox + drag-scroll, kanban drag-drop-reorder
// with FLIP).
const OLD_URL = process.env.MOCKUP_OLD_URL ?? 'http://localhost:3002/product';
const NEW_URL =
  process.env.VISUAL_BATTERY_URL ?? 'http://localhost:3004/product';

const VIEWPORT = { width: 1440, height: 900 };

const failures = [];
const ok = (label, detail) =>
  console.log(`  ✓ ${label}${detail ? ` (${detail})` : ''}`);
const fail = (label, detail) => {
  failures.push(`${label}: ${detail}`);
  console.log(`  ✗ ${label}: ${detail}`);
};
const compare = (label, oldValue, newValue) => {
  const oldText = JSON.stringify(oldValue);
  const newText = JSON.stringify(newValue);
  if (oldText === newText) {
    ok(label, oldText.length > 90 ? undefined : oldText);
  } else {
    fail(label, `old ${oldText} vs new ${newText}`);
  }
};

const browser = await chromium.launch({ channel: 'chrome', headless: true });

async function openPage(url) {
  const page = await browser.newPage({ viewport: VIEWPORT });
  await page.goto(url, { waitUntil: 'load', timeout: 240000 });
  await page.waitForTimeout(800);
  return page;
}

async function scrollToText(page, text, settleMs) {
  const found = await page.evaluate((needle) => {
    // The eyebrow is a span on the old site and a p (house Eyebrow) here.
    const target = [...document.querySelectorAll('span, p, h2, h3')].find(
      (el) => el.textContent.trim() === needle,
    );
    if (!target) return false;
    target.scrollIntoView({ block: 'center' });
    return true;
  }, text);
  await page.waitForTimeout(settleMs);
  return found;
}

// The grid + tile anatomy, read from the counters' shared lattice.
function readSectionAnatomy(page) {
  return page.evaluate(() => {
    const counters = [...document.querySelectorAll('span')].filter((el) =>
      /^\d{2} \/ \d{2}$/.test(el.textContent.trim()),
    );
    if (counters.length === 0) return null;

    let grid = counters[0].parentElement;
    while (grid) {
      const style = getComputedStyle(grid);
      const holdsAll = counters.every((counter) => grid.contains(counter));
      if (holdsAll && style.borderTopWidth === '1px') break;
      grid = grid.parentElement;
    }
    const gridStyle = grid ? getComputedStyle(grid) : null;

    const cellEdges = grid
      ? [...grid.children].map((cell) => {
          const style = getComputedStyle(cell);
          return `${style.borderRightWidth} ${style.borderBottomWidth}`;
        })
      : [];

    let entrance = counters[0].parentElement;
    while (entrance) {
      const style = getComputedStyle(entrance);
      if (
        style.transitionProperty.includes('opacity') &&
        style.transitionDuration.includes('0.6s')
      )
        break;
      entrance = entrance.parentElement;
    }
    const entranceStyle = entrance ? getComputedStyle(entrance) : null;

    const headerRow = counters[0].parentElement;
    const category = headerRow?.querySelector('span');
    const categoryStyle = category ? getComputedStyle(category) : null;
    const counterStyle = getComputedStyle(counters[0]);
    const heading = [...document.querySelectorAll('h3')].find((el) =>
      grid?.contains(el),
    );
    const headingStyle = heading ? getComputedStyle(heading) : null;

    return {
      counters: counters.map((el) => el.textContent.trim()),
      gridBorder: gridStyle
        ? `${gridStyle.borderTopWidth} ${gridStyle.borderTopColor} r${gridStyle.borderRadius}`
        : null,
      cellEdges,
      entranceTransition: entranceStyle
        ? `${entranceStyle.transitionProperty} ${entranceStyle.transitionDuration}`
        : null,
      entranceOpacity: entranceStyle?.opacity ?? null,
      categoryStyle: categoryStyle
        ? `${categoryStyle.fontFamily.slice(0, 24)} ${categoryStyle.fontSize} ${categoryStyle.letterSpacing} ${categoryStyle.textTransform} ${categoryStyle.color}`
        : null,
      counterStyle: `${counterStyle.fontSize} ${counterStyle.color}`,
      headingStyle: headingStyle
        ? `${headingStyle.fontSize} ${headingStyle.fontWeight} ${headingStyle.color}`
        : null,
    };
  });
}

// The donut's value arc: the dasharrayed circle with the 1.2s sweep.
function readDonutState(page) {
  return page.evaluate(() => {
    const circle = [...document.querySelectorAll('circle')].find((el) => {
      const style = getComputedStyle(el);
      return (
        style.strokeDasharray !== 'none' &&
        style.transitionDuration.includes('1.2s')
      );
    });
    if (!circle) return null;
    const style = getComputedStyle(circle);
    return {
      transition: `${style.transitionProperty} ${style.transitionDuration}`,
      dashoffset: Number.parseFloat(style.strokeDashoffset),
    };
  });
}

// The contacts mini-table root, found from its view header. The hero's
// mockup also shows an "All Companies" view, so the match is scoped to
// the dark feature-card surface (#1d1d25).
const CONTACTS_ROOT = `
  const root = [...document.querySelectorAll('span')]
    .filter((el) => el.textContent.trim() === 'All Companies')
    .map((el) => el.parentElement?.parentElement)
    .find(
      (candidate) =>
        candidate &&
        getComputedStyle(candidate).backgroundColor === 'rgb(29, 29, 37)',
    );
`;

// "All Companies" first matches the hero viewbar, so scrolling goes
// through the scoped root rather than scrollToText.
async function scrollToContacts(page) {
  await page.evaluate(`(() => {
    ${CONTACTS_ROOT}
    root?.scrollIntoView({ block: 'center' });
  })()`);
  await page.waitForTimeout(1400);
}

function readContactsCheckbox(page) {
  return page.evaluate(`(() => {
    ${CONTACTS_ROOT}
    if (!root) return null;
    const boxes = [...root.querySelectorAll('div')].filter((el) => {
      const style = getComputedStyle(el);
      return style.width === '14px' && style.borderRadius === '3px';
    });
    const rowBox = boxes[1];
    if (!rowBox) return null;
    const rect = rowBox.getBoundingClientRect();
    const style = getComputedStyle(rowBox);
    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
      background: style.backgroundColor,
      borderColor: style.borderTopColor,
    };
  })()`);
}

function readContactsViewport(page) {
  return page.evaluate(`(() => {
    ${CONTACTS_ROOT}
    if (!root) return null;
    const viewport = [...root.querySelectorAll('div')].find(
      (el) => getComputedStyle(el).overflowX === 'auto',
    );
    if (!viewport) return null;
    const rect = viewport.getBoundingClientRect();
    return {
      x: rect.x + rect.width / 2,
      y: rect.y + rect.height / 2,
      scrollLeft: viewport.scrollLeft,
    };
  })()`);
}

// The pipeline board, found from its header; cards carry OPP- record ids.
function readPipelineState(page) {
  return page.evaluate(() => {
    const title = [...document.querySelectorAll('span')].find(
      (el) => el.textContent.trim() === 'All opportunities',
    );
    const root = title?.parentElement?.parentElement;
    if (!root) return null;

    const counts = ['Identified', 'Qualified'].map((label) => {
      const pill = [...root.querySelectorAll('span')].find(
        (el) => el.textContent.trim() === label,
      );
      return pill?.nextElementSibling?.textContent.trim() ?? null;
    });

    const cardRect = (recordId) => {
      const cards = [...root.querySelectorAll('div')].filter(
        (el) =>
          getComputedStyle(el).cursor === 'grab' &&
          el.textContent.includes(recordId),
      );
      const card = cards.at(-1);
      if (!card) return null;
      const rect = card.getBoundingClientRect();
      return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
    };

    return {
      counts,
      github: cardRect('OPP-1'),
      airbnb: cardRect('OPP-8'),
    };
  });
}

function countFlipAnimations(page) {
  return page.evaluate(
    () =>
      document
        .getAnimations()
        .filter(
          (animation) =>
            animation.constructor.name === 'Animation' &&
            animation.playState === 'running',
        ).length,
  );
}

const oldPage = await openPage(OLD_URL);
const newPage = await openPage(NEW_URL);
const pages = [
  ['old', oldPage],
  ['new', newPage],
];

// --- Section anatomy + lattice + entrance + tile styles ---------------
const anatomies = {};
for (const [name, page] of pages) {
  // eslint-disable-next-line no-await-in-loop
  const found = await scrollToText(page, 'Core Features', 1100);
  if (!found) fail(`feature section present on ${name} site`, 'no eyebrow');
  // eslint-disable-next-line no-await-in-loop
  anatomies[name] = await readSectionAnatomy(page);
}

if (!anatomies.old || !anatomies.new) {
  fail(
    'feature tiles readable on both sites',
    `old=${Boolean(anatomies.old)} new=${Boolean(anatomies.new)}`,
  );
} else {
  compare('tile counters match', anatomies.old.counters, anatomies.new.counters);
  compare('grid lattice border', anatomies.old.gridBorder, anatomies.new.gridBorder);
  compare('cell edge lattice', anatomies.old.cellEdges, anatomies.new.cellEdges);
  compare(
    'entrance fade transition',
    anatomies.old.entranceTransition,
    anatomies.new.entranceTransition,
  );
  compare(
    'entrance settled opacity',
    anatomies.old.entranceOpacity,
    anatomies.new.entranceOpacity,
  );
  compare('category label style', anatomies.old.categoryStyle, anatomies.new.categoryStyle);
  compare('counter style', anatomies.old.counterStyle, anatomies.new.counterStyle);
  compare('tile heading style', anatomies.old.headingStyle, anatomies.new.headingStyle);
}

// --- Donut sweep (spotlight active state) ------------------------------
const donuts = {};
for (const [name, page] of pages) {
  // eslint-disable-next-line no-await-in-loop
  await scrollToText(page, 'Sales performances', 1700);
  // eslint-disable-next-line no-await-in-loop
  donuts[name] = await readDonutState(page);
}
if (!donuts.old || !donuts.new) {
  fail(
    'donut arc present on both sites',
    `old=${Boolean(donuts.old)} new=${Boolean(donuts.new)}`,
  );
} else {
  compare('donut sweep transition', donuts.old.transition, donuts.new.transition);
  if (Math.abs(donuts.old.dashoffset - donuts.new.dashoffset) <= 1) {
    ok(
      'donut sweep settles at the same arc',
      `old ${donuts.old.dashoffset.toFixed(1)} vs new ${donuts.new.dashoffset.toFixed(1)}`,
    );
  } else {
    fail(
      'donut sweep settles at the same arc',
      `old ${donuts.old.dashoffset} vs new ${donuts.new.dashoffset}`,
    );
  }
}

// --- Contacts: checkbox + drag-scroll ----------------------------------
const checkboxes = {};
for (const [name, page] of pages) {
  // eslint-disable-next-line no-await-in-loop
  await scrollToContacts(page);
  // eslint-disable-next-line no-await-in-loop
  const before = await readContactsCheckbox(page);
  if (!before) {
    fail(`contacts checkbox found on ${name} site`, 'no 14px box');
    continue;
  }
  // eslint-disable-next-line no-await-in-loop
  await page.mouse.click(before.x, before.y);
  // eslint-disable-next-line no-await-in-loop
  await page.waitForTimeout(250);
  // eslint-disable-next-line no-await-in-loop
  checkboxes[name] = { before, after: await readContactsCheckbox(page) };
}
if (checkboxes.old && checkboxes.new) {
  compare(
    'checkbox unchecked chrome',
    `${checkboxes.old.before.background} ${checkboxes.old.before.borderColor}`,
    `${checkboxes.new.before.background} ${checkboxes.new.before.borderColor}`,
  );
  compare(
    'checkbox checked chrome',
    `${checkboxes.old.after.background} ${checkboxes.old.after.borderColor}`,
    `${checkboxes.new.after.background} ${checkboxes.new.after.borderColor}`,
  );
  if (checkboxes.new.before.background !== checkboxes.new.after.background) {
    ok('checkbox toggles on click');
  } else {
    fail('checkbox toggles on click', 'background unchanged');
  }
}

const scrolls = {};
for (const [name, page] of pages) {
  // eslint-disable-next-line no-await-in-loop
  const viewport = await readContactsViewport(page);
  if (!viewport) {
    fail(`contacts viewport found on ${name} site`, 'no overflow-x element');
    continue;
  }
  // eslint-disable-next-line no-await-in-loop
  await page.mouse.move(viewport.x, viewport.y);
  // eslint-disable-next-line no-await-in-loop
  await page.mouse.down();
  for (const step of [40, 80, 120, 160]) {
    // eslint-disable-next-line no-await-in-loop
    await page.mouse.move(viewport.x - step, viewport.y);
  }
  // eslint-disable-next-line no-await-in-loop
  await page.mouse.up();
  // eslint-disable-next-line no-await-in-loop
  const after = await readContactsViewport(page);
  scrolls[name] = { from: viewport.scrollLeft, to: after?.scrollLeft ?? null };
}
if (scrolls.old && scrolls.new) {
  if (scrolls.old.to > scrolls.old.from && scrolls.new.to > scrolls.new.from) {
    ok(
      'contacts table drag-scrolls on both sites',
      `old +${scrolls.old.to - scrolls.old.from}px, new +${scrolls.new.to - scrolls.new.from}px`,
    );
  } else {
    fail(
      'contacts table drag-scrolls on both sites',
      `old ${JSON.stringify(scrolls.old)} vs new ${JSON.stringify(scrolls.new)}`,
    );
  }
}

// --- Pipeline: drag-drop-reorder + FLIP --------------------------------
for (const [name, page] of pages) {
  // eslint-disable-next-line no-await-in-loop
  await scrollToText(page, 'All opportunities', 1400);
  // eslint-disable-next-line no-await-in-loop
  const before = await readPipelineState(page);
  if (!before?.github || !before.airbnb) {
    fail(`pipeline cards found on ${name} site`, JSON.stringify(before));
    continue;
  }
  compare(`pipeline lane counts at rest (${name})`, before.counts, ['2', '2']);

  const grabX = before.github.x + before.github.width / 2;
  const grabY = before.github.y + 12;
  // Drop above Airbnb's midpoint: lane 2, index 0 — both resident cards
  // get displaced, so the FLIP animations must fire.
  const dropX = before.airbnb.x + before.airbnb.width / 2;
  const dropY = before.airbnb.y + 5;

  // eslint-disable-next-line no-await-in-loop
  await page.mouse.move(grabX, grabY);
  // eslint-disable-next-line no-await-in-loop
  await page.mouse.down();
  for (const step of [0.25, 0.5, 0.75, 1]) {
    // eslint-disable-next-line no-await-in-loop
    await page.mouse.move(
      grabX + (dropX - grabX) * step,
      grabY + (dropY - grabY) * step,
    );
  }
  // eslint-disable-next-line no-await-in-loop
  await page.mouse.up();
  // eslint-disable-next-line no-await-in-loop
  const flipCount = await countFlipAnimations(page);
  // eslint-disable-next-line no-await-in-loop
  await page.waitForTimeout(450);
  // eslint-disable-next-line no-await-in-loop
  const after = await readPipelineState(page);

  if (after && after.counts[0] === '1' && after.counts[1] === '3') {
    ok(`pipeline drop reorders lanes on ${name} site`, '2/2 → 1/3');
  } else {
    fail(
      `pipeline drop reorders lanes on ${name} site`,
      `counts ${JSON.stringify(after?.counts)}`,
    );
  }
  if (flipCount >= 1) {
    ok(`displaced cards FLIP on ${name} site`, `${flipCount} running`);
  } else {
    fail(`displaced cards FLIP on ${name} site`, 'no WAAPI animation running');
  }
}

await browser.close();

if (failures.length > 0) {
  console.error(`product-feature-parity: FAILED (${failures.length})`);
  process.exitCode = 1;
} else {
  console.log('product-feature-parity: OK');
}
