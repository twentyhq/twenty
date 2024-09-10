import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('apiKeysResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many apiKeys', () => {
    const queryData = {
      query: `
        query apiKeys {
          apiKeys {
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
        const data = res.body.data.apiKeys;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const apikeys = edges[0].node;

        expect(apikeys).toHaveProperty('name');
        expect(apikeys).toHaveProperty('expiresAt');
        expect(apikeys).toHaveProperty('revokedAt');
        expect(apikeys).toHaveProperty('id');
        expect(apikeys).toHaveProperty('createdAt');
        expect(apikeys).toHaveProperty('updatedAt');
      });
  });
});
