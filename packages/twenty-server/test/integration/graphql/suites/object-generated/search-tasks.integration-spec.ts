import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchTasksResolver (e2e)', () => {
  it('should find many searchTasks', () => {
    const queryData = {
      query: `
        query searchTasks {
          searchTasks {
            edges {
              node {
                position
                title
                body
                dueAt
                status
                id
                createdAt
                updatedAt
                deletedAt
                assigneeId
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
        const data = res.body.data.searchTasks;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchTasks = edges[0].node;

          expect(searchTasks).toHaveProperty('position');
          expect(searchTasks).toHaveProperty('title');
          expect(searchTasks).toHaveProperty('body');
          expect(searchTasks).toHaveProperty('dueAt');
          expect(searchTasks).toHaveProperty('status');
          expect(searchTasks).toHaveProperty('id');
          expect(searchTasks).toHaveProperty('createdAt');
          expect(searchTasks).toHaveProperty('updatedAt');
          expect(searchTasks).toHaveProperty('deletedAt');
          expect(searchTasks).toHaveProperty('assigneeId');
        }
      });
  });
});
