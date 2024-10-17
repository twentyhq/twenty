import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchCalendarChannelsResolver (e2e)', () => {
  it('should find many searchCalendarChannels', () => {
    const queryData = {
      query: `
        query searchCalendarChannels {
          searchCalendarChannels {
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
        const data = res.body.data.searchCalendarChannels;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchCalendarChannels = edges[0].node;

          expect(searchCalendarChannels).toHaveProperty('handle');
          expect(searchCalendarChannels).toHaveProperty('syncStatus');
          expect(searchCalendarChannels).toHaveProperty('syncStage');
          expect(searchCalendarChannels).toHaveProperty('visibility');
          expect(searchCalendarChannels).toHaveProperty(
            'isContactAutoCreationEnabled',
          );
          expect(searchCalendarChannels).toHaveProperty(
            'contactAutoCreationPolicy',
          );
          expect(searchCalendarChannels).toHaveProperty('isSyncEnabled');
          expect(searchCalendarChannels).toHaveProperty('syncCursor');
          expect(searchCalendarChannels).toHaveProperty('syncedAt');
          expect(searchCalendarChannels).toHaveProperty('syncStageStartedAt');
          expect(searchCalendarChannels).toHaveProperty('throttleFailureCount');
          expect(searchCalendarChannels).toHaveProperty('id');
          expect(searchCalendarChannels).toHaveProperty('createdAt');
          expect(searchCalendarChannels).toHaveProperty('updatedAt');
          expect(searchCalendarChannels).toHaveProperty('deletedAt');
          expect(searchCalendarChannels).toHaveProperty('connectedAccountId');
        }
      });
  });
});
