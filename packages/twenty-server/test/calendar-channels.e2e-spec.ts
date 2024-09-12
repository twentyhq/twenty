import request from 'supertest';

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
                syncStageStartedAt
                throttleFailureCount
                id
                createdAt
                updatedAt
                connectedAccountId
              }
            }
          }
        }
      `,
    };

    console.log('toto');
    console.log(global);

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
        const data = res.body.data.calendarChannels;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const calendarchannels = edges[0].node;

          expect(calendarchannels).toHaveProperty('handle');
          expect(calendarchannels).toHaveProperty('syncStatus');
          expect(calendarchannels).toHaveProperty('syncStage');
          expect(calendarchannels).toHaveProperty('visibility');
          expect(calendarchannels).toHaveProperty(
            'isContactAutoCreationEnabled',
          );
          expect(calendarchannels).toHaveProperty('contactAutoCreationPolicy');
          expect(calendarchannels).toHaveProperty('isSyncEnabled');
          expect(calendarchannels).toHaveProperty('syncCursor');
          expect(calendarchannels).toHaveProperty('syncStageStartedAt');
          expect(calendarchannels).toHaveProperty('throttleFailureCount');
          expect(calendarchannels).toHaveProperty('id');
          expect(calendarchannels).toHaveProperty('createdAt');
          expect(calendarchannels).toHaveProperty('updatedAt');
          expect(calendarchannels).toHaveProperty('connectedAccountId');
        }
      });
  });
});
