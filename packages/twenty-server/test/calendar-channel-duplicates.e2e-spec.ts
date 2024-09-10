import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('calendarChannelDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many calendarChannelDuplicates', () => {
    const queryData = {
      query: `
        query calendarChannelDuplicates {
          calendarChannelDuplicates {
            edges {
              node {
                handle
                syncStatus
                syncStage
                visibility
                isContactAutoCreationEnabled
                contactAutoCreationPolicy
                isSyncEnabled
                syncCursor
                syncStageStartedAt
                throttleFailureCount
                id
                createdAt
                updatedAt
                connectedAccountId
              }
            }
          }
        }
      `,
    };

    return request(app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${accessToken}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.calendarChannelDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const calendarchannelduplicates = edges[0].node;

        expect(calendarchannelduplicates).toHaveProperty('handle');
        expect(calendarchannelduplicates).toHaveProperty('syncStatus');
        expect(calendarchannelduplicates).toHaveProperty('syncStage');
        expect(calendarchannelduplicates).toHaveProperty('visibility');
        expect(calendarchannelduplicates).toHaveProperty('isContactAutoCreationEnabled');
        expect(calendarchannelduplicates).toHaveProperty('contactAutoCreationPolicy');
        expect(calendarchannelduplicates).toHaveProperty('isSyncEnabled');
        expect(calendarchannelduplicates).toHaveProperty('syncCursor');
        expect(calendarchannelduplicates).toHaveProperty('syncStageStartedAt');
        expect(calendarchannelduplicates).toHaveProperty('throttleFailureCount');
        expect(calendarchannelduplicates).toHaveProperty('id');
        expect(calendarchannelduplicates).toHaveProperty('createdAt');
        expect(calendarchannelduplicates).toHaveProperty('updatedAt');
        expect(calendarchannelduplicates).toHaveProperty('connectedAccountId');
      });
  });
});
