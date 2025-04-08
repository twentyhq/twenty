import { gql } from 'graphql-tag';
import request from 'supertest';
import { createClient } from '@clickhouse/client';

describe('ClickHouse Event Registration (integration)', () => {
  let clickhouseClient: any;

  beforeAll(async () => {
    clickhouseClient = createClient({
      // use variable
      url: 'http://default:devPassword@localhost:8123/twenty-dev',
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
    const mutation = gql`
      mutation Track($action: String!, $payload: JSON!) {
        track(action: $action, payload: $payload) {
          success
        }
      }
    `;

    const variables = {
      action: 'random.event',
      payload: {
        key: 'value',
      },
    };

    const response = await request(`http://localhost:${APP_PORT}`)
      .post('/graphql')
      .send({
        query: mutation.loc?.source.body,
        variables,
      });

    expect(response.status).toBe(200);
    expect(response.body.data.track).toBe(true);

    await new Promise((resolve) => setTimeout(resolve, 20));

    const queryResult = await clickhouseClient.query({
      query: `
        SELECT *
        FROM events
        WHERE action = '${variables.action}'
      `,
      format: 'JSONEachRow',
    });

    const rows = await queryResult.json();

    console.log('>>>>>>>>>>>>>>', rows);
  });
});
