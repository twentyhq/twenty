import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('messageThreadsResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many messageThreads', () => {
    const queryData = {
      query: `
        query messageThreads {
          messageThreads {
            edges {
              node {
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
        const data = res.body.data.messageThreads;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const messagethreads = edges[0].node;

        expect(messagethreads).toHaveProperty('id');
        expect(messagethreads).toHaveProperty('createdAt');
        expect(messagethreads).toHaveProperty('updatedAt');
      });
  });
});
