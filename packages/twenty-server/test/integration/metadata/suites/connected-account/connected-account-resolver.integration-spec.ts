import { gql } from 'graphql-tag';
import { makeMetadataAPIRequestWithMemberRole } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-member-role.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';

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

    it('should deny a member deleting a workspace-shared account owned by someone else', async () => {
      const response = await makeMetadataAPIRequestWithMemberRole({
        query: gql`
          mutation DeleteConnectedAccount($id: UUID!) {
            deleteConnectedAccount(id: $id) {
              id
            }
          }
        `,
        variables: { id: CONNECTED_ACCOUNT_DATA_SEED_IDS.SUPPORT_GROUP },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors?.[0]?.extensions?.code).toBe('FORBIDDEN');
    });

    it('should keep a denied member able to use the workspace-shared account', async () => {
      const response = await makeMetadataAPIRequestWithMemberRole({
        query: gql`
          query MyMessageChannels($connectedAccountId: UUID) {
            myMessageChannels(connectedAccountId: $connectedAccountId) {
              id
            }
          }
        `,
        variables: {
          connectedAccountId: CONNECTED_ACCOUNT_DATA_SEED_IDS.SUPPORT_GROUP,
        },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.myMessageChannels.length).toBeGreaterThan(0);
    });

    it('should allow a member deleting a workspace-shared account they own', async () => {
      const response = await makeMetadataAPIRequestWithMemberRole({
        query: gql`
          mutation DeleteConnectedAccount($id: UUID!) {
            deleteConnectedAccount(id: $id) {
              id
            }
          }
        `,
        variables: { id: CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY_SHARED },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.deleteConnectedAccount.id).toBe(
        CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY_SHARED,
      );
    });

    it('should allow an admin deleting a workspace-shared account', async () => {
      const response = await makeMetadataAPIRequest({
        query: gql`
          mutation DeleteConnectedAccount($id: UUID!) {
            deleteConnectedAccount(id: $id) {
              id
            }
          }
        `,
        variables: { id: CONNECTED_ACCOUNT_DATA_SEED_IDS.CONTACT_GROUP },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.deleteConnectedAccount.id).toBe(
        CONNECTED_ACCOUNT_DATA_SEED_IDS.CONTACT_GROUP,
      );
    });
  });
});
