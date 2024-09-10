import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('commentDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many commentDuplicates', () => {
    const queryData = {
      query: `
        query commentDuplicates {
          commentDuplicates {
            edges {
              node {
                body
                id
                createdAt
                updatedAt
                authorId
                activityId
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
        const data = res.body.data.commentDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const commentduplicates = edges[0].node;

        expect(commentduplicates).toHaveProperty('body');
        expect(commentduplicates).toHaveProperty('id');
        expect(commentduplicates).toHaveProperty('createdAt');
        expect(commentduplicates).toHaveProperty('updatedAt');
        expect(commentduplicates).toHaveProperty('authorId');
        expect(commentduplicates).toHaveProperty('activityId');
      });
  });
});
