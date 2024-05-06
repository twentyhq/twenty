import { expect, test } from '@playwright/test';

import { ProfilingDataPoint } from '../packages/twenty-front/src/modules/debug/profiling/types/ProfilingDataPoint';

test.beforeEach(async ({ context }) => {
  context.addCookies([
    {
      name: 'tokenPair',
      domain: 'localhost',
      path: '/',
      value: '**GET_FROM_YOUR_BROWSER**',
    },
  ]);
});

test('Component performance test', async ({ page }) => {
  await page.goto('/objects/people', { timeout: 60000 });

  await page.waitForTimeout(5000);

  // Expect a title "to contain" a substring.
  await expect(page.getByText('Callisto')).toBeVisible({ timeout: 60000 });

  await page.screenshot({ path: 'screenshot.png' });

  const locator = page.locator('#profiling-report');

  const profilingReportStringified = await locator.getAttribute(
    'data-profiling-report',
  );

  const profilingReport = JSON.parse(
    profilingReportStringified ?? '{}',
  ) as Record<string, ProfilingDataPoint[]>;

  const reportByComponent = {} as {
    [componentName: string]: {
      sumById: { [id: string]: number };
      sum: number;
      dataPointCount: number;
      average: number;
      p50: number;
      p80: number;
      p90: number;
      p95: number;
      p99: number;
      min: number;
      max: number;
    };
  };

  const dataPoints = Object.entries(profilingReport)
    .map(([, dataPoints]) => dataPoints)
    .flat(1);

  for (const dataPoint of dataPoints) {
    reportByComponent[dataPoint.componentName] = {
      ...reportByComponent?.[dataPoint.componentName],
      sumById: {
        ...reportByComponent?.[dataPoint.componentName]?.sumById,
        [dataPoint.id]:
          (reportByComponent[dataPoint.componentName]?.[dataPoint.id] ?? 0) +
          dataPoint.durationInMs,
      },
      sum:
        (reportByComponent[dataPoint.componentName]?.sum ?? 0) +
        dataPoint.durationInMs,
    };
  }

  for (const componentName of Object.keys(reportByComponent)) {
    const ids = Object.keys(reportByComponent[componentName].sumById);
    const valuesUnsorted = Object.values(
      reportByComponent[componentName].sumById,
    );

    const valuesSortedAsc = [...valuesUnsorted].sort((a, b) => a - b);

    const numberOfIds = ids.length;

    reportByComponent[componentName].average =
      reportByComponent[componentName].sum / numberOfIds;

    reportByComponent[componentName].min = Math.min(
      ...Object.values(reportByComponent[componentName].sumById),
    );

    reportByComponent[componentName].max = Math.max(
      ...Object.values(reportByComponent[componentName].sumById),
    );

    const p50Index = Math.floor(numberOfIds * 0.5);
    const p80Index = Math.floor(numberOfIds * 0.8);
    const p90Index = Math.floor(numberOfIds * 0.9);
    const p95Index = Math.floor(numberOfIds * 0.95);
    const p99Index = Math.floor(numberOfIds * 0.99);

    reportByComponent[componentName].p50 = valuesSortedAsc[p50Index];
    reportByComponent[componentName].p80 = valuesSortedAsc[p80Index];
    reportByComponent[componentName].p90 = valuesSortedAsc[p90Index];
    reportByComponent[componentName].p95 = valuesSortedAsc[p95Index];
    reportByComponent[componentName].p99 = valuesSortedAsc[p99Index];
  }

  const MAX_RENDER_TIME = 1;

  expect(
    reportByComponent['RecordTableCell'].average,
    `Component RecordTableCell is taking too long to render, (> ${MAX_RENDER_TIME}ms), check that no modification has been done in a child component that could impact render time`,
  ).toBeLessThan(MAX_RENDER_TIME);
});
