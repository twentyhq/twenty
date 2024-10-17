import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('calendarChannelEventAssociationsResolver (e2e)', () => {
  it('should find many calendarChannelEventAssociations', () => {
    const queryData = {
      query: `
        query calendarChannelEventAssociations {
          calendarChannelEventAssociations {
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
        const data = res.body.data.calendarChannelEventAssociations;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const calendarChannelEventAssociations = edges[0].node;

          expect(calendarChannelEventAssociations).toHaveProperty(
            'eventExternalId',
          );
          expect(calendarChannelEventAssociations).toHaveProperty(
            'recurringEventExternalId',
          );
          expect(calendarChannelEventAssociations).toHaveProperty('id');
          expect(calendarChannelEventAssociations).toHaveProperty('createdAt');
          expect(calendarChannelEventAssociations).toHaveProperty('updatedAt');
          expect(calendarChannelEventAssociations).toHaveProperty('deletedAt');
          expect(calendarChannelEventAssociations).toHaveProperty(
            'calendarChannelId',
          );
          expect(calendarChannelEventAssociations).toHaveProperty(
            'calendarEventId',
          );
        }
      });
  });
});
