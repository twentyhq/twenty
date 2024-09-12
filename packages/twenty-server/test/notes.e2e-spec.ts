import request from 'supertest';

describe('notesResolver (e2e)', () => {
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

    return request(global.app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${global.accessToken}`)
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

        if (edges.length > 0) {
          const notes = edges[0].node;

          expect(notes).toHaveProperty('position');
          expect(notes).toHaveProperty('title');
          expect(notes).toHaveProperty('body');
          expect(notes).toHaveProperty('id');
          expect(notes).toHaveProperty('createdAt');
          expect(notes).toHaveProperty('updatedAt');
          expect(notes).toHaveProperty('deletedAt');
        }
      });
  });
});
