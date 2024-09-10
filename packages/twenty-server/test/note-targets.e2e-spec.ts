import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('noteTargetsResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many noteTargets', () => {
    const queryData = {
      query: `
        query noteTargets {
          noteTargets {
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
        const data = res.body.data.noteTargets;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const notetargets = edges[0].node;

        expect(notetargets).toHaveProperty('id');
        expect(notetargets).toHaveProperty('createdAt');
        expect(notetargets).toHaveProperty('updatedAt');
        expect(notetargets).toHaveProperty('deletedAt');
        expect(notetargets).toHaveProperty('noteId');
        expect(notetargets).toHaveProperty('personId');
        expect(notetargets).toHaveProperty('companyId');
        expect(notetargets).toHaveProperty('opportunityId');
      });
  });
});
