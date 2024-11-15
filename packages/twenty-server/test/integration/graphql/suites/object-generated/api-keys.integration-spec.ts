import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('apiKeysResolver (e2e)', () => {
  it('should find many apiKeys', () => {
    const queryData = {
      query: `
        query apiKeys {
          apiKeys {
            edges {
              node {
                name
                expiresAt
                revokedAt
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
        const data = res.body.data.apiKeys;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const apiKeys = edges[0].node;

          expect(apiKeys).toHaveProperty('name');
          expect(apiKeys).toHaveProperty('expiresAt');
          expect(apiKeys).toHaveProperty('revokedAt');
          expect(apiKeys).toHaveProperty('id');
          expect(apiKeys).toHaveProperty('createdAt');
          expect(apiKeys).toHaveProperty('updatedAt');
          expect(apiKeys).toHaveProperty('deletedAt');
        }
      });
  });
});
