import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('taskTargetDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many taskTargetDuplicates', () => {
    const queryData = {
      query: `
        query taskTargetDuplicates {
          taskTargetDuplicates {
            edges {
              node {
                id
                createdAt
                updatedAt
                deletedAt
                taskId
                personId
                companyId
                opportunityId
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
        const data = res.body.data.taskTargetDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const tasktargetduplicates = edges[0].node;

        expect(tasktargetduplicates).toHaveProperty('id');
        expect(tasktargetduplicates).toHaveProperty('createdAt');
        expect(tasktargetduplicates).toHaveProperty('updatedAt');
        expect(tasktargetduplicates).toHaveProperty('deletedAt');
        expect(tasktargetduplicates).toHaveProperty('taskId');
        expect(tasktargetduplicates).toHaveProperty('personId');
        expect(tasktargetduplicates).toHaveProperty('companyId');
        expect(tasktargetduplicates).toHaveProperty('opportunityId');
      });
  });
});
