/**
 * Frontend Load Time Benchmark
 *
 * Measures the time from navigation to when the app becomes interactive,
 * specifically tracking how long skeleton screens are visible.
 *
 * Usage:
 *   npx playwright test scripts/benchmark-load-time.ts --config=scripts/benchmark-playwright.config.ts
 *
 * Prerequisites:
 *   - Dev server running: npx nx start twenty-front
 *   - Backend running: npx nx start twenty-server
 *
 * What it measures:
 *   - Cold load: fresh browser, no cache (simulates first-time visitor)
 *   - Warm load: page refresh with localStorage intact (simulates returning user)
 *   - SPA navigation: navigate away and back (simulates in-app navigation)
 *   - Network waterfall: checks if metadata query starts before user query completes
 */

import { test, expect } from '@playwright/test';

const BASE_URL = process.env.FRONTEND_BASE_URL || 'http://localhost:3001';
const EMAIL = process.env.DEFAULT_LOGIN || 'tim@apple.dev';
const PASSWORD = process.env.DEFAULT_PASSWORD || 'Applecar2025';
const RUNS_PER_SCENARIO = 3;

type TimingResult = {
  scenario: string;
  run: number;
  navigationToSkeletonGoneMs: number;
  navigationToContentVisibleMs: number;
  metadataQueryStartMs: number | null;
  userQueryStartMs: number | null;
  metadataQueryDurationMs: number | null;
};

const results: TimingResult[] = [];

