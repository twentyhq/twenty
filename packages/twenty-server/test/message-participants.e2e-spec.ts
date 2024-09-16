import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('messageParticipantsResolver (e2e)', () => {
  it('should find many messageParticipants', () => {
    const queryData = {
      query: `
        query messageParticipants {
          messageParticipants {
            edges {
              node {
                displayName
                role
                handle
                id
                createdAt
                updatedAt
                messageId
                personId
                workspaceMemberId
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
        const data = res.body.data.messageParticipants;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const messageparticipants = edges[0].node;

          expect(messageparticipants).toHaveProperty('displayName');
          expect(messageparticipants).toHaveProperty('role');
          expect(messageparticipants).toHaveProperty('handle');
          expect(messageparticipants).toHaveProperty('id');
          expect(messageparticipants).toHaveProperty('createdAt');
          expect(messageparticipants).toHaveProperty('updatedAt');
          expect(messageparticipants).toHaveProperty('messageId');
          expect(messageparticipants).toHaveProperty('personId');
          expect(messageparticipants).toHaveProperty('workspaceMemberId');
        }
      });
  });
});
