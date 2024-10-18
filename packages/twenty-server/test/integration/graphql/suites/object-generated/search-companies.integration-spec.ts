import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchCompaniesResolver (e2e)', () => {
  it('should find many searchCompanies', () => {
    const queryData = {
      query: `
        query searchCompanies {
          searchCompanies {
            edges {
              node {
                name
                employees
                idealCustomerProfile
                position
                searchVector
                id
                createdAt
                updatedAt
                deletedAt
                accountOwnerId
                tagline
                workPolicy
                visaSponsorship
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
        const data = res.body.data.searchCompanies;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchCompanies = edges[0].node;

          expect(searchCompanies).toHaveProperty('name');
          expect(searchCompanies).toHaveProperty('employees');
          expect(searchCompanies).toHaveProperty('idealCustomerProfile');
          expect(searchCompanies).toHaveProperty('position');
          expect(searchCompanies).toHaveProperty('searchVector');
          expect(searchCompanies).toHaveProperty('id');
          expect(searchCompanies).toHaveProperty('createdAt');
          expect(searchCompanies).toHaveProperty('updatedAt');
          expect(searchCompanies).toHaveProperty('deletedAt');
          expect(searchCompanies).toHaveProperty('accountOwnerId');
          expect(searchCompanies).toHaveProperty('tagline');
          expect(searchCompanies).toHaveProperty('workPolicy');
          expect(searchCompanies).toHaveProperty('visaSponsorship');
        }
      });
  });
});
