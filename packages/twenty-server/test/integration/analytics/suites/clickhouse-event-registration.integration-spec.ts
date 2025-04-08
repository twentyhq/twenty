import { INestApplication } from '@nestjs/common';

import request from 'supertest';
import { createClient } from '@clickhouse/client';

import { AnalyticsService } from 'src/engine/core-modules/analytics/services/analytics.service';
import { EnvironmentService } from 'src/engine/core-modules/environment/environment.service';

const SERVER_URL = `http://localhost:${APP_PORT}`;

describe('ClickHouse Event Registration (integration)', () => {
  let app: INestApplication;
  let analyticsService: AnalyticsService;
  let environmentService: EnvironmentService;
  let clickhouseClient: any;

  beforeAll(async () => {
    app = global.app;
    analyticsService = app.get<AnalyticsService>(AnalyticsService);
    environmentService = app.get<EnvironmentService>(EnvironmentService);

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
      query: 'TRUNCATE TABLE events',
    });
  });

  afterAll(async () => {
    if (clickhouseClient) {
      await clickhouseClient.close();
    }
  });

  it('should register events in ClickHouse when sending an event through AnalyticsService', async () => {
    const testEvent = {
      action: 'test_event',
      userId: '12345',
      workspaceId: '67890',
      payload: {
        testKey: 'testValue',
      },
    };

    // Send an event through the AnalyticsService
    const result = await analyticsService
      .createAnalyticsContext({
        userId: testEvent.userId,
        workspaceId: testEvent.workspaceId,
      })
      .sendUnknownEvent({
        action: testEvent.action,
        payload: testEvent.payload,
      });

    expect(result.success).toBe(true);

    // Wait for the event to be flushed to ClickHouse (the service has a buffer)
    await new Promise((resolve) => setTimeout(resolve, 6000));

    // Query ClickHouse to verify the event was registered
    const queryResult = await clickhouseClient.query({
      query: `
        SELECT *
        FROM events
        WHERE action = '${testEvent.action}'
        AND userId = '${testEvent.userId}'
        AND workspaceId = '${testEvent.workspaceId}'
      `,
      format: 'JSONEachRow',
    });

    const rows = await queryResult.json();

    expect(rows.length).toBeGreaterThan(0);
    expect(rows[0].action).toBe(testEvent.action);
    expect(rows[0].userId).toBe(testEvent.userId);
    expect(rows[0].workspaceId).toBe(testEvent.workspaceId);
    expect(JSON.parse(rows[0].payload).testKey).toBe(testEvent.payload.testKey);
  });

  it('should register events in ClickHouse when triggering an action through the API', async () => {
    const queryData = {
      query: `
        query {
          currentUser {
            id
            firstName
            lastName
          }
        }
      `,
    };

    await request(SERVER_URL)
      .post('/graphql')
      .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
      .send(queryData)
      .expect(200);

    await new Promise((resolve) => setTimeout(resolve, 20));

    const queryResult = await clickhouseClient.query({
      query: `
        SELECT *
        FROM events
        WHERE timestamp > now() - INTERVAL 1 MINUTE
      `,
      format: 'JSONEachRow',
    });

    const rows = await queryResult.json();

    expect(rows.length).toBeGreaterThan(0);
  });
});
