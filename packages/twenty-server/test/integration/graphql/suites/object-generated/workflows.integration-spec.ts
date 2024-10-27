import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('workflowsResolver (e2e)', () => {
  it('should find many workflows', () => {
    const queryData = {
      query: `
        query workflows {
          workflows {
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
        const data = res.body.data.workflows;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const workflows = edges[0].node;

          expect(workflows).toHaveProperty('name');
          expect(workflows).toHaveProperty('lastPublishedVersionId');
          expect(workflows).toHaveProperty('statuses');
          expect(workflows).toHaveProperty('position');
          expect(workflows).toHaveProperty('id');
          expect(workflows).toHaveProperty('createdAt');
          expect(workflows).toHaveProperty('updatedAt');
          expect(workflows).toHaveProperty('deletedAt');
        }
      });
  });
});
