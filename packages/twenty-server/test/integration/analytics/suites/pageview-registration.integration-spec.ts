import { INestApplication } from '@nestjs/common';

import { createClient } from '@clickhouse/client';

import { AnalyticsService } from 'src/engine/core-modules/analytics/services/analytics.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';
import { AnalyticsPageview } from 'src/engine/core-modules/analytics/types/pageview.type';

describe('Pageview Registration (integration)', () => {
  let app: INestApplication;
  let analyticsService: AnalyticsService;
  let environmentService: EnvironmentService;
  let clickhouseClient: any;

  beforeAll(async () => {
    app = global.app;
    analyticsService = app.get<AnalyticsService>(AnalyticsService);
    environmentService = app.get<EnvironmentService>(EnvironmentService);

    // Create a ClickHouse client for verification
    clickhouseClient = createClient({
      url: environmentService.get('CLICKHOUSE_URL'),
      compression: {
        response: true,
        request: true,
      },
    });
  });

  beforeEach(async () => {
    await clickhouseClient.query({
      query: 'TRUNCATE TABLE pageview',
    });
  });

  afterAll(async () => {
    if (clickhouseClient) {
      await clickhouseClient.close();
    }
  });

  it('should register pageviews in ClickHouse when sending a pageview through AnalyticsService', async () => {
    const testPageview: AnalyticsPageview = {
      href: 'https://example.com/test-page',
      locale: 'en-US',
      pathname: '/test-page',
      referrer: 'https://example.com',
      sessionId: 'session123',
      timeZone: 'America/New_York',
      timestamp: '2022-01-01 00:00:00',
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      version: '1.0.0',
      userId: 'user123',
      workspaceId: 'workspace456',
    };

    // Send a pageview through the AnalyticsService
    const result = await analyticsService
      .createAnalyticsContext({
        userId: testPageview.userId,
        workspaceId: testPageview.workspaceId,
      })
      .sendPageview(testPageview);

    expect(result.success).toBe(true);

    // Wait for the pageview to be flushed to ClickHouse (the service has a buffer)
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Query ClickHouse to verify the pageview was registered
    const queryResult = await clickhouseClient.query({
      query: `
        SELECT *
        FROM pageview
        WHERE userId = '${testPageview.userId}'
        AND workspaceId = '${testPageview.workspaceId}'
        AND href = '${testPageview.href}'
      `,
      format: 'JSONEachRow',
    });

    const rows = await queryResult.json();

    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].userId).toBe(testPageview.userId);
    expect(rows[0].workspaceId).toBe(testPageview.workspaceId);
    expect(rows[0].href).toBe(testPageview.href);
    expect(rows[0].referrer).toBe(testPageview.referrer);
    expect(rows[0].userAgent).toBe(testPageview.userAgent);
  });

  it('should register multiple pageviews in ClickHouse when sending multiple pageviews', async () => {
    const testPageviews: Array<AnalyticsPageview> = [
      {
        userId: '12345',
        workspaceId: '67890',
        href: 'https://example.com/test-page',
        locale: 'en-US',
        pathname: '/test-page',
        referrer: 'https://example.com',
        sessionId: 'session123',
        timeZone: 'America/New_York',
        timestamp: '2022-01-01 00:00:00',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        version: '1.0.0',
      },
      {
        userId: '12345',
        workspaceId: '67890',
        pathname: '/test-page-1',
        href: 'https://example.com/test-page-1',
        locale: 'en-US',
        referrer: 'https://example.com',
        sessionId: 'session123',
        timeZone: 'America/New_York',
        timestamp: '2022-01-01 00:00:00',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        version: '1.0.0',
      },
      {
        userId: '12345',
        workspaceId: '67890',
        pathname: '/test-page-2',
        href: 'https://example.com/test-page-2',
        locale: 'en-US',
        referrer: 'https://example.com',
        sessionId: 'session123',
        timeZone: 'America/New_York',
        timestamp: '2022-01-01 00:00:00',
        userAgent:
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
        version: '1.0.0',
      },
    ];

    // Send multiple pageviews through the AnalyticsService
    for (const pageview of testPageviews) {
      await analyticsService
        .createAnalyticsContext({
          userId: pageview.userId,
          workspaceId: pageview.workspaceId,
        })
        .sendPageview(pageview);
    }

    // Wait for the pageviews to be flushed to ClickHouse (the service has a buffer)
    await new Promise((resolve) => setTimeout(resolve, 20));

    // Query ClickHouse to verify all pageviews were registered
    const queryResult = await clickhouseClient.query({
      query: `
        SELECT *
        FROM pageview
        WHERE userId = '${testPageviews[0].userId}'
        AND workspaceId = '${testPageviews[0].workspaceId}'
        ORDER BY timestamp ASC
      `,
      format: 'JSONEachRow',
    });

    const rows = await queryResult.json();

    expect(rows.length).toBeGreaterThanOrEqual(testPageviews.length);

    // Verify each pageview was registered
    for (let i = 0; i < testPageviews.length; i++) {
      const pageview = testPageviews[i];
      const row = rows.find((r) => r.href === pageview.href);

      expect(row).toBeDefined();
      expect(row.userId).toBe(pageview.userId);
      expect(row.workspaceId).toBe(pageview.workspaceId);
      expect(row.pathname).toBe(pageview.pathname);
      expect(row.referrer).toBe(pageview.referrer);
    }
  });
});
