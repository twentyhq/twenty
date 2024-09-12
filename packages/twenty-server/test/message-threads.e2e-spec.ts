import request from 'supertest';

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
