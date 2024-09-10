import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('taskDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many taskDuplicates', () => {
    const queryData = {
      query: `
        query taskDuplicates {
          taskDuplicates {
            edges {
              node {
                position
                title
                body
                dueAt
                status
                id
                createdAt
                updatedAt
                deletedAt
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
        const data = res.body.data.taskDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const taskduplicates = edges[0].node;

        expect(taskduplicates).toHaveProperty('position');
        expect(taskduplicates).toHaveProperty('title');
        expect(taskduplicates).toHaveProperty('body');
        expect(taskduplicates).toHaveProperty('dueAt');
        expect(taskduplicates).toHaveProperty('status');
        expect(taskduplicates).toHaveProperty('id');
        expect(taskduplicates).toHaveProperty('createdAt');
        expect(taskduplicates).toHaveProperty('updatedAt');
        expect(taskduplicates).toHaveProperty('deletedAt');
        expect(taskduplicates).toHaveProperty('assigneeId');
      });
  });
});
