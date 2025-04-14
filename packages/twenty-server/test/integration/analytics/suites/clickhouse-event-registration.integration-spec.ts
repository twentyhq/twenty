import process from 'process';

import request from 'supertest';
import { createClient, ClickHouseClient } from '@clickhouse/client';

import { GenericTrackEvent } from 'src/engine/core-modules/analytics/utils/events/track/track';
describe('ClickHouse Event Registration (integration)', () => {
  let clickhouseClient: ClickHouseClient;

  beforeAll(async () => {
    jest.useRealTimers();

    clickhouseClient = createClient({
      // use variable
      url: process.env.CLICKHOUSE_URL,
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
        WHERE event = '${variables.action}'
      `,
      format: 'JSONEachRow',
    });

    const rows = await queryResult.json<GenericTrackEvent>();

    expect(rows.length).toBe(1);
    expect(rows[0].properties).toEqual(JSON.stringify(variables.payload));
    expect(rows[0].event).toEqual(variables.action);
    expect(rows[0].workspaceId).toEqual('');
    expect(rows[0].userId).toEqual('');
    expect(rows[0].timestamp).toHaveLength(23);
  });
});
