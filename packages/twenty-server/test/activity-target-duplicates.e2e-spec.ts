import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('activityTargetDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many activityTargetDuplicates', () => {
    const queryData = {
      query: `
        query activityTargetDuplicates {
          activityTargetDuplicates {
            edges {
              node {
                id
                createdAt
                updatedAt
                activityId
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
        const data = res.body.data.activityTargetDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const activitytargetduplicates = edges[0].node;

        expect(activitytargetduplicates).toHaveProperty('id');
        expect(activitytargetduplicates).toHaveProperty('createdAt');
        expect(activitytargetduplicates).toHaveProperty('updatedAt');
        expect(activitytargetduplicates).toHaveProperty('activityId');
        expect(activitytargetduplicates).toHaveProperty('personId');
        expect(activitytargetduplicates).toHaveProperty('companyId');
        expect(activitytargetduplicates).toHaveProperty('opportunityId');
      });
  });
});
