import request from 'supertest';

const client = request(`http://localhost:${APP_PORT}`);

describe('connectedAccountsResolver (e2e)', () => {
  it('should find many connectedAccounts', () => {
    const queryData = {
      query: `
        query connectedAccounts {
          connectedAccounts {
            edges {
              node {
                handle
                provider
                accessToken
                refreshToken
                lastSyncHistoryId
                authFailedAt
                handleAliases
                id
                createdAt
                updatedAt
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
        const data = res.body.data.connectedAccounts;

        expect(data).toBeDefined();
        expect(Array.isArray(data.edges)).toBe(true);

        const edges = data.edges;

        if (edges.length > 0) {
          const connectedaccounts = edges[0].node;

          expect(connectedaccounts).toHaveProperty('handle');
          expect(connectedaccounts).toHaveProperty('provider');
          expect(connectedaccounts).toHaveProperty('accessToken');
          expect(connectedaccounts).toHaveProperty('refreshToken');
          expect(connectedaccounts).toHaveProperty('lastSyncHistoryId');
          expect(connectedaccounts).toHaveProperty('authFailedAt');
          expect(connectedaccounts).toHaveProperty('handleAliases');
          expect(connectedaccounts).toHaveProperty('id');
          expect(connectedaccounts).toHaveProperty('createdAt');
          expect(connectedaccounts).toHaveProperty('updatedAt');
          expect(connectedaccounts).toHaveProperty('accountOwnerId');
        }
      });
  });
});
