import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchActivitiesResolver (e2e)', () => {
  it('should find many searchActivities', () => {
    const queryData = {
      query: `
        query searchActivities {
          searchActivities {
            edges {
              node {
                title
                body
                type
                reminderAt
                dueAt
                completedAt
                id
                createdAt
                updatedAt
                deletedAt
                authorId
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
        const data = res.body.data.searchActivities;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchActivities = edges[0].node;

          expect(searchActivities).toHaveProperty('title');
          expect(searchActivities).toHaveProperty('body');
          expect(searchActivities).toHaveProperty('type');
          expect(searchActivities).toHaveProperty('reminderAt');
          expect(searchActivities).toHaveProperty('dueAt');
          expect(searchActivities).toHaveProperty('completedAt');
          expect(searchActivities).toHaveProperty('id');
          expect(searchActivities).toHaveProperty('createdAt');
          expect(searchActivities).toHaveProperty('updatedAt');
          expect(searchActivities).toHaveProperty('deletedAt');
          expect(searchActivities).toHaveProperty('authorId');
          expect(searchActivities).toHaveProperty('assigneeId');
        }
      });
  });
});
