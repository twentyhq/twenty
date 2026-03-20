import { randomUUID } from 'crypto';

import { gql } from 'graphql-tag';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { makeMetadataAPIRequestWithMemberRole } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-member-role.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { FeatureFlagKey } from 'twenty-shared/types';

const WORKSPACE_ID = '20202020-1c25-4d02-bf25-6aeccf7ea419';
const JANE_USER_WORKSPACE_ID = '20202020-1e7c-43d9-a5db-685b5069d816';
const JONY_USER_WORKSPACE_ID = '20202020-3957-4908-9c36-2929a23f8353';

describe('connectedAccountResolver (e2e)', () => {
  let janeAccountId: string;
  let jonyAccountId: string;

  beforeAll(async () => {
    janeAccountId = randomUUID();
    jonyAccountId = randomUUID();

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED,
      value: true,
      expectToFail: false,
    });

    await testDataSource.query(
      `INSERT INTO core."connectedAccount" (id, handle, provider, "userWorkspaceId", "workspaceId")
       VALUES ($1, 'jane@test.com', 'google', $2, $3),
              ($4, 'jony@test.com', 'google', $5, $3)`,
      [
        janeAccountId,
        JANE_USER_WORKSPACE_ID,
        WORKSPACE_ID,
        jonyAccountId,
        JONY_USER_WORKSPACE_ID,
      ],
    );
  });

  afterAll(async () => {
    await testDataSource
      .query('DELETE FROM core."connectedAccount" WHERE id = ANY($1)', [
        [janeAccountId, jonyAccountId],
      ])
      .catch(() => {});

    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_CONNECTED_ACCOUNT_MIGRATED,
      value: false,
      expectToFail: false,
    });
  });

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
      expect(response.body.data.myConnectedAccounts).toBeDefined();

      const accounts = response.body.data.myConnectedAccounts;
      const accountIds = accounts.map((account: { id: string }) => account.id);

      expect(accountIds).toContain(janeAccountId);
      expect(accountIds).not.toContain(jonyAccountId);
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
        (a: { id: string }) => a.id === janeAccountId,
      );

      expect(account).toBeDefined();
      expect(account.handle).toBe('jane@test.com');
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

      expect(accountIds).toContain(janeAccountId);
      expect(accountIds).toContain(jonyAccountId);
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
      const tempAccountId = randomUUID();

      await testDataSource.query(
        `INSERT INTO core."connectedAccount" (id, handle, provider, "userWorkspaceId", "workspaceId")
         VALUES ($1, 'temp@test.com', 'google', $2, $3)`,
        [tempAccountId, JANE_USER_WORKSPACE_ID, WORKSPACE_ID],
      );

      const response = await makeMetadataAPIRequest({
        query: gql`
          mutation DeleteConnectedAccount($id: UUID!) {
            deleteConnectedAccount(id: $id) {
              id
            }
          }
        `,
        variables: { id: tempAccountId },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.deleteConnectedAccount.id).toBe(tempAccountId);
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
        variables: { id: jonyAccountId },
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });
});
