import request from 'supertest';
import { createClient, ClickHouseClient } from '@clickhouse/client';
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

    await new Promise((resolve) => setTimeout(resolve, 100));

    const queryResult = await clickhouseClient.query({
      query: `
        SELECT *
        FROM events
        WHERE action = '${variables.action}'
      `,
      format: 'JSONEachRow',
    });

    const rows = await queryResult.json();

    expect(rows.length).toBe(1);

    console.log('>>>>>>>>>>>>>>', rows);
  });
});
