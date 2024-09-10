import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('companyDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many companyDuplicates', () => {
    const queryData = {
      query: `
        query companyDuplicates {
          companyDuplicates {
            edges {
              node {
                name
                employees
                idealCustomerProfile
                position
                id
                createdAt
                updatedAt
                deletedAt
                accountOwnerId
                tagline
                workPolicy
                visaSponsorship
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
        const data = res.body.data.companyDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const companyduplicates = edges[0].node;

        expect(companyduplicates).toHaveProperty('name');
        expect(companyduplicates).toHaveProperty('employees');
        expect(companyduplicates).toHaveProperty('idealCustomerProfile');
        expect(companyduplicates).toHaveProperty('position');
        expect(companyduplicates).toHaveProperty('id');
        expect(companyduplicates).toHaveProperty('createdAt');
        expect(companyduplicates).toHaveProperty('updatedAt');
        expect(companyduplicates).toHaveProperty('deletedAt');
        expect(companyduplicates).toHaveProperty('accountOwnerId');
        expect(companyduplicates).toHaveProperty('tagline');
        expect(companyduplicates).toHaveProperty('workPolicy');
        expect(companyduplicates).toHaveProperty('visaSponsorship');
      });
  });
});
