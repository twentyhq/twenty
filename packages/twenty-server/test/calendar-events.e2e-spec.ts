import request from 'supertest';

describe('calendarEventsResolver (e2e)', () => {
  it('should find many calendarEvents', () => {
    const queryData = {
      query: `
        query calendarEvents {
          calendarEvents {
            edges {
              node {
                title
                isCanceled
                isFullDay
                startsAt
                endsAt
                externalCreatedAt
                externalUpdatedAt
                description
                location
                iCalUID
                conferenceSolution
                recurringEventExternalId
                id
                createdAt
                updatedAt
              }
            }
          }
        }
      `,
    };

    return request(global.app.getHttpServer())
      .post('/graphql')
      .set('Authorization', `Bearer ${global.accessToken}`)
      .send(queryData)
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.calendarEvents;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const calendarevents = edges[0].node;

          expect(calendarevents).toHaveProperty('title');
          expect(calendarevents).toHaveProperty('isCanceled');
          expect(calendarevents).toHaveProperty('isFullDay');
          expect(calendarevents).toHaveProperty('startsAt');
          expect(calendarevents).toHaveProperty('endsAt');
          expect(calendarevents).toHaveProperty('externalCreatedAt');
          expect(calendarevents).toHaveProperty('externalUpdatedAt');
          expect(calendarevents).toHaveProperty('description');
          expect(calendarevents).toHaveProperty('location');
          expect(calendarevents).toHaveProperty('iCalUID');
          expect(calendarevents).toHaveProperty('conferenceSolution');
          expect(calendarevents).toHaveProperty('recurringEventExternalId');
          expect(calendarevents).toHaveProperty('id');
          expect(calendarevents).toHaveProperty('createdAt');
          expect(calendarevents).toHaveProperty('updatedAt');
        }
      });
  });
});
