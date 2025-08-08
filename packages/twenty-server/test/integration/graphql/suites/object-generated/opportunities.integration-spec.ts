import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('opportunitiesResolver (e2e)', () => {
  it('should find many opportunities', () => {
    const queryData = {
      query: `
        query opportunities {
          opportunities {
            edges {
              node {
                name
                closeDate
                stage
                position
                searchVector
                id
                createdAt
                updatedAt
                deletedAt
                pointOfContactId
                companyId
              }
            }
          }
        }
      `,
    };

    return client
      .post('/graphql')
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.opportunities;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const opportunities = edges[0].node;

          expect(opportunities).toHaveProperty('name');
          expect(opportunities).toHaveProperty('closeDate');
          expect(opportunities).toHaveProperty('stage');
          expect(opportunities).toHaveProperty('position');
          expect(opportunities).toHaveProperty('searchVector');
          expect(opportunities).toHaveProperty('id');
          expect(opportunities).toHaveProperty('createdAt');
          expect(opportunities).toHaveProperty('updatedAt');
          expect(opportunities).toHaveProperty('deletedAt');
          expect(opportunities).toHaveProperty('pointOfContactId');
          expect(opportunities).toHaveProperty('companyId');
        }
      });
  });
});
