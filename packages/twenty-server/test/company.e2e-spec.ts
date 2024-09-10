import { INestApplication } from '@nestjs/common';

import request from 'supertest';
import { getAccessToken } from 'test/utils/get-access-token';

import { createApp } from './utils/create-app';

describe('CompanyResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    [app] = await createApp({});

    accessToken = await getAccessToken(app);
  });

  afterEach(async () => {
    await app.close();
  });

  it('should find many companies', () => {
    const queryData = {
      query: `
        query Companies {
          companies {
            edges {
              node {
                id
                name
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

        const company = edges[0].node;

        expect(company).toBeDefined();
        expect(company).toHaveProperty('id');
        expect(company).toHaveProperty('name');
      });
  });
});
