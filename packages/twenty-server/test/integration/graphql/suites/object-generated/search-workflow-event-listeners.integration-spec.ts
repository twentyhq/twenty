import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchWorkflowEventListenersResolver (e2e)', () => {
  it('should find many searchWorkflowEventListeners', () => {
    const queryData = {
      query: `
        query searchWorkflowEventListeners {
          searchWorkflowEventListeners {
            edges {
              node {
                eventName
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
        const data = res.body.data.searchWorkflowEventListeners;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchWorkflowEventListeners = edges[0].node;

          expect(searchWorkflowEventListeners).toHaveProperty('eventName');
          expect(searchWorkflowEventListeners).toHaveProperty('id');
          expect(searchWorkflowEventListeners).toHaveProperty('createdAt');
          expect(searchWorkflowEventListeners).toHaveProperty('updatedAt');
          expect(searchWorkflowEventListeners).toHaveProperty('deletedAt');
          expect(searchWorkflowEventListeners).toHaveProperty('workflowId');
        }
      });
  });
});
