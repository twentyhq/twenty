import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('workflowRunsResolver (e2e)', () => {
  it('should find many workflowRuns', () => {
    const queryData = {
      query: `
        query workflowRuns {
          workflowRuns {
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
        const data = res.body.data.workflowRuns;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const workflowRuns = edges[0].node;

          expect(workflowRuns).toHaveProperty('workflowRunId');
          expect(workflowRuns).toHaveProperty('name');
          expect(workflowRuns).toHaveProperty('startedAt');
          expect(workflowRuns).toHaveProperty('endedAt');
          expect(workflowRuns).toHaveProperty('status');
          expect(workflowRuns).toHaveProperty('output');
          expect(workflowRuns).toHaveProperty('position');
          expect(workflowRuns).toHaveProperty('id');
          expect(workflowRuns).toHaveProperty('createdAt');
          expect(workflowRuns).toHaveProperty('updatedAt');
          expect(workflowRuns).toHaveProperty('deletedAt');
          expect(workflowRuns).toHaveProperty('workflowVersionId');
          expect(workflowRuns).toHaveProperty('workflowId');
        }
      });
  });
});
