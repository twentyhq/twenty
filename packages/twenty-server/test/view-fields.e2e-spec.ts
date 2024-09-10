import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('viewFieldsResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many viewFields', () => {
    const queryData = {
      query: `
        query viewFields {
          viewFields {
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
        const data = res.body.data.viewFields;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const viewfields = edges[0].node;

        expect(viewfields).toHaveProperty('fieldMetadataId');
        expect(viewfields).toHaveProperty('isVisible');
        expect(viewfields).toHaveProperty('size');
        expect(viewfields).toHaveProperty('position');
        expect(viewfields).toHaveProperty('id');
        expect(viewfields).toHaveProperty('createdAt');
        expect(viewfields).toHaveProperty('updatedAt');
        expect(viewfields).toHaveProperty('viewId');
      });
  });
});
