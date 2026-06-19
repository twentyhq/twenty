import {
  createBattery,
  launchBrowser,
  NEW_BASE,
  OLD_BASE,
  VIEWPORT,
} from './battery-kit.mjs';

// A/B battery for the product demo closer: centered intro, the emergent
// two-line heading break, CTA chrome, the pattern backdrop, and the
// static (terminal-less) mockup.

const { compare, fail, finish, ok } = createBattery('product-demo-parity');

const browser = await launchBrowser();

async function readDemo(base) {
  const page = await browser.newPage({ viewport: VIEWPORT });
  await page.goto(`${base}/product`, { waitUntil: 'load', timeout: 240000 });
  await page.waitForTimeout(1200);
  // Park on the section first so the lazy pattern image loads.
  await page.evaluate(() => {
    const heading = [...document.querySelectorAll('h2')].find((el) =>
      el.textContent.includes('thousand words'),
    );
    heading?.scrollIntoView({ block: 'start' });
  });
  await page.waitForTimeout(1200);
  const state = await page.evaluate(() => {
    const heading = [...document.querySelectorAll('h2')].find((el) =>
      el.textContent.includes('thousand words'),
    );
    if (!heading) return null;
    heading.scrollIntoView({ block: 'center' });
    const headingStyle = getComputedStyle(heading);

    // First-line text: walk characters until the line top jumps.
    const range = document.createRange();
    const walker = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    let firstLineTop = null;
    let firstLine = '';
    let node;
    outer: while ((node = walker.nextNode())) {
      for (let index = 0; index < node.textContent.length; index += 1) {
        range.setStart(node, index);
        range.setEnd(node, index + 1);
        const rect = range.getBoundingClientRect();
        if (rect.width === 0) continue;
        if (firstLineTop === null) firstLineTop = rect.top;
        if (Math.abs(rect.top - firstLineTop) > 5) break outer;
        firstLine += node.textContent[index];
      }
    }

    const root = heading.closest('section') ?? heading.closest('div');
    const cta = [...root.querySelectorAll('a')].find((el) =>
      el.textContent.includes('Try Twenty Cloud'),
    );
    const ctaStyle = cta ? getComputedStyle(cta) : null;

    // The pattern layer is a sibling of the section on the old site;
    // search from the shared wrapper.
    const wrapper = root.parentElement ?? root;
    const pattern = [...wrapper.querySelectorAll('img')].find((img) =>
      decodeURIComponent(img.currentSrc).includes('product/demo/background'),
    );
    const patternLayer = pattern?.closest('div[aria-hidden]');
    const patternStyle = patternLayer ? getComputedStyle(patternLayer) : null;

    const ctaToMockupGap = (() => {
      const ctaRect = cta?.getBoundingClientRect();
      if (!ctaRect) return null;
      const frameBelow = [...document.querySelectorAll('main div')].find(
        (el) => {
          const rect = el.getBoundingClientRect();
          return (
            rect.width >= 1000 &&
            rect.top > ctaRect.bottom &&
            getComputedStyle(el).borderRadius === '20px'
          );
        },
      );
      return frameBelow
        ? Math.round(frameBelow.getBoundingClientRect().top - ctaRect.bottom)
        : null;
    })();

    // The static mockup window: the 20px-radius frame at the scene's
    // 1040x676 (old aspect 1280/832 reduces to the same 20:13).
    const frame = [...document.querySelectorAll('div')].find((el) => {
      const rect = el.getBoundingClientRect();
      return (
        rect.width >= 900 &&
        rect.top > heading.getBoundingClientRect().top &&
        getComputedStyle(el).borderRadius === '20px' &&
        Math.abs(rect.width / rect.height - 20 / 13) < 0.01 &&
        el.textContent.includes('Companies')
      );
    });

    return {
      ctaToMockupGap,
      firstLine: firstLine.trim(),
      headingStyle: `${headingStyle.fontSize} ${headingStyle.fontWeight} ${headingStyle.textAlign}`,
      ctaHref: cta?.getAttribute('href') ?? null,
      ctaInk: ctaStyle ? `${ctaStyle.backgroundColor} ${ctaStyle.color}` : null,
      patternLoaded: Boolean(pattern && pattern.naturalWidth > 0),
      patternOpacity: patternStyle?.opacity ?? null,
      mockupPresent: Boolean(frame),
      mockupRows: frame
        ? frame.textContent.includes('Anthropic') &&
          frame.textContent.includes('Stripe')
        : false,
    };
  });
  await page.close();
  return state;
}

const oldDemo = await readDemo(OLD_BASE);
const newDemo = await readDemo(NEW_BASE);

if (!oldDemo || !newDemo) {
  fail(
    'demo section present on both sites',
    `old=${Boolean(oldDemo)} new=${Boolean(newDemo)}`,
  );
} else {
  compare(
    'heading first line breaks after "a"',
    oldDemo.firstLine,
    newDemo.firstLine,
  );
  compare('heading style', oldDemo.headingStyle, newDemo.headingStyle);
  compare('CTA href', oldDemo.ctaHref, newDemo.ctaHref);
  compare('CTA chrome', oldDemo.ctaInk, newDemo.ctaInk);
  compare(
    'pattern backdrop at 0.6 over the lower stage',
    `${oldDemo.patternLoaded} ${oldDemo.patternOpacity}`,
    `${newDemo.patternLoaded} ${newDemo.patternOpacity}`,
  );
  compare(
    'static mockup with the companies fiction',
    `${oldDemo.mockupPresent} ${oldDemo.mockupRows}`,
    `${newDemo.mockupPresent} ${newDemo.mockupRows}`,
  );

  // RATIFIED DIVERGENCE (user, 2026-06-13): the demo hangs the mockup at
  // the hero's CTA-to-window measure (68px token) instead of the old
  // demo's looser stack spacing — the two CTA-over-mockup moments read
  // the same. Asserting the difference keeps it deliberate.
  if (
    newDemo.ctaToMockupGap === 68 &&
    oldDemo.ctaToMockupGap !== newDemo.ctaToMockupGap
  ) {
    ok(
      'demo mockup hangs at the hero CTA gap (ledgered divergence)',
      `old ${oldDemo.ctaToMockupGap}px vs new ${newDemo.ctaToMockupGap}px`,
    );
  } else {
    fail(
      'demo mockup hangs at the hero CTA gap (ledgered divergence)',
      `old ${oldDemo.ctaToMockupGap}px vs new ${newDemo.ctaToMockupGap}px`,
    );
  }
}

await finish(browser);
