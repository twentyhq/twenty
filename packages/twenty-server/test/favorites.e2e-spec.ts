import request from 'supertest';

describe('favoritesResolver (e2e)', () => {
  it('should find many favorites', () => {
    const queryData = {
      query: `
        query favorites {
          favorites {
            edges {
              node {
                position
                id
                createdAt
                updatedAt
                workspaceMemberId
                personId
                companyId
                opportunityId
                taskId
                noteId
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
        const data = res.body.data.favorites;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const favorites = edges[0].node;

          expect(favorites).toHaveProperty('position');
          expect(favorites).toHaveProperty('id');
          expect(favorites).toHaveProperty('createdAt');
          expect(favorites).toHaveProperty('updatedAt');
          expect(favorites).toHaveProperty('workspaceMemberId');
          expect(favorites).toHaveProperty('personId');
          expect(favorites).toHaveProperty('companyId');
          expect(favorites).toHaveProperty('opportunityId');
          expect(favorites).toHaveProperty('taskId');
          expect(favorites).toHaveProperty('noteId');
        }
      });
  });
});
