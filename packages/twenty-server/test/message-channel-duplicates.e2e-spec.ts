import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('messageChannelDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many messageChannelDuplicates', () => {
    const queryData = {
      query: `
        query messageChannelDuplicates {
          messageChannelDuplicates {
            edges {
              node {
                visibility
                handle
                type
                isContactAutoCreationEnabled
                contactAutoCreationPolicy
                excludeNonProfessionalEmails
                excludeGroupEmails
                isSyncEnabled
                syncCursor
                syncedAt
                syncStatus
                syncStage
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
        const data = res.body.data.messageChannelDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const messagechannelduplicates = edges[0].node;

        expect(messagechannelduplicates).toHaveProperty('visibility');
        expect(messagechannelduplicates).toHaveProperty('handle');
        expect(messagechannelduplicates).toHaveProperty('type');
        expect(messagechannelduplicates).toHaveProperty('isContactAutoCreationEnabled');
        expect(messagechannelduplicates).toHaveProperty('contactAutoCreationPolicy');
        expect(messagechannelduplicates).toHaveProperty('excludeNonProfessionalEmails');
        expect(messagechannelduplicates).toHaveProperty('excludeGroupEmails');
        expect(messagechannelduplicates).toHaveProperty('isSyncEnabled');
        expect(messagechannelduplicates).toHaveProperty('syncCursor');
        expect(messagechannelduplicates).toHaveProperty('syncedAt');
        expect(messagechannelduplicates).toHaveProperty('syncStatus');
        expect(messagechannelduplicates).toHaveProperty('syncStage');
        expect(messagechannelduplicates).toHaveProperty('syncStageStartedAt');
        expect(messagechannelduplicates).toHaveProperty('throttleFailureCount');
        expect(messagechannelduplicates).toHaveProperty('id');
        expect(messagechannelduplicates).toHaveProperty('createdAt');
        expect(messagechannelduplicates).toHaveProperty('updatedAt');
        expect(messagechannelduplicates).toHaveProperty('connectedAccountId');
      });
  });
});
