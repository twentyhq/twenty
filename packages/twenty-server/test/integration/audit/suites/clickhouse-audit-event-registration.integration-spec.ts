import process from 'process';

import { ClickHouseClient, createClient } from '@clickhouse/client';
import request from 'supertest';

import { OBJECT_RECORD_CREATED_EVENT } from 'src/engine/core-modules/audit/utils/events/track/object-record/object-record-created';
import { GenericTrackEvent } from 'src/engine/core-modules/audit/utils/events/track/track';

describe('ClickHouse Event Registration (integration)', () => {
  let clickhouseClient: ClickHouseClient;

  beforeAll(async () => {
    jest.useRealTimers();

    clickhouseClient = createClient({
      url: process.env.CLICKHOUSE_URL,
    });

    await clickhouseClient.query({
      query: 'TRUNCATE TABLE auditEvent',
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
      mutation TrackAnalytics($type: AnalyticsType!, $event: String, $name: String, $properties: JSON) {
        trackAnalytics(type: $type, event: $event, name: $name, properties: $properties) {
          success
        }
      }
    `;

    const variables = {
      type: 'TRACK',
      event: OBJECT_RECORD_CREATED_EVENT,
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

    const queryResult = await clickhouseClient.query({
      query: `
        SELECT *
        FROM auditEvent
        WHERE event = '${OBJECT_RECORD_CREATED_EVENT}' AND timestamp >= now() - INTERVAL 1 SECOND

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
