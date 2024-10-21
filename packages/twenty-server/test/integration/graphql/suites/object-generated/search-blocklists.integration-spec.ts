import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchBlocklistsResolver (e2e)', () => {
  it('should find many searchBlocklists', () => {
    const queryData = {
      query: `
        query searchBlocklists {
          searchBlocklists {
            edges {
              node {
                handle
                id
                createdAt
                updatedAt
                deletedAt
                workspaceMemberId
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
        const data = res.body.data.searchBlocklists;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchBlocklists = edges[0].node;

          expect(searchBlocklists).toHaveProperty('handle');
          expect(searchBlocklists).toHaveProperty('id');
          expect(searchBlocklists).toHaveProperty('createdAt');
          expect(searchBlocklists).toHaveProperty('updatedAt');
          expect(searchBlocklists).toHaveProperty('deletedAt');
          expect(searchBlocklists).toHaveProperty('workspaceMemberId');
        }
      });
  });
});
