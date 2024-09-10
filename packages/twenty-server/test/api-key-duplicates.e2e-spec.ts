import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('apiKeyDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many apiKeyDuplicates', () => {
    const queryData = {
      query: `
        query apiKeyDuplicates {
          apiKeyDuplicates {
            edges {
              node {
                name
                expiresAt
                revokedAt
                id
                createdAt
                updatedAt
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
        const data = res.body.data.apiKeyDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const apikeyduplicates = edges[0].node;

        expect(apikeyduplicates).toHaveProperty('name');
        expect(apikeyduplicates).toHaveProperty('expiresAt');
        expect(apikeyduplicates).toHaveProperty('revokedAt');
        expect(apikeyduplicates).toHaveProperty('id');
        expect(apikeyduplicates).toHaveProperty('createdAt');
        expect(apikeyduplicates).toHaveProperty('updatedAt');
      });
  });
});
