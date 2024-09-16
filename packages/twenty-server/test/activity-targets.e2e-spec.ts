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
                activityId
                personId
                companyId
                opportunityId
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
          const activitytargets = edges[0].node;

          expect(activitytargets).toHaveProperty('id');
          expect(activitytargets).toHaveProperty('createdAt');
          expect(activitytargets).toHaveProperty('updatedAt');
          expect(activitytargets).toHaveProperty('activityId');
          expect(activitytargets).toHaveProperty('personId');
          expect(activitytargets).toHaveProperty('companyId');
          expect(activitytargets).toHaveProperty('opportunityId');
        }
      });
  });
});
