import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('opportunityDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many opportunityDuplicates', () => {
    const queryData = {
      query: `
        query opportunityDuplicates {
          opportunityDuplicates {
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
        const data = res.body.data.opportunityDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const opportunityduplicates = edges[0].node;

        expect(opportunityduplicates).toHaveProperty('name');
        expect(opportunityduplicates).toHaveProperty('closeDate');
        expect(opportunityduplicates).toHaveProperty('stage');
        expect(opportunityduplicates).toHaveProperty('position');
        expect(opportunityduplicates).toHaveProperty('id');
        expect(opportunityduplicates).toHaveProperty('createdAt');
        expect(opportunityduplicates).toHaveProperty('updatedAt');
        expect(opportunityduplicates).toHaveProperty('deletedAt');
        expect(opportunityduplicates).toHaveProperty('pointOfContactId');
        expect(opportunityduplicates).toHaveProperty('companyId');
      });
  });
});
