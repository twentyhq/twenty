import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchMessageThreadsResolver (e2e)', () => {
  it('should find many searchMessageThreads', () => {
    const queryData = {
      query: `
        query searchMessageThreads {
          searchMessageThreads {
            edges {
              node {
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
        const data = res.body.data.searchMessageThreads;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchMessageThreads = edges[0].node;

          expect(searchMessageThreads).toHaveProperty('id');
          expect(searchMessageThreads).toHaveProperty('createdAt');
          expect(searchMessageThreads).toHaveProperty('updatedAt');
          expect(searchMessageThreads).toHaveProperty('deletedAt');
        }
      });
  });
});
