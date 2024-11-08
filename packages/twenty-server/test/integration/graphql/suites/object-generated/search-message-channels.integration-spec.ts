import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchMessageChannelsResolver (e2e)', () => {
  it('should find many searchMessageChannels', () => {
    const queryData = {
      query: `
        query searchMessageChannels {
          searchMessageChannels {
            edges {
              node {
                visibility
                handle
                type
                isContactAutoCreationEnabled
                contactAutoCreationPolicy
                excludeNonProfessionalEmails
                excludeGroupEmails
                isSyncEnabled
                syncCursor
                syncedAt
                syncStatus
                syncStage
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
        const data = res.body.data.searchMessageChannels;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchMessageChannels = edges[0].node;

          expect(searchMessageChannels).toHaveProperty('visibility');
          expect(searchMessageChannels).toHaveProperty('handle');
          expect(searchMessageChannels).toHaveProperty('type');
          expect(searchMessageChannels).toHaveProperty(
            'isContactAutoCreationEnabled',
          );
          expect(searchMessageChannels).toHaveProperty(
            'contactAutoCreationPolicy',
          );
          expect(searchMessageChannels).toHaveProperty(
            'excludeNonProfessionalEmails',
          );
          expect(searchMessageChannels).toHaveProperty('excludeGroupEmails');
          expect(searchMessageChannels).toHaveProperty('isSyncEnabled');
          expect(searchMessageChannels).toHaveProperty('syncCursor');
          expect(searchMessageChannels).toHaveProperty('syncedAt');
          expect(searchMessageChannels).toHaveProperty('syncStatus');
          expect(searchMessageChannels).toHaveProperty('syncStage');
          expect(searchMessageChannels).toHaveProperty('syncStageStartedAt');
          expect(searchMessageChannels).toHaveProperty('throttleFailureCount');
          expect(searchMessageChannels).toHaveProperty('id');
          expect(searchMessageChannels).toHaveProperty('createdAt');
          expect(searchMessageChannels).toHaveProperty('updatedAt');
          expect(searchMessageChannels).toHaveProperty('deletedAt');
          expect(searchMessageChannels).toHaveProperty('connectedAccountId');
        }
      });
  });
});
