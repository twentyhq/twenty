import request from 'supertest';

describe('webhooksResolver (e2e)', () => {
  it('should find many webhooks', () => {
    const queryData = {
      query: `
        query webhooks {
          webhooks {
            edges {
              node {
                targetUrl
                operation
                description
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
        const data = res.body.data.webhooks;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const webhooks = edges[0].node;

          expect(webhooks).toHaveProperty('targetUrl');
          expect(webhooks).toHaveProperty('operation');
          expect(webhooks).toHaveProperty('description');
          expect(webhooks).toHaveProperty('id');
          expect(webhooks).toHaveProperty('createdAt');
          expect(webhooks).toHaveProperty('updatedAt');
        }
      });
  });
});
