import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('commentsResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many comments', () => {
    const queryData = {
      query: `
        query comments {
          comments {
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
        const data = res.body.data.comments;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const comments = edges[0].node;

        expect(comments).toHaveProperty('body');
        expect(comments).toHaveProperty('id');
        expect(comments).toHaveProperty('createdAt');
        expect(comments).toHaveProperty('updatedAt');
        expect(comments).toHaveProperty('authorId');
        expect(comments).toHaveProperty('activityId');
      });
  });
});
