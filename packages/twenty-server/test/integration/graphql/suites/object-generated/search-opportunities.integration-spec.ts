import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchOpportunitiesResolver (e2e)', () => {
  it('should find many searchOpportunities', () => {
    const queryData = {
      query: `
        query searchOpportunities {
          searchOpportunities {
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
      .set('Authorization', `Bearer ${ACCESS_TOKEN}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.searchOpportunities;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchOpportunities = edges[0].node;

          expect(searchOpportunities).toHaveProperty('name');
          expect(searchOpportunities).toHaveProperty('closeDate');
          expect(searchOpportunities).toHaveProperty('stage');
          expect(searchOpportunities).toHaveProperty('position');
          expect(searchOpportunities).toHaveProperty('searchVector');
          expect(searchOpportunities).toHaveProperty('id');
          expect(searchOpportunities).toHaveProperty('createdAt');
          expect(searchOpportunities).toHaveProperty('updatedAt');
          expect(searchOpportunities).toHaveProperty('deletedAt');
          expect(searchOpportunities).toHaveProperty('pointOfContactId');
          expect(searchOpportunities).toHaveProperty('companyId');
        }
      });
  });
});
