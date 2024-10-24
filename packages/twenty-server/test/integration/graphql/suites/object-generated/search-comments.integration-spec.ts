import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchCommentsResolver (e2e)', () => {
  it('should find many searchComments', () => {
    const queryData = {
      query: `
        query searchComments {
          searchComments {
            edges {
              node {
                body
                id
                createdAt
                updatedAt
                deletedAt
                authorId
                activityId
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
        const data = res.body.data.searchComments;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchComments = edges[0].node;

          expect(searchComments).toHaveProperty('body');
          expect(searchComments).toHaveProperty('id');
          expect(searchComments).toHaveProperty('createdAt');
          expect(searchComments).toHaveProperty('updatedAt');
          expect(searchComments).toHaveProperty('deletedAt');
          expect(searchComments).toHaveProperty('authorId');
          expect(searchComments).toHaveProperty('activityId');
        }
      });
  });
});
