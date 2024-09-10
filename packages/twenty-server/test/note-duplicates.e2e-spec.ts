import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('noteDuplicatesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many noteDuplicates', () => {
    const queryData = {
      query: `
        query noteDuplicates {
          noteDuplicates {
            edges {
              node {
                position
                title
                body
                id
                createdAt
                updatedAt
                deletedAt
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
        const data = res.body.data.noteDuplicates;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const noteduplicates = edges[0].node;

        expect(noteduplicates).toHaveProperty('position');
        expect(noteduplicates).toHaveProperty('title');
        expect(noteduplicates).toHaveProperty('body');
        expect(noteduplicates).toHaveProperty('id');
        expect(noteduplicates).toHaveProperty('createdAt');
        expect(noteduplicates).toHaveProperty('updatedAt');
        expect(noteduplicates).toHaveProperty('deletedAt');
      });
  });
});
