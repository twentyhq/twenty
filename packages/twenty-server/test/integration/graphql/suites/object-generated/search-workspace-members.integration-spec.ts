import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchWorkspaceMembersResolver (e2e)', () => {
  it('should find many searchWorkspaceMembers', () => {
    const queryData = {
      query: `
        query searchWorkspaceMembers {
          searchWorkspaceMembers {
            edges {
              node {
                id
                colorScheme
                avatarUrl
                locale
                timeZone
                dateFormat
                timeFormat
                userEmail
                userId
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
        const data = res.body.data.searchWorkspaceMembers;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchWorkspaceMembers = edges[0].node;

          expect(searchWorkspaceMembers).toHaveProperty('id');
          expect(searchWorkspaceMembers).toHaveProperty('colorScheme');
          expect(searchWorkspaceMembers).toHaveProperty('avatarUrl');
          expect(searchWorkspaceMembers).toHaveProperty('locale');
          expect(searchWorkspaceMembers).toHaveProperty('timeZone');
          expect(searchWorkspaceMembers).toHaveProperty('dateFormat');
          expect(searchWorkspaceMembers).toHaveProperty('timeFormat');
          expect(searchWorkspaceMembers).toHaveProperty('userEmail');
          expect(searchWorkspaceMembers).toHaveProperty('userId');
          expect(searchWorkspaceMembers).toHaveProperty('createdAt');
          expect(searchWorkspaceMembers).toHaveProperty('updatedAt');
          expect(searchWorkspaceMembers).toHaveProperty('deletedAt');
        }
      });
  });
});
