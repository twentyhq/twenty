import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchTaskTargetsResolver (e2e)', () => {
  it('should find many searchTaskTargets', () => {
    const queryData = {
      query: `
        query searchTaskTargets {
          searchTaskTargets {
            edges {
              node {
                id
                createdAt
                updatedAt
                deletedAt
                taskId
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
        const data = res.body.data.searchTaskTargets;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchTaskTargets = edges[0].node;

          expect(searchTaskTargets).toHaveProperty('id');
          expect(searchTaskTargets).toHaveProperty('createdAt');
          expect(searchTaskTargets).toHaveProperty('updatedAt');
          expect(searchTaskTargets).toHaveProperty('deletedAt');
          expect(searchTaskTargets).toHaveProperty('taskId');
          expect(searchTaskTargets).toHaveProperty('personId');
          expect(searchTaskTargets).toHaveProperty('companyId');
          expect(searchTaskTargets).toHaveProperty('opportunityId');
          expect(searchTaskTargets).toHaveProperty('rocketId');
        }
      });
  });
});
