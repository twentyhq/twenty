import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchWebhooksResolver (e2e)', () => {
  it('should find many searchWebhooks', () => {
    const queryData = {
      query: `
        query searchWebhooks {
          searchWebhooks {
            edges {
              node {
                id
                targetUrl
                operations
                description
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
        const data = res.body.data.searchWebhooks;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchWebhooks = edges[0].node;

          expect(searchWebhooks).toHaveProperty('id');
          expect(searchWebhooks).toHaveProperty('targetUrl');
          expect(searchWebhooks).toHaveProperty('operations');
          expect(searchWebhooks).toHaveProperty('description');
          expect(searchWebhooks).toHaveProperty('createdAt');
          expect(searchWebhooks).toHaveProperty('updatedAt');
          expect(searchWebhooks).toHaveProperty('deletedAt');
        }
      });
  });
});
