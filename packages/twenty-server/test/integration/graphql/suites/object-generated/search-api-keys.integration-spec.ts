import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchApiKeysResolver (e2e)', () => {
  it('should find many searchApiKeys', () => {
    const queryData = {
      query: `
        query searchApiKeys {
          searchApiKeys {
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
        const data = res.body.data.searchApiKeys;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchApiKeys = edges[0].node;

          expect(searchApiKeys).toHaveProperty('name');
          expect(searchApiKeys).toHaveProperty('expiresAt');
          expect(searchApiKeys).toHaveProperty('revokedAt');
          expect(searchApiKeys).toHaveProperty('id');
          expect(searchApiKeys).toHaveProperty('createdAt');
          expect(searchApiKeys).toHaveProperty('updatedAt');
          expect(searchApiKeys).toHaveProperty('deletedAt');
        }
      });
  });
});
