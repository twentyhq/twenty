import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchFavoritesResolver (e2e)', () => {
  it('should find many searchFavorites', () => {
    const queryData = {
      query: `
        query searchFavorites {
          searchFavorites {
            edges {
              node {
                position
                id
                createdAt
                updatedAt
                deletedAt
                workspaceMemberId
                personId
                companyId
                opportunityId
                workflowId
                workflowVersionId
                workflowRunId
                taskId
                noteId
                viewId
                rocketId
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
        const data = res.body.data.searchFavorites;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchFavorites = edges[0].node;

          expect(searchFavorites).toHaveProperty('position');
          expect(searchFavorites).toHaveProperty('id');
          expect(searchFavorites).toHaveProperty('createdAt');
          expect(searchFavorites).toHaveProperty('updatedAt');
          expect(searchFavorites).toHaveProperty('deletedAt');
          expect(searchFavorites).toHaveProperty('workspaceMemberId');
          expect(searchFavorites).toHaveProperty('personId');
          expect(searchFavorites).toHaveProperty('companyId');
          expect(searchFavorites).toHaveProperty('opportunityId');
          expect(searchFavorites).toHaveProperty('workflowId');
          expect(searchFavorites).toHaveProperty('workflowVersionId');
          expect(searchFavorites).toHaveProperty('workflowRunId');
          expect(searchFavorites).toHaveProperty('taskId');
          expect(searchFavorites).toHaveProperty('noteId');
          expect(searchFavorites).toHaveProperty('viewId');
          expect(searchFavorites).toHaveProperty('rocketId');
        }
      });
  });
});
