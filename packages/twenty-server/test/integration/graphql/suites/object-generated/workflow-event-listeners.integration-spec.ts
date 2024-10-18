import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('workflowEventListenersResolver (e2e)', () => {
  it('should find many workflowEventListeners', () => {
    const queryData = {
      query: `
        query workflowEventListeners {
          workflowEventListeners {
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
        const data = res.body.data.workflowEventListeners;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const workflowEventListeners = edges[0].node;

          expect(workflowEventListeners).toHaveProperty('eventName');
          expect(workflowEventListeners).toHaveProperty('id');
          expect(workflowEventListeners).toHaveProperty('createdAt');
          expect(workflowEventListeners).toHaveProperty('updatedAt');
          expect(workflowEventListeners).toHaveProperty('deletedAt');
          expect(workflowEventListeners).toHaveProperty('workflowId');
        }
      });
  });
});
