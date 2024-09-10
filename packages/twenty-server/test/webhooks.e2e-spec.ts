import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('webhooksResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many webhooks', () => {
    const queryData = {
      query: `
        query webhooks {
          webhooks {
            edges {
              node {
                targetUrl
                operation
                description
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
        const data = res.body.data.webhooks;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const webhooks = edges[0].node;

        expect(webhooks).toHaveProperty('targetUrl');
        expect(webhooks).toHaveProperty('operation');
        expect(webhooks).toHaveProperty('description');
        expect(webhooks).toHaveProperty('id');
        expect(webhooks).toHaveProperty('createdAt');
        expect(webhooks).toHaveProperty('updatedAt');
      });
  });
});
