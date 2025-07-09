import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

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
                deletedAt
                forWorkspaceMemberId
                personId
                companyId
                opportunityId
                workflowId
                workflowVersionId
                workflowRunId
                taskId
                noteId
                viewId
                petId
                surveyResultId
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
          expect(favorites).toHaveProperty('deletedAt');
          expect(favorites).toHaveProperty('forWorkspaceMemberId');
          expect(favorites).toHaveProperty('personId');
          expect(favorites).toHaveProperty('companyId');
          expect(favorites).toHaveProperty('opportunityId');
          expect(favorites).toHaveProperty('workflowId');
          expect(favorites).toHaveProperty('workflowVersionId');
          expect(favorites).toHaveProperty('workflowRunId');
          expect(favorites).toHaveProperty('taskId');
          expect(favorites).toHaveProperty('noteId');
          expect(favorites).toHaveProperty('viewId');
          expect(favorites).toHaveProperty('petId');
          expect(favorites).toHaveProperty('surveyResultId');
        }
      });
  });
});
