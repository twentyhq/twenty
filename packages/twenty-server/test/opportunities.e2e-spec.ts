import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('opportunitiesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many opportunities', () => {
    const queryData = {
      query: `
        query opportunities {
          opportunities {
            edges {
              node {
                name
                closeDate
                stage
                position
                id
                createdAt
                updatedAt
                deletedAt
                pointOfContactId
                companyId
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
        const data = res.body.data.opportunities;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const opportunities = edges[0].node;

        expect(opportunities).toHaveProperty('name');
        expect(opportunities).toHaveProperty('closeDate');
        expect(opportunities).toHaveProperty('stage');
        expect(opportunities).toHaveProperty('position');
        expect(opportunities).toHaveProperty('id');
        expect(opportunities).toHaveProperty('createdAt');
        expect(opportunities).toHaveProperty('updatedAt');
        expect(opportunities).toHaveProperty('deletedAt');
        expect(opportunities).toHaveProperty('pointOfContactId');
        expect(opportunities).toHaveProperty('companyId');
      });
  });
});
