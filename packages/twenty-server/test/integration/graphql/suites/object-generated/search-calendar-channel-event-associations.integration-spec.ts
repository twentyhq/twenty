import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchCalendarChannelEventAssociationsResolver (e2e)', () => {
  it('should find many searchCalendarChannelEventAssociations', () => {
    const queryData = {
      query: `
        query searchCalendarChannelEventAssociations {
          searchCalendarChannelEventAssociations {
            edges {
              node {
                eventExternalId
                recurringEventExternalId
                id
                createdAt
                updatedAt
                deletedAt
                calendarChannelId
                calendarEventId
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
        const data = res.body.data.searchCalendarChannelEventAssociations;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchCalendarChannelEventAssociations = edges[0].node;

          expect(searchCalendarChannelEventAssociations).toHaveProperty(
            'eventExternalId',
          );
          expect(searchCalendarChannelEventAssociations).toHaveProperty(
            'recurringEventExternalId',
          );
          expect(searchCalendarChannelEventAssociations).toHaveProperty('id');
          expect(searchCalendarChannelEventAssociations).toHaveProperty(
            'createdAt',
          );
          expect(searchCalendarChannelEventAssociations).toHaveProperty(
            'updatedAt',
          );
          expect(searchCalendarChannelEventAssociations).toHaveProperty(
            'deletedAt',
          );
          expect(searchCalendarChannelEventAssociations).toHaveProperty(
            'calendarChannelId',
          );
          expect(searchCalendarChannelEventAssociations).toHaveProperty(
            'calendarEventId',
          );
        }
      });
  });
});
