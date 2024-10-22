import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchNotesResolver (e2e)', () => {
  it('should find many searchNotes', () => {
    const queryData = {
      query: `
        query searchNotes {
          searchNotes {
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
        const data = res.body.data.searchNotes;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchNotes = edges[0].node;

          expect(searchNotes).toHaveProperty('position');
          expect(searchNotes).toHaveProperty('title');
          expect(searchNotes).toHaveProperty('body');
          expect(searchNotes).toHaveProperty('id');
          expect(searchNotes).toHaveProperty('createdAt');
          expect(searchNotes).toHaveProperty('updatedAt');
          expect(searchNotes).toHaveProperty('deletedAt');
        }
      });
  });
});
