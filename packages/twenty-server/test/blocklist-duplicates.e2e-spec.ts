import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('blocklistDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many blocklistDuplicates', () => {
    const queryData = {
      query: `
        query blocklistDuplicates {
          blocklistDuplicates {
            edges {
              node {
                handle
                id
                createdAt
                updatedAt
                workspaceMemberId
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
        const data = res.body.data.blocklistDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const blocklistduplicates = edges[0].node;

        expect(blocklistduplicates).toHaveProperty('handle');
        expect(blocklistduplicates).toHaveProperty('id');
        expect(blocklistduplicates).toHaveProperty('createdAt');
        expect(blocklistduplicates).toHaveProperty('updatedAt');
        expect(blocklistduplicates).toHaveProperty('workspaceMemberId');
      });
  });
});
