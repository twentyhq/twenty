import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('viewSortsResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many viewSorts', () => {
    const queryData = {
      query: `
        query viewSorts {
          viewSorts {
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
        const data = res.body.data.viewSorts;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const viewsorts = edges[0].node;

        expect(viewsorts).toHaveProperty('fieldMetadataId');
        expect(viewsorts).toHaveProperty('direction');
        expect(viewsorts).toHaveProperty('id');
        expect(viewsorts).toHaveProperty('createdAt');
        expect(viewsorts).toHaveProperty('updatedAt');
        expect(viewsorts).toHaveProperty('viewId');
      });
  });
});
