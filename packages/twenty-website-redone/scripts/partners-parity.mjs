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

// Partner testimonials: a dark notched panel on a light section. The notch
// reveals the section's WHITE surface (the gray-notch defect we fixed), the
// panel fill is the dark scheme surface, and the carousel adopts the dark
// scheme so its content ink resolves to light — the half-applied scheme that
// left the name/quote/counter invisible (vars set, `color` not) is what this
// guards. The counter is centred and the quote runs sans, both matching the
// home testimonials (the quote shares the counter's sans family).
const panel = await partners.evaluate(() => {
  const carousel = document.querySelector(
    '[aria-label="Partner testimonials"]',
  );
  const section = carousel?.closest('section');
  const shape = section?.querySelector('[data-card-scheme]');
  const bodyFill = shape?.lastElementChild;
  const counter = [...(section?.querySelectorAll('p') ?? [])].find((node) =>
    /^\d+\/\d+$/.test((node.textContent ?? '').trim()),
  );
  const quote = section?.querySelector('h2');
  return {
    surface: section ? getComputedStyle(section).backgroundColor : '',
    cardScheme: shape?.getAttribute('data-card-scheme') ?? '',
    fill: bodyFill ? getComputedStyle(bodyFill).backgroundColor : '',
    ink: carousel ? getComputedStyle(carousel).color : '',
    counterAlign: counter ? getComputedStyle(counter).textAlign : '',
    counterFont: counter ? getComputedStyle(counter).fontFamily : '',
    quoteFont: quote ? getComputedStyle(quote).fontFamily : '',
  };
});
assert(
  'testimonials notch reveals a white surface',
  panel.surface === 'rgb(255, 255, 255)',
  panel.surface,
);
assert(
  'testimonials panel fills with the dark surface',
  panel.cardScheme === 'dark' && panel.fill === 'rgb(28, 28, 28)',
  `${panel.cardScheme} / ${panel.fill}`,
);
assert(
  'testimonials content adopts the light ink',
  panel.ink === 'rgb(255, 255, 255)',
  panel.ink,
);
assert(
  'testimonials counter is centred',
  panel.counterAlign === 'center',
  panel.counterAlign,
);
assert(
  'testimonials quote shares the counter sans family',
  panel.quoteFont !== '' && panel.quoteFont === panel.counterFont,
  `quote ${panel.quoteFont} / counter ${panel.counterFont}`,
);

// The closing sign-off: a tall centred panel whose heading carries both faces
// (serif + sans accent). "Become a partner" is the application-modal trigger (a
// button, no href); "Find a partner" links to the (Wave-B) marketplace, the
// same dangle the hero already carries. The body is measure-constrained so it
// breaks across two lines rather than running the panel width.
const signoff = await partners.evaluate(() => {
  const heading = [...document.querySelectorAll('h2')].find((node) =>
    /Ready to grow/.test(node.textContent ?? ''),
  );
  const section = heading?.closest('section');
  const ctas = [...(section?.querySelectorAll('a, button') ?? [])];
  const become = ctas.find((node) =>
    /Become a partner/i.test(node.textContent ?? ''),
  );
  const find = ctas.find((node) =>
    /Find a partner/i.test(node.textContent ?? ''),
  );
  const body = [...(section?.querySelectorAll('p') ?? [])].find((node) =>
    /partner ecosystem/.test(node.textContent ?? ''),
  );
  return {
    headingText: (heading?.textContent ?? '').replace(/\s+/g, ' ').trim(),
    becomeTag: become?.tagName.toLowerCase() ?? '',
    becomeHref: become?.getAttribute('href') ?? null,
    findHref: find?.getAttribute('href') ?? '',
    bodyWidth: body ? Math.round(body.getBoundingClientRect().width) : 0,
    sectionHeight: section
      ? Math.round(section.getBoundingClientRect().height)
      : 0,
    hasCrosshair: Boolean(section?.querySelector('[data-slot="plus"]')),
  };
});
assert(
  'signoff heading carries both faces',
  signoff.headingText.includes('Ready to grow') &&
    signoff.headingText.includes('with Twenty?'),
  signoff.headingText,
);
assert(
  'signoff become-a-partner is a modal trigger, not a link',
  signoff.becomeTag === 'button' && signoff.becomeHref === null,
  `${signoff.becomeTag} href=${signoff.becomeHref}`,
);
assert(
  'signoff find-a-partner links to the marketplace',
  signoff.findHref.endsWith('/partners/list'),
  signoff.findHref,
);
assert(
  'signoff body is measure-constrained',
  signoff.bodyWidth > 0 && signoff.bodyWidth <= 410,
  `${signoff.bodyWidth}px`,
);
assert(
  'signoff is a tall centred panel',
  signoff.sectionHeight >= 759 && signoff.hasCrosshair,
  `${signoff.sectionHeight}px / crosshair ${signoff.hasCrosshair}`,
);

// The application modal: clicking "Become a partner" opens a dark dialog that
// hosts the deferred wizard. The dialog carries the wizard's "Apply to build"
// title on the near-black panel, runs on the dark scheme, and its width is set
// up to ease between the form (<=720) and booking widths rather than snapping.
await partners.evaluate(() => {
  const become = [...document.querySelectorAll('button')].find((node) =>
    /Become a partner/i.test(node.textContent ?? ''),
  );
  become?.click();
});
const modal = await partners
  .waitForFunction(
    () =>
      /Apply to build/.test(
        document.querySelector('[role="dialog"]')?.textContent ?? '',
      ),
    { timeout: 5000 },
  )
  .then(() =>
    partners.evaluate(() => {
      const dialog = document.querySelector('[role="dialog"]');
      const style = dialog ? getComputedStyle(dialog) : null;
      return {
        opened: Boolean(dialog),
        darkScope: Boolean(dialog?.querySelector('[data-scheme="dark"]')),
        panel: style?.backgroundColor ?? '',
        transition: style?.transitionProperty ?? '',
        width: dialog ? Math.round(dialog.getBoundingClientRect().width) : 0,
      };
    }),
  )
  .catch(() => ({
    opened: false,
    darkScope: false,
    panel: '',
    transition: '',
    width: 0,
  }));
assert(
  'become-a-partner opens the dark application modal',
  modal.opened && modal.darkScope,
  `opened=${modal.opened} darkScope=${modal.darkScope}`,
);
assert(
  'application modal sits on the near-black panel',
  modal.panel === 'rgb(12, 12, 12)',
  modal.panel,
);
assert(
  'application modal eases between form and booking widths',
  /width/.test(modal.transition) && modal.width <= 720,
  `transition="${modal.transition}" width=${modal.width}`,
);
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
