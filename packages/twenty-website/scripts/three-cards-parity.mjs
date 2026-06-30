import {
  createBattery,
  launchBrowser,
  NEW_BASE,
  OLD_BASE,
  openPage,
} from './battery-kit.mjs';

// A/B battery for the three-cards family: the home section's restored
// scroll choreography (old == new at pinned scroll positions) and the
// product variant's intro, section rhythm, and footerless cards.

const HOME_HEADING = 'Assemble, iterate and adapt a robust CRM,';
const PRODUCT_HEADING = 'A modern CRM with';

const { compare, fail, finish, ok } = createBattery('three-cards-parity');

const browser = await launchBrowser();

const openSitePage = (base, path, reducedMotion = false) =>
  openPage(browser, `${base}${path}`, { reducedMotion, settleMs: 900 });

// The grid + its will-change slots, found from the section's heading.
function readSection(page, headingNeedle) {
  return page.evaluate((needle) => {
    const heading = [...document.querySelectorAll('h2')].find((el) =>
      el.textContent.includes(needle),
    );
    const section = heading?.closest('section');
    if (!section) return null;

    const slots = [...section.querySelectorAll('div')].filter((el) => {
      const style = getComputedStyle(el);
      return style.willChange.includes('transform') && el.children.length === 1;
    });
    const grid = slots[0]?.parentElement;
    const gridStyle = grid ? getComputedStyle(grid) : null;
    const sectionStyle = getComputedStyle(section);
    const containerStyle = grid?.closest('section > *')
      ? getComputedStyle(section.children[0])
      : null;
    const headingStyle = getComputedStyle(heading);

    const rect = grid?.getBoundingClientRect();
    return {
      slotPoses: slots.map((el) => `${el.style.opacity}|${el.style.transform}`),
      slotCount: slots.length,
      gridTop: rect ? rect.top + window.scrollY : null,
      gridColumns: gridStyle
        ? `${gridStyle.gridAutoFlow} ${gridStyle.gap}`
        : null,
      sectionPadding: `${sectionStyle.paddingTop} ${sectionStyle.paddingBottom}`,
      containerPadding: containerStyle
        ? `${containerStyle.paddingLeft} ${containerStyle.rowGap}`
        : null,
      headingStyle: `${headingStyle.fontSize} ${headingStyle.fontWeight} ${headingStyle.maxWidth}`,
      // Per-card anatomy: an h3, a body, and whether a footer rendered.
      cards: slots.map((slot) => ({
        hasHeading: Boolean(slot.querySelector('h3')),
        hasFooter: Boolean(slot.querySelector('footer')),
      })),
    };
  }, headingNeedle);
}

// Sub-pixel scroll residuals differ between the sites' page heights, so
// mid-travel poses compare numerically, not byte-wise.
const parsePose = (pose) => {
  const [opacity, transform] = pose.split('|');
  const translate = /translateY\(([-\d.]+)px\)/.exec(transform);
  const scale = /scale\(([-\d.]+)\)/.exec(transform);
  return {
    opacity: Number(opacity),
    translateY: translate ? Number(translate[1]) : null,
    scale: scale ? Number(scale[1]) : null,
  };
};

async function scrollGridTo(page, gridTop, viewportFraction) {
  await page.evaluate(
    ({ top, fraction }) =>
      window.scrollTo(0, Math.max(0, top - window.innerHeight * fraction)),
    { top: gridTop, fraction: viewportFraction },
  );
  await page.waitForTimeout(350);
}

