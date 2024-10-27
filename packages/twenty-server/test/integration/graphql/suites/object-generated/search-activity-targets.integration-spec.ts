import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchActivityTargetsResolver (e2e)', () => {
  it('should find many searchActivityTargets', () => {
    const queryData = {
      query: `
        query searchActivityTargets {
          searchActivityTargets {
            edges {
              node {
                id
                createdAt
                updatedAt
                deletedAt
                activityId
                personId
                companyId
                opportunityId
                rocketId
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
        const data = res.body.data.searchActivityTargets;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchActivityTargets = edges[0].node;

          expect(searchActivityTargets).toHaveProperty('id');
          expect(searchActivityTargets).toHaveProperty('createdAt');
          expect(searchActivityTargets).toHaveProperty('updatedAt');
          expect(searchActivityTargets).toHaveProperty('deletedAt');
          expect(searchActivityTargets).toHaveProperty('activityId');
          expect(searchActivityTargets).toHaveProperty('personId');
          expect(searchActivityTargets).toHaveProperty('companyId');
          expect(searchActivityTargets).toHaveProperty('opportunityId');
          expect(searchActivityTargets).toHaveProperty('rocketId');
        }
      });
  });
});
