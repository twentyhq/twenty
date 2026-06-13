import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  createBattery,
  launchBrowser,
  NEW_BASE,
  openPage,
} from './battery-kit.mjs';

// Locks approved pages against THEMSELVES: a structured snapshot of the
// page's composition (sections, rhythm, intros, headings, CTAs, visual
// slots) committed as fixtures. Porting further pages must not move any
// of it; a deliberate change is re-recorded and reviewed as a fixture
// diff in the commit.
//
//   node scripts/page-lock.mjs           verify against fixtures
//   node scripts/page-lock.mjs --record  re-record fixtures
const LOCKED_PAGES = ['/', '/product'];

// One viewport inside each breakpoint tier (sm 768 / md 921 / lg 1281),
// so every responsive variant of the approved pages is under lock —
// phone stacks and swipe decks, the sm band, the md band where the
// hero window crops, and the full desktop layout.
const LOCKED_VIEWPORTS = [
  { label: 'base-390', width: 390, height: 844 },
  { label: 'sm-820', width: 820, height: 900 },
  { label: 'md-1100', width: 1100, height: 900 },
  { label: 'lg-1440', width: 1440, height: 900 },
];
const FIXTURES_DIR = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'locks',
);

const isRecording = process.argv.includes('--record');

function fixturePath(pagePath) {
  const name = pagePath === '/' ? 'home' : pagePath.replaceAll('/', '');
  return path.join(FIXTURES_DIR, `${name}.json`);
}

// The page's structural fingerprint: everything the house rules govern,
// read with stable selectors (no text anchors that break on copy edits
// — except headings, which ARE content under lock).
function readPageSnapshot(page) {
  return page.evaluate(() => {
    const style = (el) => getComputedStyle(el);

    const sections = [...document.querySelectorAll('section')].map((el) => {
      const previous = el.previousElementSibling;
      return {
        scheme: el.getAttribute('data-scheme'),
        rhythm: el.getAttribute('data-rhythm'),
        paddingTop: style(el).paddingTop,
        paddingBottom: style(el).paddingBottom,
        background: style(el).backgroundColor,
        followsSameScheme:
          previous?.tagName === 'SECTION' &&
          previous.getAttribute('data-scheme') ===
            el.getAttribute('data-scheme'),
      };
    });

    const eyebrows = [...document.querySelectorAll('p')]
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
        return {
          label: row.textContent.trim(),
          gapToHeading: heading
            ? Math.round(heading.getBoundingClientRect().top - rect.bottom)
            : null,
          centered:
            Math.abs(
              rect.left - parentRect.left - (parentRect.right - rect.right),
            ) <= 2,
        };
      });

    const headings = [...document.querySelectorAll('h1, h2')].map((el) => {
      const headingStyle = style(el);
      return {
        tag: el.tagName,
        text: el.textContent.trim().slice(0, 60),
        fontSize: headingStyle.fontSize,
        fontWeight: headingStyle.fontWeight,
        textAlign: headingStyle.textAlign,
      };
    });

    const visualSlots = [...document.querySelectorAll('[data-illustration]')]
      .map((el) => el.getAttribute('data-illustration'))
      .sort();

    const ctas = [...document.querySelectorAll('main a')]
      .filter((el) => el.querySelector('svg, span[aria-hidden]'))
      .slice(0, 12)
      .map((el) => ({
        label: el.textContent.trim().slice(0, 30),
        href: el.getAttribute('href'),
      }));

    return {
      sections,
      eyebrows,
      headings,
      visualSlots,
      ctas,
      sectionCount: sections.length,
    };
  });
}

function diffSnapshots(battery, pagePath, expected, actual) {
  const walk = (keyPath, expectedValue, actualValue) => {
    const expectedText = JSON.stringify(expectedValue);
    const actualText = JSON.stringify(actualValue);
    if (expectedText === actualText) return true;

    if (
      Array.isArray(expectedValue) &&
      Array.isArray(actualValue) &&
      expectedValue.length === actualValue.length
    ) {
      let allEqual = true;
      expectedValue.forEach((item, index) => {
        if (!walk(`${keyPath}[${index}]`, item, actualValue[index])) {
          allEqual = false;
        }
      });
      return allEqual;
    }

    battery.fail(
      `${pagePath} ${keyPath}`,
      `locked ${expectedText} vs live ${actualText}`,
    );
    return false;
  };

  let clean = true;
  for (const key of Object.keys(expected)) {
    if (!walk(key, expected[key], actual[key])) clean = false;
  }
  if (clean) {
    battery.ok(
      `${pagePath} matches its lock`,
      `${expected.sectionCount} sections, ${expected.eyebrows.length} eyebrows, ${expected.headings.length} headings`,
    );
  }
}

const battery = createBattery('page-lock');
const browser = await launchBrowser();

for (const pagePath of LOCKED_PAGES) {
  const snapshots = {};

  for (const viewport of LOCKED_VIEWPORTS) {
    // eslint-disable-next-line no-await-in-loop
    const page = await openPage(browser, `${NEW_BASE}${pagePath}`, {
      settleMs: 1200,
      viewport,
    });
    // eslint-disable-next-line no-await-in-loop
    snapshots[viewport.label] = await readPageSnapshot(page);
    // eslint-disable-next-line no-await-in-loop
    await page.close();
  }

  if (isRecording) {
    fs.mkdirSync(FIXTURES_DIR, { recursive: true });
    fs.writeFileSync(
      fixturePath(pagePath),
      `${JSON.stringify(snapshots, null, 2)}\n`,
    );
    battery.ok(`${pagePath} recorded`, fixturePath(pagePath));
    continue;
  }

  if (!fs.existsSync(fixturePath(pagePath))) {
    battery.fail(`${pagePath} lock exists`, 'run with --record first');
    continue;
  }
  const expected = JSON.parse(fs.readFileSync(fixturePath(pagePath), 'utf8'));
  for (const viewport of LOCKED_VIEWPORTS) {
    if (!expected[viewport.label]) {
      battery.fail(
        `${pagePath} ${viewport.label} lock exists`,
        're-record (new viewport tier)',
      );
      continue;
    }
    diffSnapshots(
      battery,
      `${pagePath} @${viewport.label}`,
      expected[viewport.label],
      snapshots[viewport.label],
    );
  }
}

await battery.finish(browser);
