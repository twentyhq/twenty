import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('favoritesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many favorites', () => {
    const queryData = {
      query: `
        query favorites {
          favorites {
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
        const data = res.body.data.favorites;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const favorites = edges[0].node;

        expect(favorites).toHaveProperty('position');
        expect(favorites).toHaveProperty('id');
        expect(favorites).toHaveProperty('createdAt');
        expect(favorites).toHaveProperty('updatedAt');
        expect(favorites).toHaveProperty('workspaceMemberId');
        expect(favorites).toHaveProperty('personId');
        expect(favorites).toHaveProperty('companyId');
        expect(favorites).toHaveProperty('opportunityId');
        expect(favorites).toHaveProperty('taskId');
        expect(favorites).toHaveProperty('noteId');
      });
  });
});
