import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('messageThreadsResolver (e2e)', () => {
  it('should find many messageThreads', () => {
    const queryData = {
      query: `
        query messageThreads {
          messageThreads {
            edges {
              node {
                id
                createdAt
                updatedAt
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
        const data = res.body.data.messageThreads;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const messagethreads = edges[0].node;

          expect(messagethreads).toHaveProperty('id');
          expect(messagethreads).toHaveProperty('createdAt');
          expect(messagethreads).toHaveProperty('updatedAt');
        }
      });
  });
});