// --- HOME: restored scroll choreography --------------------------------
{
  const oldPage = await openSitePage(OLD_BASE, '/');
  const newPage = await openSitePage(NEW_BASE, '/');

  const oldRest = await readSection(oldPage, HOME_HEADING);
  const newRest = await readSection(newPage, HOME_HEADING);

  if (!oldRest || !newRest) {
    fail(
      'home three-cards present on both sites',
      `old=${Boolean(oldRest)} new=${Boolean(newRest)}`,
    );
  } else {
    compare('home slot count', oldRest.slotCount, newRest.slotCount);
    compare(
      'home initial card poses (grid off-screen)',
      oldRest.slotPoses,
      newRest.slotPoses,
    );

    // Mid-travel: grid top at 60% of the viewport → progress 0.5.
    await scrollGridTo(oldPage, oldRest.gridTop, 0.6);
    await scrollGridTo(newPage, newRest.gridTop, 0.6);
    const oldMid = await readSection(oldPage, HOME_HEADING);
    const newMid = await readSection(newPage, HOME_HEADING);
    const midMatches = oldMid.slotPoses.every((oldPose, poseNumber) => {
      const a = parsePose(oldPose);
      const b = parsePose(newMid.slotPoses[poseNumber] ?? '');
      return (
        Math.abs(a.opacity - b.opacity) <= 0.02 &&
        a.translateY !== null &&
        b.translateY !== null &&
        Math.abs(a.translateY - b.translateY) <= 2 &&
        Math.abs(a.scale - b.scale) <= 0.002
      );
    });
    if (midMatches) {
      ok('home mid-scroll card poses match within tolerance');
    } else {
      fail(
        'home mid-scroll card poses match within tolerance',
        `old ${JSON.stringify(oldMid.slotPoses)} vs new ${JSON.stringify(newMid.slotPoses)}`,
      );
    }
    const midMoving = newMid.slotPoses.some(
      (pose) => !pose.startsWith('1|') || pose.includes('translateY'),
    );
    if (midMoving) {
      ok('home cards are mid-travel at the checkpoint');
    } else {
      fail(
        'home cards are mid-travel at the checkpoint',
        JSON.stringify(newMid.slotPoses),
      );
    }

    // Settled: grid top at 10% of the viewport → full progress.
    await scrollGridTo(oldPage, oldRest.gridTop, 0.1);
    await scrollGridTo(newPage, newRest.gridTop, 0.1);
    const oldDone = await readSection(oldPage, HOME_HEADING);
    const newDone = await readSection(newPage, HOME_HEADING);
    compare(
      'home settled card poses byte-equal',
      oldDone.slotPoses,
      newDone.slotPoses,
    );
    compare('home settled pose value', newDone.slotPoses, [
      '1|translateY(0px) scale(1)',
      '1|translateY(0px) scale(1)',
      '1|translateY(0px) scale(1)',
    ]);

    compare(
      'home cards keep attribution footers',
      newDone.cards.map((card) => card.hasFooter),
      [true, true, true],
    );
  }

  await oldPage.close();
  await newPage.close();

  // RATIFIED DIVERGENCE: reduced motion settles the cards; the old site
  // animates regardless. Asserting the difference keeps it deliberate.
  const oldReduced = await openSitePage(OLD_BASE, '/', true);
  const newReduced = await openSitePage(NEW_BASE, '/', true);
  const oldReducedRest = await readSection(oldReduced, HOME_HEADING);
  const newReducedRest = await readSection(newReduced, HOME_HEADING);
  await scrollGridTo(oldReduced, oldReducedRest.gridTop, 0.6);
  await scrollGridTo(newReduced, newReducedRest.gridTop, 0.6);
  const oldReducedMid = await readSection(oldReduced, HOME_HEADING);
  const newReducedMid = await readSection(newReduced, HOME_HEADING);
  const newSettled = newReducedMid.slotPoses.every((pose) => pose === '1|none');
  const divergesFromOld =
    JSON.stringify(oldReducedMid.slotPoses) !==
    JSON.stringify(newReducedMid.slotPoses);
  if (newSettled && divergesFromOld) {
    ok('reduced motion settles cards (ledgered divergence from old)');
  } else {
    fail(
      'reduced motion settles cards (ledgered divergence from old)',
      `new ${JSON.stringify(newReducedMid.slotPoses)} old ${JSON.stringify(oldReducedMid.slotPoses)}`,
    );
  }
  await oldReduced.close();
  await newReduced.close();
}

// --- PRODUCT: intro, rhythm, footerless cards ---------------------------
{
  const oldPage = await openSitePage(OLD_BASE, '/product');
  const newPage = await openSitePage(NEW_BASE, '/product');

  const oldSection = await readSection(oldPage, PRODUCT_HEADING);
  const newSection = await readSection(newPage, PRODUCT_HEADING);

  // The rhythm system owns section padding universally (ratified standard:
  // the old site padded each section's inner container ad hoc) — the
  // product section must carry exactly the home section's rhythm.
  const newHomePage = await openSitePage(NEW_BASE, '/');
  const newHomeSection = await readSection(newHomePage, HOME_HEADING);
  compare(
    'product section rhythm equals home section rhythm (universal padding)',
    newHomeSection?.sectionPadding,
    newSection?.sectionPadding,
  );
  await newHomePage.close();

  if (!oldSection || !newSection) {
    fail(
      'product three-cards present on both sites',
      `old=${Boolean(oldSection)} new=${Boolean(newSection)}`,
    );
  } else {
    compare('product slot count', oldSection.slotCount, newSection.slotCount);
    compare(
      'product grid flow and gap',
      oldSection.gridColumns,
      newSection.gridColumns,
    );
    compare(
      'product heading style + measure',
      oldSection.headingStyle,
      newSection.headingStyle,
    );
    compare(
      'product cards carry no footer',
      newSection.cards.map((card) => card.hasFooter),
      [false, false, false],
    );
    compare(
      'product card anatomy matches old',
      oldSection.cards,
      newSection.cards,
    );

    // Settled choreography on product too (same shared machinery).
    await scrollGridTo(oldPage, oldSection.gridTop, 0.1);
    await scrollGridTo(newPage, newSection.gridTop, 0.1);
    const oldDone = await readSection(oldPage, PRODUCT_HEADING);
    const newDone = await readSection(newPage, PRODUCT_HEADING);
    compare(
      'product settled card poses byte-equal',
      oldDone.slotPoses,
      newDone.slotPoses,
    );
  }

  await oldPage.close();
  await newPage.close();
}

await finish(browser);
