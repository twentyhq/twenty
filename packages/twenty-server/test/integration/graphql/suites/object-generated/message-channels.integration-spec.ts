import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('messageChannelsResolver (e2e)', () => {
  it('should find many messageChannels', () => {
    const queryData = {
      query: `
        query messageChannels {
          messageChannels {
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
        const data = res.body.data.messageChannels;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const messageChannels = edges[0].node;

          expect(messageChannels).toHaveProperty('visibility');
          expect(messageChannels).toHaveProperty('handle');
          expect(messageChannels).toHaveProperty('type');
          expect(messageChannels).toHaveProperty(
            'isContactAutoCreationEnabled',
          );
          expect(messageChannels).toHaveProperty('contactAutoCreationPolicy');
          expect(messageChannels).toHaveProperty(
            'excludeNonProfessionalEmails',
          );
          expect(messageChannels).toHaveProperty('excludeGroupEmails');
          expect(messageChannels).toHaveProperty('isSyncEnabled');
          expect(messageChannels).toHaveProperty('syncCursor');
          expect(messageChannels).toHaveProperty('syncedAt');
          expect(messageChannels).toHaveProperty('syncStatus');
          expect(messageChannels).toHaveProperty('syncStage');
          expect(messageChannels).toHaveProperty('syncStageStartedAt');
          expect(messageChannels).toHaveProperty('throttleFailureCount');
          expect(messageChannels).toHaveProperty('id');
          expect(messageChannels).toHaveProperty('createdAt');
          expect(messageChannels).toHaveProperty('updatedAt');
          expect(messageChannels).toHaveProperty('deletedAt');
          expect(messageChannels).toHaveProperty('connectedAccountId');
        }
      });
  });
});
