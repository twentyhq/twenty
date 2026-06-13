import { chromium } from 'playwright';

// The shared chassis every parity battery runs on: one place for the
// pass/fail ledger, the A/B compare funnel and page setup. New batteries
// MUST build on this — and when the old site retires, compare() is the
// single seam where frozen fixtures replace live :3002 values.
export const OLD_BASE = process.env.MOCKUP_OLD_URL ?? 'http://localhost:3002';
export const NEW_BASE =
  process.env.VISUAL_BATTERY_URL ?? 'http://localhost:3004';

export const VIEWPORT = { width: 1440, height: 900 };

const ok = (label, detail) =>
  console.log(`  ✓ ${label}${detail ? ` (${detail})` : ''}`);

export function createBattery(name) {
  const failures = [];

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

  const finish = async (browser) => {
    await browser?.close();
    if (failures.length > 0) {
      console.error(`${name}: FAILED (${failures.length})`);
      process.exitCode = 1;
    } else {
      console.log(`${name}: OK`);
    }
  };

  return { compare, fail, finish, ok };
}

export function launchBrowser() {
  return chromium.launch({ channel: 'chrome', headless: true });
}

export async function openPage(
  browser,
  url,
  { reducedMotion = false, settleMs = 800 } = {},
) {
  const page = await browser.newPage({
    viewport: VIEWPORT,
    reducedMotion: reducedMotion ? 'reduce' : 'no-preference',
  });
  await page.goto(url, { waitUntil: 'load', timeout: 240000 });
  await page.waitForTimeout(settleMs);
  return page;
}
