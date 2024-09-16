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
          const apikeys = edges[0].node;

          expect(apikeys).toHaveProperty('name');
          expect(apikeys).toHaveProperty('expiresAt');
          expect(apikeys).toHaveProperty('revokedAt');
          expect(apikeys).toHaveProperty('id');
          expect(apikeys).toHaveProperty('createdAt');
          expect(apikeys).toHaveProperty('updatedAt');
        }
      });
  });
});
