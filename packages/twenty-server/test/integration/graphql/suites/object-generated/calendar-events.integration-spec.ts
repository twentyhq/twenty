import request from 'supertest';

import { DEV_SEED_CALENDAR_EVENT_IDS } from 'src/database/typeorm-seeds/workspace/calendar-events';

const client = request(`http://localhost:${APP_PORT}`);

describe('calendarEventsResolver (e2e)', () => {
  it('should find many calendarEvents', async () => {
    const queryData = {
      query: `
        query calendarEvents {
          calendarEvents {
            edges {
              node {
                id
                title
                description
                endsAt
                startsAt
                createdAt
                updatedAt
                deletedAt
              }
            }
          }
        }
      `,
    };

    return await client
      .post('/graphql')
      .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
      .send(queryData)
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

          expect(calendarEvents).toHaveProperty('id');
          expect(calendarEvents).toHaveProperty('title');
          expect(calendarEvents).toHaveProperty('description');
          expect(calendarEvents).toHaveProperty('endsAt');
          expect(calendarEvents).toHaveProperty('startsAt');
          expect(calendarEvents).toHaveProperty('createdAt');
          expect(calendarEvents).toHaveProperty('updatedAt');
          expect(calendarEvents).toHaveProperty('deletedAt');
        }
      });
  });

  it('should find one calendarEvent', async () => {
    const queryData = {
      query: `
        query calendarEvent($id: ID!) {
          calendarEvent(filter: { id: { eq: $id } }) {
                id
                title
                description
                endsAt
                startsAt
                createdAt
                updatedAt
                deletedAt
            }
        }
      `,
      variables: {
        id: DEV_SEED_CALENDAR_EVENT_IDS.CALENDAR_EVENT_1,
      },
    };

    return await client
      .post('/graphql')
      .set('Authorization', `Bearer ${ADMIN_ACCESS_TOKEN}`)
      .send(queryData)
      .expect((res) => {
        expect(res.body.data).toBeDefined();
        expect(res.body.errors).toBeUndefined();
      })
      .expect((res) => {
        const data = res.body.data.calendarEvent;

        expect(data).toBeDefined();

        expect(data).toHaveProperty('id');
        expect(data.id).toBe(DEV_SEED_CALENDAR_EVENT_IDS.CALENDAR_EVENT_1);
        expect(data).toHaveProperty('title');
        expect(data).toHaveProperty('description');
        expect(data).toHaveProperty('endsAt');
        expect(data).toHaveProperty('startsAt');
        expect(data).toHaveProperty('createdAt');
        expect(data).toHaveProperty('updatedAt');
        expect(data).toHaveProperty('deletedAt');
      });
  });
});
