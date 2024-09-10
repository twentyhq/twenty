import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('viewFilterDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many viewFilterDuplicates', () => {
    const queryData = {
      query: `
        query viewFilterDuplicates {
          viewFilterDuplicates {
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
        const data = res.body.data.viewFilterDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const viewfilterduplicates = edges[0].node;

        expect(viewfilterduplicates).toHaveProperty('fieldMetadataId');
        expect(viewfilterduplicates).toHaveProperty('operand');
        expect(viewfilterduplicates).toHaveProperty('value');
        expect(viewfilterduplicates).toHaveProperty('displayValue');
        expect(viewfilterduplicates).toHaveProperty('id');
        expect(viewfilterduplicates).toHaveProperty('createdAt');
        expect(viewfilterduplicates).toHaveProperty('updatedAt');
        expect(viewfilterduplicates).toHaveProperty('viewId');
      });
  });
});
