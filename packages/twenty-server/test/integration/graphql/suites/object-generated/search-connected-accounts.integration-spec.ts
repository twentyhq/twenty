import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('searchConnectedAccountsResolver (e2e)', () => {
  it('should find many searchConnectedAccounts', () => {
    const queryData = {
      query: `
        query searchConnectedAccounts {
          searchConnectedAccounts {
            edges {
              node {
                handle
                provider
                accessToken
                refreshToken
                lastSyncHistoryId
                authFailedAt
                handleAliases
                scopes
                id
                createdAt
                updatedAt
                deletedAt
                accountOwnerId
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
        const data = res.body.data.searchConnectedAccounts;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const searchConnectedAccounts = edges[0].node;

          expect(searchConnectedAccounts).toHaveProperty('handle');
          expect(searchConnectedAccounts).toHaveProperty('provider');
          expect(searchConnectedAccounts).toHaveProperty('accessToken');
          expect(searchConnectedAccounts).toHaveProperty('refreshToken');
          expect(searchConnectedAccounts).toHaveProperty('lastSyncHistoryId');
          expect(searchConnectedAccounts).toHaveProperty('authFailedAt');
          expect(searchConnectedAccounts).toHaveProperty('handleAliases');
          expect(searchConnectedAccounts).toHaveProperty('scopes');
          expect(searchConnectedAccounts).toHaveProperty('id');
          expect(searchConnectedAccounts).toHaveProperty('createdAt');
          expect(searchConnectedAccounts).toHaveProperty('updatedAt');
          expect(searchConnectedAccounts).toHaveProperty('deletedAt');
          expect(searchConnectedAccounts).toHaveProperty('accountOwnerId');
        }
      });
  });
});
