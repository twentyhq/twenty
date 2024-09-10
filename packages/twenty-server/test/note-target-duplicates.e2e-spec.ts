import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('noteTargetDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many noteTargetDuplicates', () => {
    const queryData = {
      query: `
        query noteTargetDuplicates {
          noteTargetDuplicates {
            edges {
              node {
                id
                createdAt
                updatedAt
                deletedAt
                noteId
                personId
                companyId
                opportunityId
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
        const data = res.body.data.noteTargetDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const notetargetduplicates = edges[0].node;

        expect(notetargetduplicates).toHaveProperty('id');
        expect(notetargetduplicates).toHaveProperty('createdAt');
        expect(notetargetduplicates).toHaveProperty('updatedAt');
        expect(notetargetduplicates).toHaveProperty('deletedAt');
        expect(notetargetduplicates).toHaveProperty('noteId');
        expect(notetargetduplicates).toHaveProperty('personId');
        expect(notetargetduplicates).toHaveProperty('companyId');
        expect(notetargetduplicates).toHaveProperty('opportunityId');
      });
  });
});
