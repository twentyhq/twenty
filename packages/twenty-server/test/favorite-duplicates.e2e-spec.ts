import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('favoriteDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many favoriteDuplicates', () => {
    const queryData = {
      query: `
        query favoriteDuplicates {
          favoriteDuplicates {
            edges {
              node {
                position
                id
                createdAt
                updatedAt
                workspaceMemberId
                personId
                companyId
                opportunityId
                taskId
                noteId
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
        const data = res.body.data.favoriteDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const favoriteduplicates = edges[0].node;

        expect(favoriteduplicates).toHaveProperty('position');
        expect(favoriteduplicates).toHaveProperty('id');
        expect(favoriteduplicates).toHaveProperty('createdAt');
        expect(favoriteduplicates).toHaveProperty('updatedAt');
        expect(favoriteduplicates).toHaveProperty('workspaceMemberId');
        expect(favoriteduplicates).toHaveProperty('personId');
        expect(favoriteduplicates).toHaveProperty('companyId');
        expect(favoriteduplicates).toHaveProperty('opportunityId');
        expect(favoriteduplicates).toHaveProperty('taskId');
        expect(favoriteduplicates).toHaveProperty('noteId');
      });
  });
});
