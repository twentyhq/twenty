import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchMessageParticipantsResolver (e2e)', () => {
  it('should find many searchMessageParticipants', () => {
    const queryData = {
      query: `
        query searchMessageParticipants {
          searchMessageParticipants {
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
        const data = res.body.data.searchMessageParticipants;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchMessageParticipants = edges[0].node;

          expect(searchMessageParticipants).toHaveProperty('role');
          expect(searchMessageParticipants).toHaveProperty('handle');
          expect(searchMessageParticipants).toHaveProperty('displayName');
          expect(searchMessageParticipants).toHaveProperty('id');
          expect(searchMessageParticipants).toHaveProperty('createdAt');
          expect(searchMessageParticipants).toHaveProperty('updatedAt');
          expect(searchMessageParticipants).toHaveProperty('deletedAt');
          expect(searchMessageParticipants).toHaveProperty('messageId');
          expect(searchMessageParticipants).toHaveProperty('personId');
          expect(searchMessageParticipants).toHaveProperty('workspaceMemberId');
        }
      });
  });
});
