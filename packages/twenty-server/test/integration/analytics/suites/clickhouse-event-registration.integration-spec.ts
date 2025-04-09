import request from 'supertest';
import { createClient, ClickHouseClient } from '@clickhouse/client';

import { AnalyticsEvent } from 'src/engine/core-modules/analytics/types/event.type';
describe('ClickHouse Event Registration (integration)', () => {
  let clickhouseClient: ClickHouseClient;

  beforeAll(async () => {
    jest.useRealTimers();

    clickhouseClient = createClient({
      // use variable
      url: 'http://default:devPassword@localhost:8123/twenty-dev',
    });

    await clickhouseClient.query({
      query: 'TRUNCATE TABLE events',
      format: 'JSONEachRow',
    });
  });

  afterAll(async () => {
    if (clickhouseClient) {
      await clickhouseClient.close();
    }
  });

  it('should register events in ClickHouse when sending an event', async () => {
    const mutation = `
      mutation Track($action: String!, $payload: JSON!) {
        track(action: $action, payload: $payload) {
          success
        }
      }
    `;

    const variables = {
      action: 'random.event',
      payload: {
        foo: 'bar',
      },
    };

    const response = await request(`http://localhost:${APP_PORT}`)
      .post('/graphql')
      .send({
        query: mutation,
        variables,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.track.success).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 20));

    const queryResult = await clickhouseClient.query({
      query: `
        SELECT *
        FROM events
        WHERE action = '${variables.action}'
      `,
      format: 'JSONEachRow',
    });

    const rows = await queryResult.json<AnalyticsEvent>();

    expect(rows.length).toBe(1);
    expect(rows[0].payload).toEqual(JSON.stringify(variables.payload));
    expect(rows[0].action).toEqual(variables.action);
    expect(rows[0].workspaceId).toEqual('');
    expect(rows[0].userId).toEqual('');
    expect(rows[0].timestamp).toHaveLength(23);
  });
});
