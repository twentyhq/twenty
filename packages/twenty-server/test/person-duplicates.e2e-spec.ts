import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('personDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many personDuplicates', () => {
    const queryData = {
      query: `
        query personDuplicates {
          personDuplicates {
            edges {
              node {
                email
                jobTitle
                phone
                city
                avatarUrl
                position
                id
                createdAt
                updatedAt
                deletedAt
                companyId
                intro
                whatsapp
                workPrefereance
                performanceRating
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
        const data = res.body.data.personDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const personduplicates = edges[0].node;

        expect(personduplicates).toHaveProperty('email');
        expect(personduplicates).toHaveProperty('jobTitle');
        expect(personduplicates).toHaveProperty('phone');
        expect(personduplicates).toHaveProperty('city');
        expect(personduplicates).toHaveProperty('avatarUrl');
        expect(personduplicates).toHaveProperty('position');
        expect(personduplicates).toHaveProperty('id');
        expect(personduplicates).toHaveProperty('createdAt');
        expect(personduplicates).toHaveProperty('updatedAt');
        expect(personduplicates).toHaveProperty('deletedAt');
        expect(personduplicates).toHaveProperty('companyId');
        expect(personduplicates).toHaveProperty('intro');
        expect(personduplicates).toHaveProperty('whatsapp');
        expect(personduplicates).toHaveProperty('workPrefereance');
        expect(personduplicates).toHaveProperty('performanceRating');
      });
  });
});
