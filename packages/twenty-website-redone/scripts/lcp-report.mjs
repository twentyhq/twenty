import { chromium } from 'playwright';

// Same-run LCP comparison: both sites measured back to back under the
// same throttle (Fast-3G-ish network, 4x CPU), 3 cold loads each, median
// reported. A report, not a gate — run at wave close.
const OLD_URL = process.env.MOCKUP_OLD_URL ?? 'http://localhost:3002/';
const NEW_URL = process.env.VISUAL_BATTERY_URL ?? 'http://localhost:3004/';
const RUNS = 3;

const browser = await chromium.launch({ channel: 'chrome', headless: true });

async function measureLcp(url) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 150,
    downloadThroughput: (1.6 * 1024 * 1024) / 8,
    uploadThroughput: (750 * 1024) / 8,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });

  await page.addInitScript(() => {
    window.__lcp = 0;
    new PerformanceObserver((entryList) => {
      for (const entry of entryList.getEntries()) {
        window.__lcp = entry.startTime;
      }
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });

  await page.goto(url, { waitUntil: 'load', timeout: 240000 });
  await page.waitForTimeout(3000);
  const lcp = await page.evaluate(() => window.__lcp);
  await context.close();
  return lcp;
}

const median = (values) =>
  values.toSorted((a, b) => a - b)[Math.floor(values.length / 2)];

const report = {};
for (const [label, url] of [
  ['old (:3002)', OLD_URL],
  ['new (:3004)', NEW_URL],
]) {
  const samples = [];
  for (let run = 0; run < RUNS; run += 1) {
    // eslint-disable-next-line no-await-in-loop
    samples.push(await measureLcp(url));
  }
  report[label] = { samples, median: median(samples) };
  console.log(
    `  ${label}: median ${Math.round(median(samples))}ms (${samples
      .map((sample) => Math.round(sample))
      .join(', ')})`,
  );
}

await browser.close();

const oldMedian = report['old (:3002)'].median;
const newMedian = report['new (:3004)'].median;
const delta = ((newMedian - oldMedian) / oldMedian) * 100;
console.log(
  `lcp-report: new is ${delta <= 0 ? '' : '+'}${delta.toFixed(1)}% vs old`,
);
