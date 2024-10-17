import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchCalendarEventParticipantsResolver (e2e)', () => {
  it('should find many searchCalendarEventParticipants', () => {
    const queryData = {
      query: `
        query searchCalendarEventParticipants {
          searchCalendarEventParticipants {
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
        const data = res.body.data.searchCalendarEventParticipants;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchCalendarEventParticipants = edges[0].node;

          expect(searchCalendarEventParticipants).toHaveProperty('handle');
          expect(searchCalendarEventParticipants).toHaveProperty('displayName');
          expect(searchCalendarEventParticipants).toHaveProperty('isOrganizer');
          expect(searchCalendarEventParticipants).toHaveProperty(
            'responseStatus',
          );
          expect(searchCalendarEventParticipants).toHaveProperty('id');
          expect(searchCalendarEventParticipants).toHaveProperty('createdAt');
          expect(searchCalendarEventParticipants).toHaveProperty('updatedAt');
          expect(searchCalendarEventParticipants).toHaveProperty('deletedAt');
          expect(searchCalendarEventParticipants).toHaveProperty(
            'calendarEventId',
          );
          expect(searchCalendarEventParticipants).toHaveProperty('personId');
          expect(searchCalendarEventParticipants).toHaveProperty(
            'workspaceMemberId',
          );
        }
      });
  });
});
