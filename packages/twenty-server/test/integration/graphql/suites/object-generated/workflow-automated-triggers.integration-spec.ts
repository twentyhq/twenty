import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('workflowAutomatedTriggersResolver (e2e)', () => {
  it('should find many workflowAutomatedTriggers', () => {
    const queryData = {
      query: `
        query workflowAutomatedTriggers {
          workflowAutomatedTriggers {
            edges {
              node {
                id
                type
                settings
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
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.workflowAutomatedTriggers;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const workflowAutomatedTriggers = edges[0].node;

          expect(workflowAutomatedTriggers).toHaveProperty('id');
          expect(workflowAutomatedTriggers).toHaveProperty('type');
          expect(workflowAutomatedTriggers).toHaveProperty('settings');
          expect(workflowAutomatedTriggers).toHaveProperty('createdAt');
          expect(workflowAutomatedTriggers).toHaveProperty('updatedAt');
          expect(workflowAutomatedTriggers).toHaveProperty('deletedAt');
          expect(workflowAutomatedTriggers).toHaveProperty('workflowId');
        }
      });
  });
});
