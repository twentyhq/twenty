import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('activityTargetsResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many activityTargets', () => {
    const queryData = {
      query: `
        query activityTargets {
          activityTargets {
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
        const data = res.body.data.activityTargets;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const activitytargets = edges[0].node;

        expect(activitytargets).toHaveProperty('id');
        expect(activitytargets).toHaveProperty('createdAt');
        expect(activitytargets).toHaveProperty('updatedAt');
        expect(activitytargets).toHaveProperty('activityId');
        expect(activitytargets).toHaveProperty('personId');
        expect(activitytargets).toHaveProperty('companyId');
        expect(activitytargets).toHaveProperty('opportunityId');
      });
  });
});
