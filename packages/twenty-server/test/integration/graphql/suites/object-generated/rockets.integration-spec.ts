import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('rocketsResolver (e2e)', () => {
  it('should find many rockets', () => {
    const queryData = {
      query: `
        query rockets {
          rockets {
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
        const data = res.body.data.rockets;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const rockets = edges[0].node;

          expect(rockets).toHaveProperty('id');
          expect(rockets).toHaveProperty('name');
          expect(rockets).toHaveProperty('createdAt');
          expect(rockets).toHaveProperty('updatedAt');
          expect(rockets).toHaveProperty('deletedAt');
          expect(rockets).toHaveProperty('position');
          expect(rockets).toHaveProperty('searchVector');
        }
      });
  });
});