async function login(page: any) {
  await page.goto(`${BASE_URL}/welcome`);
  await page.waitForLoadState('networkidle');

  // Click "Continue with Email" if visible
  const emailButton = page.getByRole('button', {
    name: 'Continue with Email',
  });
  if (await emailButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    await emailButton.click();
  }

  await page.getByPlaceholder('Email').fill(EMAIL);
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await page.getByPlaceholder('Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Wait for app to fully load past the skeleton
  await page.waitForFunction(
    () => {
      // Wait until we're past the login page and skeleton is gone
      return (
        !window.location.href.includes('welcome') &&
        !window.location.href.includes('verify') &&
        document.querySelector('[data-testid="record-index-page"]') !== null
      );
    },
    { timeout: 60000 },
  );
}

async function measureLoad(
  page: any,
  scenario: string,
  run: number,
): Promise<TimingResult> {
  const networkTimings: {
    url: string;
    startTime: number;
    duration: number;
  }[] = [];

  // Intercept network requests to track GraphQL query timing
  page.on('requestfinished', async (request: any) => {
    const url = request.url();
    if (url.includes('/metadata') || url.includes('/graphql')) {
      const timing = request.timing();
      const postData = request.postData();
      let operationName = 'unknown';
      try {
        const parsed = JSON.parse(postData || '{}');
        operationName = parsed.operationName || 'unknown';
      } catch {
        // ignore
      }
      networkTimings.push({
        url: `${operationName} (${url.split('/').pop()})`,
        startTime: timing.startTime,
        duration: timing.responseEnd - timing.startTime,
      });
    }
  });

  const startTime = Date.now();

  // Navigate to the app root
  await page.goto(`${BASE_URL}/objects/companies`, {
    waitUntil: 'commit',
  });

  // Wait for skeleton to disappear (content visible)
  let skeletonGoneTime: number;
  let contentVisibleTime: number;

  try {
    // Wait for the skeleton loader to disappear
    await page.waitForFunction(
      () => {
        const skeletons = document.querySelectorAll(
          '.react-loading-skeleton, [class*="SkeletonLoader"]',
        );
        const hasNoSkeletons = skeletons.length === 0;
        // Also check that actual content is rendered
        const hasTable =
          document.querySelector('table') !== null ||
          document.querySelector('[data-testid="record-table"]') !== null ||
          document.querySelector('[role="grid"]') !== null;
        return hasNoSkeletons && hasTable;
      },
      { timeout: 60000 },
    );
    skeletonGoneTime = Date.now();
    contentVisibleTime = Date.now();
  } catch {
    skeletonGoneTime = Date.now();
    contentVisibleTime = Date.now();
  }

  // Find metadata and user query timings
  const metadataQuery = networkTimings.find(
    (t) =>
      t.url.includes('ObjectMetadataItems') ||
      t.url.includes('FindManyObjectMetadataItems'),
  );
  const userQuery = networkTimings.find(
    (t) =>
      t.url.includes('GetCurrentUser') || t.url.includes('CurrentUser'),
  );

  const result: TimingResult = {
    scenario,
    run,
    navigationToSkeletonGoneMs: skeletonGoneTime - startTime,
    navigationToContentVisibleMs: contentVisibleTime - startTime,
    metadataQueryStartMs: metadataQuery?.startTime ?? null,
    userQueryStartMs: userQuery?.startTime ?? null,
    metadataQueryDurationMs: metadataQuery?.duration ?? null,
  };

  results.push(result);
  return result;
}

function printResults() {
  console.log('\n' + '='.repeat(80));
  console.log('LOAD TIME BENCHMARK RESULTS');
  console.log('='.repeat(80));

  const scenarios = [...new Set(results.map((r) => r.scenario))];

  for (const scenario of scenarios) {
    const scenarioResults = results.filter((r) => r.scenario === scenario);
    const times = scenarioResults.map((r) => r.navigationToSkeletonGoneMs);
    const avg = times.reduce((a, b) => a + b, 0) / times.length;
    const min = Math.min(...times);
    const max = Math.max(...times);

    console.log(`\n--- ${scenario} ---`);
    console.log(`  Runs: ${times.length}`);
    console.log(`  Avg skeleton duration: ${avg.toFixed(0)}ms`);
    console.log(`  Min: ${min}ms | Max: ${max}ms`);

    // Check query parallelization
    const withTimings = scenarioResults.filter(
      (r) => r.metadataQueryStartMs !== null && r.userQueryStartMs !== null,
    );
    if (withTimings.length > 0) {
      const parallelized = withTimings.filter(
        (r) =>
          Math.abs(r.metadataQueryStartMs! - r.userQueryStartMs!) < 500,
      );
      console.log(
        `  Query parallelization: ${parallelized.length}/${withTimings.length} runs had overlapping queries`,
      );
    }

    if (scenarioResults[0]?.metadataQueryDurationMs !== null) {
      const metaTimes = scenarioResults
        .map((r) => r.metadataQueryDurationMs)
        .filter((t): t is number => t !== null);
      const metaAvg = metaTimes.reduce((a, b) => a + b, 0) / metaTimes.length;
      console.log(`  Avg metadata query: ${metaAvg.toFixed(0)}ms`);
    }

    for (const r of scenarioResults) {
      console.log(
        `    Run ${r.run}: skeleton=${r.navigationToSkeletonGoneMs}ms` +
          (r.metadataQueryDurationMs
            ? ` metadata=${r.metadataQueryDurationMs}ms`
            : ''),
      );
    }
  }

  console.log('\n' + '='.repeat(80));
}

test.describe('Load Time Benchmark', () => {
  test('Cold load (no cache)', async ({ browser }) => {
    for (let i = 1; i <= RUNS_PER_SCENARIO; i++) {
      // Fresh context = no cookies, no localStorage
      const context = await browser.newContext();
      const page = await context.newPage();

      // Login first
      await login(page);

      // Clear all storage to simulate cold load
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await context.clearCookies();

      // Re-login and measure
      await login(page);
      const result = await measureLoad(page, 'Cold Load', i);

      console.log(
        `Cold load run ${i}: ${result.navigationToSkeletonGoneMs}ms`,
      );

      await context.close();
    }
  });

  test('Warm load (page refresh, cache intact)', async ({ browser }) => {
    // Login once, then measure refreshes
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(page);

    for (let i = 1; i <= RUNS_PER_SCENARIO; i++) {
      const result = await measureLoad(page, 'Warm Load (Refresh)', i);
      console.log(
        `Warm load run ${i}: ${result.navigationToSkeletonGoneMs}ms`,
      );
    }

    await context.close();
  });

  test('SPA navigation (in-app route change)', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();
    await login(page);

    // Wait for initial load to complete
    await page.waitForTimeout(2000);

    for (let i = 1; i <= RUNS_PER_SCENARIO; i++) {
      const start = Date.now();

      // Navigate to settings then back to companies
      await page.goto(`${BASE_URL}/settings/profile`);
      await page.waitForLoadState('networkidle');

      await page.goto(`${BASE_URL}/objects/companies`);
      await page.waitForFunction(
        () => {
          const hasTable =
            document.querySelector('table') !== null ||
            document.querySelector('[data-testid="record-table"]') !== null ||
            document.querySelector('[role="grid"]') !== null;
          return hasTable;
        },
        { timeout: 30000 },
      );

      const duration = Date.now() - start;
      results.push({
        scenario: 'SPA Navigation',
        run: i,
        navigationToSkeletonGoneMs: duration,
        navigationToContentVisibleMs: duration,
        metadataQueryStartMs: null,
        userQueryStartMs: null,
        metadataQueryDurationMs: null,
      });

      console.log(`SPA navigation run ${i}: ${duration}ms`);
    }

    await context.close();
  });

  test.afterAll(() => {
    printResults();
  });
});
