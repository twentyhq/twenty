import { INestApplication } from '@nestjs/common';

import request from 'supertest';

import setup from './utils/global-setup';

describe('notesResolver (e2e)', () => {
  let app: INestApplication;
  let accessToken: string | undefined;

  beforeAll(async () => {
    const setupData = await setup();

    app = setupData.app;
    accessToken = setupData.accessToken;
  });

  it('should find many notes', () => {
    const queryData = {
      query: `
        query notes {
          notes {
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
        const data = res.body.data.notes;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        expect(edges.length).toBeGreaterThan(0);

        const notes = edges[0].node;

        expect(notes).toHaveProperty('position');
        expect(notes).toHaveProperty('title');
        expect(notes).toHaveProperty('body');
        expect(notes).toHaveProperty('id');
        expect(notes).toHaveProperty('createdAt');
        expect(notes).toHaveProperty('updatedAt');
        expect(notes).toHaveProperty('deletedAt');
      });
  });
});
