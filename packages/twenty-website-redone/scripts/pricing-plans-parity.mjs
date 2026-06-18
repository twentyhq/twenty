import {
  createBattery,
  launchBrowser,
  NEW_BASE,
  OLD_BASE,
  openPage,
} from './battery-kit.mjs';

// A/B battery for the pricing plans: both cards' static anatomy, and the
// two toggles that drive the shared hosting state and local billing
// state through the price counter and the feature-list transition.
const { compare, fail, finish, ok } = createBattery('pricing-plans-parity');

const browser = await launchBrowser();

// Reads the two plan cards: heading, price value/suffix, CTA, bullets.
function readPlanCards(page) {
  return page.evaluate(() => {
    const headings = [...document.querySelectorAll('h3')].filter((el) =>
      ['Pro', 'Organization'].includes(el.textContent.trim()),
    );
    return headings.map((heading) => {
      const card = heading.closest('div[class]')?.parentElement?.parentElement;
      const scope = card ?? heading.closest('section');
      const priceHeading = scope?.querySelector('h4');
      const suffix = priceHeading?.nextElementSibling;
      const cta = scope?.querySelector('a');
      const bullets = [...scope.querySelectorAll('li')]
        .filter((li) => li.offsetParent !== null)
        .map((li) => li.textContent.trim());
      return {
        heading: heading.textContent.trim(),
        price: priceHeading?.textContent.trim() ?? null,
        suffix: suffix?.textContent.trim() ?? null,
        ctaLabel: cta?.textContent.trim() ?? null,
        bullets,
      };
    });
  });
}

async function scrollToPlans(page) {
  await page.evaluate(() => {
    const toggle = [...document.querySelectorAll('button')].find((button) =>
      button.textContent.includes('Monthly'),
    );
    toggle?.scrollIntoView({ block: 'center' });
  });
  await page.waitForTimeout(700);
}

async function clickToggle(page, label) {
  await page.evaluate((needle) => {
    const target = [...document.querySelectorAll('button, label')].find((el) =>
      el.textContent.includes(needle),
    );
    if (target instanceof HTMLElement) target.click();
  }, label);
  // Past the feature transition (110ms + stagger) and the price tween (500ms).
  await page.waitForTimeout(900);
}

const oldPage = await openPage(browser, `${OLD_BASE}/pricing`, {
  settleMs: 1200,
});
const newPage = await openPage(browser, `${NEW_BASE}/pricing`, {
  settleMs: 1200,
});

await scrollToPlans(oldPage);
await scrollToPlans(newPage);

// --- Default state (cloud + yearly) ------------------------------------
const oldDefault = await readPlanCards(oldPage);
const newDefault = await readPlanCards(newPage);

if (oldDefault.length !== 2 || newDefault.length !== 2) {
  fail(
    'two plan cards on both sites',
    `old ${oldDefault.length} new ${newDefault.length}`,
  );
} else {
  compare('default cards (cloud + yearly)', oldDefault, newDefault);

  // CTA variants: Pro outlined, Organization filled (our button system
  // expresses fill via a shape layer, so the variant lives on the data
  // attribute rather than the link's background — the old site's
  // contained/outlined maps onto it).
  const ctaVariants = await newPage.evaluate(() =>
    [...document.querySelectorAll('a')]
      .filter((a) => a.textContent.includes('Start for free'))
      .map((a) => a.getAttribute('data-variant')),
  );
  compare('Pro CTA outlined, Organization CTA filled', ctaVariants, [
    'outlined',
    'filled',
  ]);
}

// --- Billing toggle: yearly -> monthly raises Pro to $12 ----------------
await clickToggle(oldPage, 'Monthly');
await clickToggle(newPage, 'Monthly');
const oldMonthly = await readPlanCards(oldPage);
const newMonthly = await readPlanCards(newPage);
compare('monthly billing cards', oldMonthly, newMonthly);
if (newMonthly[0].price.includes('12')) {
  ok('Pro rises to $12 on monthly billing');
} else {
  fail('Pro rises to $12 on monthly billing', newMonthly[0].price);
}

// --- Self-host toggle: Pro drops to $0, bullets swap to self-host -------
await clickToggle(oldPage, 'Selfhosting');
await clickToggle(newPage, 'Selfhosting');
const oldSelfHost = await readPlanCards(oldPage);
const newSelfHost = await readPlanCards(newPage);
compare('self-host cards', oldSelfHost, newSelfHost);
if (
  newSelfHost[0].price.includes('0') &&
  newSelfHost[1].bullets.some((bullet) => bullet.includes('Custom AI models'))
) {
  ok('self-host swaps Pro to $0 and Organization bullets to the self-host set');
} else {
  fail(
    'self-host swaps Pro to $0 and Organization bullets to the self-host set',
    JSON.stringify(newSelfHost.map((card) => card.price)),
  );
}

await finish(browser);
