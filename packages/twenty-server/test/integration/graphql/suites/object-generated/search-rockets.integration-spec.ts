import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchPetsResolver (e2e)', () => {
  it('should find many searchPets', () => {
    const queryData = {
      query: `
        query searchPets {
          searchPets {
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
      .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.searchPets;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchPets = edges[0].node;

          expect(searchPets).toHaveProperty('id');
          expect(searchPets).toHaveProperty('name');
          expect(searchPets).toHaveProperty('createdAt');
          expect(searchPets).toHaveProperty('updatedAt');
          expect(searchPets).toHaveProperty('deletedAt');
          expect(searchPets).toHaveProperty('position');
          expect(searchPets).toHaveProperty('searchVector');
        }
      });
  });
});
