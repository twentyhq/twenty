import { gql } from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { makeMetadataAPIRequestWithMemberRole } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-member-role.util';

import { CONNECTED_ACCOUNT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/connected-account-data-seeds.constant';

describe('connectedAccountResolver (e2e)', () => {
  describe('myConnectedAccounts', () => {
    it('should return only the current user connected accounts', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          query MyConnectedAccounts {
            myConnectedAccounts {
              id
              handle
              provider
            }
          }
        `,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();

      const accounts = response.body.data.myConnectedAccounts;
      const accountIds = accounts.map((account: { id: string }) => account.id);

      expect(accountIds).toContain(CONNECTED_ACCOUNT_DATA_SEED_IDS.JANE);
      expect(accountIds).not.toContain(CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY);
    });

    it('should not return sensitive fields', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          query MyConnectedAccounts {
            myConnectedAccounts {
              id
              handle
              provider
              authFailedAt
              scopes
              handleAliases
              lastSignedInAt
              userWorkspaceId
              createdAt
              updatedAt
            }
          }
        `,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();

      const account = response.body.data.myConnectedAccounts.find(
        (connectedAccount: { id: string }) =>
          connectedAccount.id === CONNECTED_ACCOUNT_DATA_SEED_IDS.JANE,
      );

      expect(account).toBeDefined();
      expect(account.handle).toBe('jane.austen@apple.dev');
      expect(account).not.toHaveProperty('accessToken');
      expect(account).not.toHaveProperty('refreshToken');
      expect(account).not.toHaveProperty('connectionParameters');
      expect(account).not.toHaveProperty('oidcTokenClaims');
    });

    it('should reject requesting hidden fields via GraphQL', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          query MyConnectedAccounts {
            myConnectedAccounts {
              id
              accessToken
            }
          }
        `,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('connectedAccounts (admin listing)', () => {
    it('should return all workspace accounts for admin', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          query ConnectedAccounts {
            connectedAccounts {
              id
              handle
              provider
            }
          }
        `,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();

      const accounts = response.body.data.connectedAccounts;
      const accountIds = accounts.map((account: { id: string }) => account.id);

      expect(accountIds).toContain(CONNECTED_ACCOUNT_DATA_SEED_IDS.JANE);
      expect(accountIds).toContain(CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY);
    });

    it('should also be accessible for member role (tool permission)', async () => {
      const response = await makeMetadataAPIRequestWithMemberRole({
        query: gql`
          query ConnectedAccounts {
            connectedAccounts {
              id
              handle
            }
          }
        `,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.connectedAccounts).toBeDefined();
    });
  });

  describe('deleteConnectedAccount', () => {
    it('should allow deleting own account', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          mutation DeleteConnectedAccount($id: UUID!) {
            deleteConnectedAccount(id: $id) {
              id
            }
          }
        `,
        variables: { id: CONNECTED_ACCOUNT_DATA_SEED_IDS.JANE_DELETABLE },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.deleteConnectedAccount.id).toBe(
        CONNECTED_ACCOUNT_DATA_SEED_IDS.JANE_DELETABLE,
      );
    });

    it('should deny deleting another user account', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          mutation DeleteConnectedAccount($id: UUID!) {
            deleteConnectedAccount(id: $id) {
              id
            }
          }
        `,
        variables: { id: CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    });
  });
});
