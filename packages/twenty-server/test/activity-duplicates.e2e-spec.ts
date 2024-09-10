import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('activityDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many activityDuplicates', () => {
    const queryData = {
      query: `
        query activityDuplicates {
          activityDuplicates {
            edges {
              node {
                title
                body
                type
                reminderAt
                dueAt
                completedAt
                id
                createdAt
                updatedAt
                authorId
                assigneeId
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
        const data = res.body.data.activityDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const activityduplicates = edges[0].node;

        expect(activityduplicates).toHaveProperty('title');
        expect(activityduplicates).toHaveProperty('body');
        expect(activityduplicates).toHaveProperty('type');
        expect(activityduplicates).toHaveProperty('reminderAt');
        expect(activityduplicates).toHaveProperty('dueAt');
        expect(activityduplicates).toHaveProperty('completedAt');
        expect(activityduplicates).toHaveProperty('id');
        expect(activityduplicates).toHaveProperty('createdAt');
        expect(activityduplicates).toHaveProperty('updatedAt');
        expect(activityduplicates).toHaveProperty('authorId');
        expect(activityduplicates).toHaveProperty('assigneeId');
      });
  });
});
