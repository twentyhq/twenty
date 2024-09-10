import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('viewDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many viewDuplicates', () => {
    const queryData = {
      query: `
        query viewDuplicates {
          viewDuplicates {
            edges {
              node {
                name
                objectMetadataId
                type
                key
                icon
                kanbanFieldMetadataId
                position
                isCompact
                id
                createdAt
                updatedAt
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
        const data = res.body.data.viewDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const viewduplicates = edges[0].node;

        expect(viewduplicates).toHaveProperty('name');
        expect(viewduplicates).toHaveProperty('objectMetadataId');
        expect(viewduplicates).toHaveProperty('type');
        expect(viewduplicates).toHaveProperty('key');
        expect(viewduplicates).toHaveProperty('icon');
        expect(viewduplicates).toHaveProperty('kanbanFieldMetadataId');
        expect(viewduplicates).toHaveProperty('position');
        expect(viewduplicates).toHaveProperty('isCompact');
        expect(viewduplicates).toHaveProperty('id');
        expect(viewduplicates).toHaveProperty('createdAt');
        expect(viewduplicates).toHaveProperty('updatedAt');
      });
  });
});
