import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('calendarEventParticipantsResolver (e2e)', () => {
  it('should find many calendarEventParticipants', () => {
    const queryData = {
      query: `
        query calendarEventParticipants {
          calendarEventParticipants {
            edges {
              node {
                handle
                displayName
                isOrganizer
                responseStatus
                id
                createdAt
                updatedAt
                deletedAt
                calendarEventId
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
        const data = res.body.data.calendarEventParticipants;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const calendarEventParticipants = edges[0].node;

          expect(calendarEventParticipants).toHaveProperty('handle');
          expect(calendarEventParticipants).toHaveProperty('displayName');
          expect(calendarEventParticipants).toHaveProperty('isOrganizer');
          expect(calendarEventParticipants).toHaveProperty('responseStatus');
          expect(calendarEventParticipants).toHaveProperty('id');
          expect(calendarEventParticipants).toHaveProperty('createdAt');
          expect(calendarEventParticipants).toHaveProperty('updatedAt');
          expect(calendarEventParticipants).toHaveProperty('deletedAt');
          expect(calendarEventParticipants).toHaveProperty('calendarEventId');
          expect(calendarEventParticipants).toHaveProperty('personId');
          expect(calendarEventParticipants).toHaveProperty('workspaceMemberId');
        }
      });
  });
});
