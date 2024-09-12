import request from 'supertest';

describe('commentsResolver (e2e)', () => {
  it('should find many comments', () => {
    const queryData = {
      query: `
        query comments {
          comments {
            edges {
              node {
                body
                id
                createdAt
                updatedAt
                authorId
                activityId
              }
            }
          }
        }
      `,
    };

    return request(global.app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${global.accessToken}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.comments;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const comments = edges[0].node;

          expect(comments).toHaveProperty('body');
          expect(comments).toHaveProperty('id');
          expect(comments).toHaveProperty('createdAt');
          expect(comments).toHaveProperty('updatedAt');
          expect(comments).toHaveProperty('authorId');
          expect(comments).toHaveProperty('activityId');
        }
      });
  });
});
