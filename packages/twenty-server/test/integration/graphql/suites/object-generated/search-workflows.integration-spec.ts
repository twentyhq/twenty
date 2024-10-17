import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchWorkflowsResolver (e2e)', () => {
  it('should find many searchWorkflows', () => {
    const queryData = {
      query: `
        query searchWorkflows {
          searchWorkflows {
            edges {
              node {
                name
                lastPublishedVersionId
                statuses
                position
                id
                createdAt
                updatedAt
                deletedAt
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
        const data = res.body.data.searchWorkflows;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchWorkflows = edges[0].node;

          expect(searchWorkflows).toHaveProperty('name');
          expect(searchWorkflows).toHaveProperty('lastPublishedVersionId');
          expect(searchWorkflows).toHaveProperty('statuses');
          expect(searchWorkflows).toHaveProperty('position');
          expect(searchWorkflows).toHaveProperty('id');
          expect(searchWorkflows).toHaveProperty('createdAt');
          expect(searchWorkflows).toHaveProperty('updatedAt');
          expect(searchWorkflows).toHaveProperty('deletedAt');
        }
      });
  });
});
