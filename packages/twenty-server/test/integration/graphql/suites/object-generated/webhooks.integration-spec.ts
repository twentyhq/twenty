import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('webhooksResolver (e2e)', () => {
  it('should find many webhooks', () => {
    const queryData = {
      query: `
        query webhooks {
          webhooks {
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
        const data = res.body.data.webhooks;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const webhooks = edges[0].node;

          expect(webhooks).toHaveProperty('id');
          expect(webhooks).toHaveProperty('targetUrl');
          expect(webhooks).toHaveProperty('operations');
          expect(webhooks).toHaveProperty('description');
          expect(webhooks).toHaveProperty('createdAt');
          expect(webhooks).toHaveProperty('updatedAt');
          expect(webhooks).toHaveProperty('deletedAt');
        }
      });
  });
});
