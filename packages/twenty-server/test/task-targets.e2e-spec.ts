import request from 'supertest';

describe('taskTargetsResolver (e2e)', () => {
  it('should find many taskTargets', () => {
    const queryData = {
      query: `
        query taskTargets {
          taskTargets {
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
              }
            }
          }
        }
      `,
    };

    return request(global.app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${global.accessToken}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.taskTargets;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const tasktargets = edges[0].node;

          expect(tasktargets).toHaveProperty('id');
          expect(tasktargets).toHaveProperty('createdAt');
          expect(tasktargets).toHaveProperty('updatedAt');
          expect(tasktargets).toHaveProperty('deletedAt');
          expect(tasktargets).toHaveProperty('taskId');
          expect(tasktargets).toHaveProperty('personId');
          expect(tasktargets).toHaveProperty('companyId');
          expect(tasktargets).toHaveProperty('opportunityId');
        }
      });
  });
});
