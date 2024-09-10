import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('viewSortDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many viewSortDuplicates', () => {
    const queryData = {
      query: `
        query viewSortDuplicates {
          viewSortDuplicates {
            edges {
              node {
                fieldMetadataId
                direction
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
        const data = res.body.data.viewSortDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const viewsortduplicates = edges[0].node;

        expect(viewsortduplicates).toHaveProperty('fieldMetadataId');
        expect(viewsortduplicates).toHaveProperty('direction');
        expect(viewsortduplicates).toHaveProperty('id');
        expect(viewsortduplicates).toHaveProperty('createdAt');
        expect(viewsortduplicates).toHaveProperty('updatedAt');
        expect(viewsortduplicates).toHaveProperty('viewId');
      });
  });
});
