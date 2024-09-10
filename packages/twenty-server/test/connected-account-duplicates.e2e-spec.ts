import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('connectedAccountDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many connectedAccountDuplicates', () => {
    const queryData = {
      query: `
        query connectedAccountDuplicates {
          connectedAccountDuplicates {
            edges {
              node {
                handle
                provider
                accessToken
                refreshToken
                lastSyncHistoryId
                authFailedAt
                handleAliases
                id
                createdAt
                updatedAt
                accountOwnerId
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
        const data = res.body.data.connectedAccountDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const connectedaccountduplicates = edges[0].node;

        expect(connectedaccountduplicates).toHaveProperty('handle');
        expect(connectedaccountduplicates).toHaveProperty('provider');
        expect(connectedaccountduplicates).toHaveProperty('accessToken');
        expect(connectedaccountduplicates).toHaveProperty('refreshToken');
        expect(connectedaccountduplicates).toHaveProperty('lastSyncHistoryId');
        expect(connectedaccountduplicates).toHaveProperty('authFailedAt');
        expect(connectedaccountduplicates).toHaveProperty('handleAliases');
        expect(connectedaccountduplicates).toHaveProperty('id');
        expect(connectedaccountduplicates).toHaveProperty('createdAt');
        expect(connectedaccountduplicates).toHaveProperty('updatedAt');
        expect(connectedaccountduplicates).toHaveProperty('accountOwnerId');
      });
  });
});
