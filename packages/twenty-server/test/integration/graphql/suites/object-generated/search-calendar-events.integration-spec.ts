import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchCalendarEventsResolver (e2e)', () => {
  it('should find many searchCalendarEvents', () => {
    const queryData = {
      query: `
        query searchCalendarEvents {
          searchCalendarEvents {
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
        const data = res.body.data.searchCalendarEvents;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchCalendarEvents = edges[0].node;

          expect(searchCalendarEvents).toHaveProperty('title');
          expect(searchCalendarEvents).toHaveProperty('isCanceled');
          expect(searchCalendarEvents).toHaveProperty('isFullDay');
          expect(searchCalendarEvents).toHaveProperty('startsAt');
          expect(searchCalendarEvents).toHaveProperty('endsAt');
          expect(searchCalendarEvents).toHaveProperty('externalCreatedAt');
          expect(searchCalendarEvents).toHaveProperty('externalUpdatedAt');
          expect(searchCalendarEvents).toHaveProperty('description');
          expect(searchCalendarEvents).toHaveProperty('location');
          expect(searchCalendarEvents).toHaveProperty('iCalUID');
          expect(searchCalendarEvents).toHaveProperty('conferenceSolution');
          expect(searchCalendarEvents).toHaveProperty('id');
          expect(searchCalendarEvents).toHaveProperty('createdAt');
          expect(searchCalendarEvents).toHaveProperty('updatedAt');
          expect(searchCalendarEvents).toHaveProperty('deletedAt');
        }
      });
  });
});
