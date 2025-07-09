import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('workflowVersionsResolver (e2e)', () => {
  it('should find many workflowVersions', () => {
    const queryData = {
      query: `
        query workflowVersions {
          workflowVersions {
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
      .set('Authorization', `Bearer ${APPLE_JANE_ADMIN_ACCESS_TOKEN}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.workflowVersions;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const workflowVersions = edges[0].node;

          expect(workflowVersions).toHaveProperty('name');
          expect(workflowVersions).toHaveProperty('trigger');
          expect(workflowVersions).toHaveProperty('steps');
          expect(workflowVersions).toHaveProperty('status');
          expect(workflowVersions).toHaveProperty('position');
          expect(workflowVersions).toHaveProperty('id');
          expect(workflowVersions).toHaveProperty('createdAt');
          expect(workflowVersions).toHaveProperty('updatedAt');
          expect(workflowVersions).toHaveProperty('deletedAt');
          expect(workflowVersions).toHaveProperty('workflowId');
        }
      });
  });
});
