import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('viewFieldDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many viewFieldDuplicates', () => {
    const queryData = {
      query: `
        query viewFieldDuplicates {
          viewFieldDuplicates {
            edges {
              node {
                fieldMetadataId
                isVisible
                size
                position
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
        const data = res.body.data.viewFieldDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const viewfieldduplicates = edges[0].node;

        expect(viewfieldduplicates).toHaveProperty('fieldMetadataId');
        expect(viewfieldduplicates).toHaveProperty('isVisible');
        expect(viewfieldduplicates).toHaveProperty('size');
        expect(viewfieldduplicates).toHaveProperty('position');
        expect(viewfieldduplicates).toHaveProperty('id');
        expect(viewfieldduplicates).toHaveProperty('createdAt');
        expect(viewfieldduplicates).toHaveProperty('updatedAt');
        expect(viewfieldduplicates).toHaveProperty('viewId');
      });
  });
});
