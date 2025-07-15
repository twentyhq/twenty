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
                deletedAt
              }
            }
          }
        }
      `,
    };

    return client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
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
          const messageThreads = edges[0].node;

          expect(messageThreads).toHaveProperty('id');
          expect(messageThreads).toHaveProperty('createdAt');
          expect(messageThreads).toHaveProperty('updatedAt');
          expect(messageThreads).toHaveProperty('deletedAt');
        }
      });
  });
});
