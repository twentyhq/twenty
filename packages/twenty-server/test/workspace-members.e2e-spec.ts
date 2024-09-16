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
          const workspacemembers = edges[0].node;

          expect(workspacemembers).toHaveProperty('id');
          expect(workspacemembers).toHaveProperty('colorScheme');
          expect(workspacemembers).toHaveProperty('avatarUrl');
          expect(workspacemembers).toHaveProperty('locale');
          expect(workspacemembers).toHaveProperty('timeZone');
          expect(workspacemembers).toHaveProperty('dateFormat');
          expect(workspacemembers).toHaveProperty('timeFormat');
          expect(workspacemembers).toHaveProperty('userEmail');
          expect(workspacemembers).toHaveProperty('userId');
          expect(workspacemembers).toHaveProperty('createdAt');
          expect(workspacemembers).toHaveProperty('updatedAt');
        }
      });
  });
});
