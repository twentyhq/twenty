import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('activityTargetsResolver (e2e)', () => {
  it('should find many activityTargets', () => {
    const queryData = {
      query: `
        query activityTargets {
          activityTargets {
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
        const data = res.body.data.activityTargets;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const activityTargets = edges[0].node;

          expect(activityTargets).toHaveProperty('id');
          expect(activityTargets).toHaveProperty('createdAt');
          expect(activityTargets).toHaveProperty('updatedAt');
          expect(activityTargets).toHaveProperty('deletedAt');
          expect(activityTargets).toHaveProperty('activityId');
          expect(activityTargets).toHaveProperty('personId');
          expect(activityTargets).toHaveProperty('companyId');
          expect(activityTargets).toHaveProperty('opportunityId');
          expect(activityTargets).toHaveProperty('rocketId');
        }
      });
  });
});
