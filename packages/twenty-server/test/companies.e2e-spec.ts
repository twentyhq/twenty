import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('companiesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many companies', () => {
    const queryData = {
      query: `
        query companies {
          companies {
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
        const data = res.body.data.companies;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const companies = edges[0].node;

        expect(companies).toHaveProperty('name');
        expect(companies).toHaveProperty('employees');
        expect(companies).toHaveProperty('idealCustomerProfile');
        expect(companies).toHaveProperty('position');
        expect(companies).toHaveProperty('id');
        expect(companies).toHaveProperty('createdAt');
        expect(companies).toHaveProperty('updatedAt');
        expect(companies).toHaveProperty('deletedAt');
        expect(companies).toHaveProperty('accountOwnerId');
        expect(companies).toHaveProperty('tagline');
        expect(companies).toHaveProperty('workPolicy');
        expect(companies).toHaveProperty('visaSponsorship');
      });
  });
});
