import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('webhookDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many webhookDuplicates', () => {
    const queryData = {
      query: `
        query webhookDuplicates {
          webhookDuplicates {
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
        const data = res.body.data.webhookDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const webhookduplicates = edges[0].node;

        expect(webhookduplicates).toHaveProperty('targetUrl');
        expect(webhookduplicates).toHaveProperty('operation');
        expect(webhookduplicates).toHaveProperty('description');
        expect(webhookduplicates).toHaveProperty('id');
        expect(webhookduplicates).toHaveProperty('createdAt');
        expect(webhookduplicates).toHaveProperty('updatedAt');
      });
  });
});
