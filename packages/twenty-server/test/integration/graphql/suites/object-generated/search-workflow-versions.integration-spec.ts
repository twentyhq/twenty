import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchWorkflowVersionsResolver (e2e)', () => {
  it('should find many searchWorkflowVersions', () => {
    const queryData = {
      query: `
        query searchWorkflowVersions {
          searchWorkflowVersions {
            edges {
              node {
                name
                trigger
                steps
                status
                position
                id
                createdAt
                updatedAt
                deletedAt
                workflowId
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
        const data = res.body.data.searchWorkflowVersions;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchWorkflowVersions = edges[0].node;

          expect(searchWorkflowVersions).toHaveProperty('name');
          expect(searchWorkflowVersions).toHaveProperty('trigger');
          expect(searchWorkflowVersions).toHaveProperty('steps');
          expect(searchWorkflowVersions).toHaveProperty('status');
          expect(searchWorkflowVersions).toHaveProperty('position');
          expect(searchWorkflowVersions).toHaveProperty('id');
          expect(searchWorkflowVersions).toHaveProperty('createdAt');
          expect(searchWorkflowVersions).toHaveProperty('updatedAt');
          expect(searchWorkflowVersions).toHaveProperty('deletedAt');
          expect(searchWorkflowVersions).toHaveProperty('workflowId');
        }
      });
  });
});
