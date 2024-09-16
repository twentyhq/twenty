import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

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

    return client
      .post('/graphql')
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
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
