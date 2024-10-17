import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('calendarChannelsResolver (e2e)', () => {
  it('should find many calendarChannels', () => {
    const queryData = {
      query: `
        query calendarChannels {
          calendarChannels {
            edges {
              node {
                handle
                syncStatus
                syncStage
                visibility
                isContactAutoCreationEnabled
                contactAutoCreationPolicy
                isSyncEnabled
                syncCursor
                syncedAt
                syncStageStartedAt
                throttleFailureCount
                id
                createdAt
                updatedAt
                deletedAt
                connectedAccountId
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
        const data = res.body.data.calendarChannels;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const calendarChannels = edges[0].node;

          expect(calendarChannels).toHaveProperty('handle');
          expect(calendarChannels).toHaveProperty('syncStatus');
          expect(calendarChannels).toHaveProperty('syncStage');
          expect(calendarChannels).toHaveProperty('visibility');
          expect(calendarChannels).toHaveProperty(
            'isContactAutoCreationEnabled',
          );
          expect(calendarChannels).toHaveProperty('contactAutoCreationPolicy');
          expect(calendarChannels).toHaveProperty('isSyncEnabled');
          expect(calendarChannels).toHaveProperty('syncCursor');
          expect(calendarChannels).toHaveProperty('syncedAt');
          expect(calendarChannels).toHaveProperty('syncStageStartedAt');
          expect(calendarChannels).toHaveProperty('throttleFailureCount');
          expect(calendarChannels).toHaveProperty('id');
          expect(calendarChannels).toHaveProperty('createdAt');
          expect(calendarChannels).toHaveProperty('updatedAt');
          expect(calendarChannels).toHaveProperty('deletedAt');
          expect(calendarChannels).toHaveProperty('connectedAccountId');
        }
      });
  });
});
