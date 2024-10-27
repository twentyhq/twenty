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
                role
                handle
                displayName
                id
                createdAt
                updatedAt
                deletedAt
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
          const messageParticipants = edges[0].node;

          expect(messageParticipants).toHaveProperty('role');
          expect(messageParticipants).toHaveProperty('handle');
          expect(messageParticipants).toHaveProperty('displayName');
          expect(messageParticipants).toHaveProperty('id');
          expect(messageParticipants).toHaveProperty('createdAt');
          expect(messageParticipants).toHaveProperty('updatedAt');
          expect(messageParticipants).toHaveProperty('deletedAt');
          expect(messageParticipants).toHaveProperty('messageId');
          expect(messageParticipants).toHaveProperty('personId');
          expect(messageParticipants).toHaveProperty('workspaceMemberId');
        }
      });
  });
});
