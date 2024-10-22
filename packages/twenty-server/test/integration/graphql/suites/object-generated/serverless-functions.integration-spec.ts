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
          const serverlessFunctions = edges[0].node;

          expect(serverlessFunctions).toHaveProperty('id');
          expect(serverlessFunctions).toHaveProperty('name');
          expect(serverlessFunctions).toHaveProperty('description');
          expect(serverlessFunctions).toHaveProperty('runtime');
          expect(serverlessFunctions).toHaveProperty('latestVersion');
          expect(serverlessFunctions).toHaveProperty('syncStatus');
          expect(serverlessFunctions).toHaveProperty('createdAt');
          expect(serverlessFunctions).toHaveProperty('updatedAt');
        }
      });
  });
});
