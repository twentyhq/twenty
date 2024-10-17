import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchWorkflowRunsResolver (e2e)', () => {
  it('should find many searchWorkflowRuns', () => {
    const queryData = {
      query: `
        query searchWorkflowRuns {
          searchWorkflowRuns {
            edges {
              node {
                workflowRunId
                name
                startedAt
                endedAt
                status
                output
                position
                id
                createdAt
                updatedAt
                deletedAt
                workflowVersionId
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
        const data = res.body.data.searchWorkflowRuns;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchWorkflowRuns = edges[0].node;

          expect(searchWorkflowRuns).toHaveProperty('workflowRunId');
          expect(searchWorkflowRuns).toHaveProperty('name');
          expect(searchWorkflowRuns).toHaveProperty('startedAt');
          expect(searchWorkflowRuns).toHaveProperty('endedAt');
          expect(searchWorkflowRuns).toHaveProperty('status');
          expect(searchWorkflowRuns).toHaveProperty('output');
          expect(searchWorkflowRuns).toHaveProperty('position');
          expect(searchWorkflowRuns).toHaveProperty('id');
          expect(searchWorkflowRuns).toHaveProperty('createdAt');
          expect(searchWorkflowRuns).toHaveProperty('updatedAt');
          expect(searchWorkflowRuns).toHaveProperty('deletedAt');
          expect(searchWorkflowRuns).toHaveProperty('workflowVersionId');
          expect(searchWorkflowRuns).toHaveProperty('workflowId');
        }
      });
  });
});
