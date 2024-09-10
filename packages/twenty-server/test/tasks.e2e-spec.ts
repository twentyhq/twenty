import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('tasksResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many tasks', () => {
    const queryData = {
      query: `
        query tasks {
          tasks {
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
        const data = res.body.data.tasks;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const tasks = edges[0].node;

        expect(tasks).toHaveProperty('position');
        expect(tasks).toHaveProperty('title');
        expect(tasks).toHaveProperty('body');
        expect(tasks).toHaveProperty('dueAt');
        expect(tasks).toHaveProperty('status');
        expect(tasks).toHaveProperty('id');
        expect(tasks).toHaveProperty('createdAt');
        expect(tasks).toHaveProperty('updatedAt');
        expect(tasks).toHaveProperty('deletedAt');
        expect(tasks).toHaveProperty('assigneeId');
      });
  });
});
