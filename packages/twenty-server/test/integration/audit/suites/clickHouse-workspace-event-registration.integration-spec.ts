import process from 'process';

import { type ClickHouseClient, createClient } from '@clickhouse/client';
import request from 'supertest';

import { CUSTOM_DOMAIN_ACTIVATED_EVENT } from 'src/engine/core-modules/audit/utils/events/workspace-event/custom-domain/custom-domain-activated';
import { type GenericTrackEvent } from 'src/engine/core-modules/audit/utils/events/workspace-event/track';

describe('ClickHouse Event Registration (integration)', () => {
  let clickHouseClient: ClickHouseClient;

  beforeAll(async () => {
    jest.useRealTimers();

    clickHouseClient = createClient({
      url: process.env.CLICKHOUSE_URL,
    });

    await clickHouseClient.query({
      query: 'TRUNCATE TABLE workspaceEvent',
      format: 'JSONEachRow',
    });
  });

  afterAll(async () => {
    if (clickHouseClient) {
      await clickHouseClient.close();
    }
  });

  it('should register events in ClickHouse when sending an event', async () => {
    const mutation = `
      mutation TrackAnalytics($type: AnalyticsType!, $event: String, $name: String, $properties: JSON) {
        trackAnalytics(type: $type, event: $event, name: $name, properties: $properties) {
          success
        }
      }
    `;

    const variables = {
      type: 'TRACK',
      event: CUSTOM_DOMAIN_ACTIVATED_EVENT,
      properties: {},
    };

    const response = await request(`http://localhost:${APP_PORT}`)
      .post('/graphql')
      .send({
        query: mutation,
        variables,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.trackAnalytics.success).toBe(true);

    const queryResult = await clickHouseClient.query({
      query: `
        SELECT *
        FROM workspaceEvent
        WHERE event = '${CUSTOM_DOMAIN_ACTIVATED_EVENT}' AND timestamp >= now() - INTERVAL 1 SECOND

      `,
      format: 'JSONEachRow',
    });

    const rows = await queryResult.json<GenericTrackEvent>();

    expect(rows.length).toEqual(1);
    expect(rows[0].properties).toEqual(variables.properties);
    expect(rows[0].event).toEqual(variables.event);
    expect(rows[0].workspaceId).toEqual('');
    expect(rows[0].userId).toEqual('');
    expect(rows[0].timestamp).toHaveLength(23);
  });
});
