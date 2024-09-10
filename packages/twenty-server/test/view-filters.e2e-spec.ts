import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('viewFiltersResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many viewFilters', () => {
    const queryData = {
      query: `
        query viewFilters {
          viewFilters {
            edges {
              node {
                fieldMetadataId
                operand
                value
                displayValue
                id
                createdAt
                updatedAt
                viewId
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
        const data = res.body.data.viewFilters;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const viewfilters = edges[0].node;

        expect(viewfilters).toHaveProperty('fieldMetadataId');
        expect(viewfilters).toHaveProperty('operand');
        expect(viewfilters).toHaveProperty('value');
        expect(viewfilters).toHaveProperty('displayValue');
        expect(viewfilters).toHaveProperty('id');
        expect(viewfilters).toHaveProperty('createdAt');
        expect(viewfilters).toHaveProperty('updatedAt');
        expect(viewfilters).toHaveProperty('viewId');
      });
  });
});
