import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('serverlessFunctionsResolver (e2e)', () => {
  it('should find many serverlessFunctions', () => {
    const queryData = {
      query: `
        query serverlessFunctions {
          serverlessFunctions {
            edges {
              node {
                id
                name
                description
                sourceCodeHash
                runtime
                latestVersion
                syncStatus
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
        const data = res.body.data.serverlessFunctions;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const serverlessfunctions = edges[0].node;

          expect(serverlessfunctions).toHaveProperty('id');
          expect(serverlessfunctions).toHaveProperty('name');
          expect(serverlessfunctions).toHaveProperty('description');
          expect(serverlessfunctions).toHaveProperty('sourceCodeHash');
          expect(serverlessfunctions).toHaveProperty('runtime');
          expect(serverlessfunctions).toHaveProperty('latestVersion');
          expect(serverlessfunctions).toHaveProperty('syncStatus');
          expect(serverlessfunctions).toHaveProperty('createdAt');
          expect(serverlessfunctions).toHaveProperty('updatedAt');
        }
      });
  });
});
