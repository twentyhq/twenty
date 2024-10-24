import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchRocketsResolver (e2e)', () => {
  it('should find many searchRockets', () => {
    const queryData = {
      query: `
        query searchRockets {
          searchRockets {
            edges {
              node {
                id
                name
                createdAt
                updatedAt
                deletedAt
                position
                searchVector
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
        const data = res.body.data.searchRockets;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchRockets = edges[0].node;

          expect(searchRockets).toHaveProperty('id');
          expect(searchRockets).toHaveProperty('name');
          expect(searchRockets).toHaveProperty('createdAt');
          expect(searchRockets).toHaveProperty('updatedAt');
          expect(searchRockets).toHaveProperty('deletedAt');
          expect(searchRockets).toHaveProperty('position');
          expect(searchRockets).toHaveProperty('searchVector');
        }
      });
  });
});
