import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('workspaceMembersResolver (e2e)', () => {
  it('should find many workspaceMembers', () => {
    const queryData = {
      query: `
        query workspaceMembers {
          workspaceMembers {
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
        const data = res.body.data.workspaceMembers;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const workspaceMembers = edges[0].node;

          expect(workspaceMembers).toHaveProperty('id');
          expect(workspaceMembers).toHaveProperty('colorScheme');
          expect(workspaceMembers).toHaveProperty('avatarUrl');
          expect(workspaceMembers).toHaveProperty('locale');
          expect(workspaceMembers).toHaveProperty('timeZone');
          expect(workspaceMembers).toHaveProperty('dateFormat');
          expect(workspaceMembers).toHaveProperty('timeFormat');
          expect(workspaceMembers).toHaveProperty('userEmail');
          expect(workspaceMembers).toHaveProperty('userId');
          expect(workspaceMembers).toHaveProperty('createdAt');
          expect(workspaceMembers).toHaveProperty('updatedAt');
          expect(workspaceMembers).toHaveProperty('deletedAt');
        }
      });
  });
});
