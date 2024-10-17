import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

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
                id
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
        const data = res.body.data.calendarEvents;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const calendarEvents = edges[0].node;

          expect(calendarEvents).toHaveProperty('title');
          expect(calendarEvents).toHaveProperty('isCanceled');
          expect(calendarEvents).toHaveProperty('isFullDay');
          expect(calendarEvents).toHaveProperty('startsAt');
          expect(calendarEvents).toHaveProperty('endsAt');
          expect(calendarEvents).toHaveProperty('externalCreatedAt');
          expect(calendarEvents).toHaveProperty('externalUpdatedAt');
          expect(calendarEvents).toHaveProperty('description');
          expect(calendarEvents).toHaveProperty('location');
          expect(calendarEvents).toHaveProperty('iCalUID');
          expect(calendarEvents).toHaveProperty('conferenceSolution');
          expect(calendarEvents).toHaveProperty('id');
          expect(calendarEvents).toHaveProperty('createdAt');
          expect(calendarEvents).toHaveProperty('updatedAt');
          expect(calendarEvents).toHaveProperty('deletedAt');
        }
      });
  });
});
