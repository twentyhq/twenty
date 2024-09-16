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
          const messagechannels = edges[0].node;

          expect(messagechannels).toHaveProperty('visibility');
          expect(messagechannels).toHaveProperty('handle');
          expect(messagechannels).toHaveProperty('type');
          expect(messagechannels).toHaveProperty(
            'isContactAutoCreationEnabled',
          );
          expect(messagechannels).toHaveProperty('contactAutoCreationPolicy');
          expect(messagechannels).toHaveProperty(
            'excludeNonProfessionalEmails',
          );
          expect(messagechannels).toHaveProperty('excludeGroupEmails');
          expect(messagechannels).toHaveProperty('isSyncEnabled');
          expect(messagechannels).toHaveProperty('syncCursor');
          expect(messagechannels).toHaveProperty('syncedAt');
          expect(messagechannels).toHaveProperty('syncStatus');
          expect(messagechannels).toHaveProperty('syncStage');
          expect(messagechannels).toHaveProperty('syncStageStartedAt');
          expect(messagechannels).toHaveProperty('throttleFailureCount');
          expect(messagechannels).toHaveProperty('id');
          expect(messagechannels).toHaveProperty('createdAt');
          expect(messagechannels).toHaveProperty('updatedAt');
          expect(messagechannels).toHaveProperty('connectedAccountId');
        }
      });
  });
});
