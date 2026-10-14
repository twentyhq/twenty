import { gql } from 'graphql-tag';
import { makeMetadataApiRequestWithMemberRole } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-member-role.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { CONNECTED_ACCOUNT_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/data/constants/connected-account-data-seeds.constant';

const MY_CONNECTED_ACCOUNTS_WITH_FILTER_QUERY = gql`
  query MyConnectedAccounts($filter: MyConnectedAccountsFilterInput) {
    myConnectedAccounts(filter: $filter) {
      id
    }
  }
`;

const JONY_PRIVATE_APP_CONNECTION_ID = uuidv4();
const JONY_SHARED_APP_CONNECTION_ID = uuidv4();
const TIM_PRIVATE_APP_CONNECTION_ID = uuidv4();

const queryMyConnectedAccountIdsAsMember = async (
  filter?: Record<string, unknown> | null,
): Promise<string[]> => {
  const response = await makeMetadataApiRequestWithMemberRole({
    query: MY_CONNECTED_ACCOUNTS_WITH_FILTER_QUERY,
    variables: { filter },
  });

  expect(response.status).toBe(200);
  expect(response.body.errors).toBeUndefined();

  return response.body.data.myConnectedAccounts.map(
    (account: { id: string }) => account.id,
  );
};

describe('connectedAccountResolver (e2e)', () => {
  describe('myConnectedAccounts', () => {
    it('should not return another user private connected account', async () => {
      const response = await makeMetadataApiRequest({
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

    it('should return a workspace-shared account owned by someone else', async () => {
      const response = await makeMetadataApiRequestWithMemberRole({
        query: gql`
          query MyConnectedAccounts {
            myConnectedAccounts {
              id
              handle
            }
          }
        `,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();

      const accountIds = response.body.data.myConnectedAccounts.map(
        (account: { id: string }) => account.id,
      );

      expect(accountIds).toContain(
        CONNECTED_ACCOUNT_DATA_SEED_IDS.SUPPORT_GROUP,
      );
    });

    it('should not offer an archived workspace-shared account to other members', async () => {
      const response = await makeMetadataApiRequestWithMemberRole({
        query: gql`
          query MyConnectedAccounts {
            myConnectedAccounts {
              id
            }
          }
        `,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();

      const accountIds = response.body.data.myConnectedAccounts.map(
        (account: { id: string }) => account.id,
      );

      expect(accountIds).not.toContain(
        CONNECTED_ACCOUNT_DATA_SEED_IDS.TIM_SHARED_ARCHIVED,
      );
    });

    it('should list the caller own accounts before workspace-shared ones', async () => {
      const response = await makeMetadataApiRequestWithMemberRole({
        query: gql`
          query MyConnectedAccounts {
            myConnectedAccounts {
              id
            }
          }
        `,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeUndefined();

      const accountIds = response.body.data.myConnectedAccounts.map(
        (account: { id: string }) => account.id,
      );

      expect(
        accountIds.indexOf(CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY),
      ).toBeLessThan(
        accountIds.indexOf(CONNECTED_ACCOUNT_DATA_SEED_IDS.SUPPORT_GROUP),
      );
    });

    it('should resolve the account of every message channel the caller can see', async () => {
      const channelsResponse = await makeMetadataApiRequestWithMemberRole({
        query: gql`
          query MyMessageChannels {
            myMessageChannels {
              id
              connectedAccountId
            }
          }
        `,
      });

      const accountsResponse = await makeMetadataApiRequestWithMemberRole({
        query: gql`
          query MyConnectedAccounts {
            myConnectedAccounts {
              id
            }
          }
        `,
      });

      expect(channelsResponse.body.errors).toBeUndefined();
      expect(accountsResponse.body.errors).toBeUndefined();

      const accountIds = accountsResponse.body.data.myConnectedAccounts.map(
        (account: { id: string }) => account.id,
      );
      const channelAccountIds =
        channelsResponse.body.data.myMessageChannels.map(
          (messageChannel: { connectedAccountId: string }) =>
            messageChannel.connectedAccountId,
        );

      expect(channelAccountIds.length).toBeGreaterThan(0);
      expect(accountIds).toEqual(expect.arrayContaining(channelAccountIds));
    });

    it('should not return sensitive fields', async () => {
      const response = await makeMetadataApiRequest({
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

    describe('with a filter', () => {
      beforeAll(async () => {
        await globalThis.testDataSource.query(
          `INSERT INTO core."connectedAccount"
             (id, handle, provider, visibility, "workspaceId", "userWorkspaceId")
           VALUES ($1, $2, $3, 'user', $4, $5), ($6, $7, $3, 'workspace', $4, $5),
                  ($8, $9, $3, 'user', $4, $10)`,
          [
            JONY_PRIVATE_APP_CONNECTION_ID,
            'jony-private-app@apple.dev',
            ConnectedAccountProvider.APP,
            SEED_APPLE_WORKSPACE_ID,
            USER_WORKSPACE_DATA_SEED_IDS.JONY,
            JONY_SHARED_APP_CONNECTION_ID,
            'jony-shared-app@apple.dev',
            TIM_PRIVATE_APP_CONNECTION_ID,
            'tim-private-app@apple.dev',
            USER_WORKSPACE_DATA_SEED_IDS.TIM,
          ],
        );
      });

      afterAll(async () => {
        await globalThis.testDataSource.query(
          `DELETE FROM core."connectedAccount" WHERE id = ANY($1)`,
          [
            [
              JONY_PRIVATE_APP_CONNECTION_ID,
              JONY_SHARED_APP_CONNECTION_ID,
              TIM_PRIVATE_APP_CONNECTION_ID,
            ],
          ],
        );
      });

      it.each([
        ['no filter', undefined],
        ['a null filter', null],
        ['an empty filter', {}],
      ])('should return every usable account with %s', async (_, filter) => {
        const accountIds = await queryMyConnectedAccountIdsAsMember(filter);

        expect(accountIds).toEqual(
          expect.arrayContaining([
            CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY,
            JONY_PRIVATE_APP_CONNECTION_ID,
            JONY_SHARED_APP_CONNECTION_ID,
            CONNECTED_ACCOUNT_DATA_SEED_IDS.SUPPORT_GROUP,
          ]),
        );
        expect(accountIds).not.toContain(TIM_PRIVATE_APP_CONNECTION_ID);
      });

      it('should leave out other members workspace-shared accounts when ownedByCaller is true', async () => {
        const accountIds = await queryMyConnectedAccountIdsAsMember({
          ownedByCaller: true,
        });

        expect(accountIds).toEqual(
          expect.arrayContaining([
            CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY,
            JONY_PRIVATE_APP_CONNECTION_ID,
            JONY_SHARED_APP_CONNECTION_ID,
          ]),
        );
        expect(accountIds).not.toContain(
          CONNECTED_ACCOUNT_DATA_SEED_IDS.SUPPORT_GROUP,
        );
        expect(accountIds).not.toContain(CONNECTED_ACCOUNT_DATA_SEED_IDS.JANE);
      });

      it('should filter app connections by visibility without touching other providers', async () => {
        const accountIds = await queryMyConnectedAccountIdsAsMember({
          appConnectionVisibility: 'user',
        });

        expect(accountIds).toEqual(
          expect.arrayContaining([
            CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY,
            JONY_PRIVATE_APP_CONNECTION_ID,
            CONNECTED_ACCOUNT_DATA_SEED_IDS.SUPPORT_GROUP,
          ]),
        );
        expect(accountIds).not.toContain(JONY_SHARED_APP_CONNECTION_ID);
        expect(accountIds).not.toContain(TIM_PRIVATE_APP_CONNECTION_ID);
      });

      it('should not widen to other members private app connections when keeping workspace-shared ones', async () => {
        const accountIds = await queryMyConnectedAccountIdsAsMember({
          appConnectionVisibility: 'workspace',
        });

        expect(accountIds).toEqual(
          expect.arrayContaining([
            CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY,
            JONY_SHARED_APP_CONNECTION_ID,
            CONNECTED_ACCOUNT_DATA_SEED_IDS.SUPPORT_GROUP,
          ]),
        );
        expect(accountIds).not.toContain(JONY_PRIVATE_APP_CONNECTION_ID);
        expect(accountIds).not.toContain(TIM_PRIVATE_APP_CONNECTION_ID);
      });

      it('should return the caller own accounts minus workspace-shared app connections for App preferences', async () => {
        const accountIds = await queryMyConnectedAccountIdsAsMember({
          ownedByCaller: true,
          appConnectionVisibility: 'user',
        });

        expect(accountIds).toEqual(
          expect.arrayContaining([
            CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY,
            JONY_PRIVATE_APP_CONNECTION_ID,
          ]),
        );
        expect(accountIds).not.toContain(JONY_SHARED_APP_CONNECTION_ID);
        expect(accountIds).not.toContain(
          CONNECTED_ACCOUNT_DATA_SEED_IDS.JONY_SHARED,
        );
        expect(accountIds).not.toContain(
          CONNECTED_ACCOUNT_DATA_SEED_IDS.SUPPORT_GROUP,
        );
      });

      it('should reject an unknown app connection visibility', async () => {
        const response = await makeMetadataApiRequestWithMemberRole({
          query: MY_CONNECTED_ACCOUNTS_WITH_FILTER_QUERY,
          variables: { filter: { appConnectionVisibility: 'everyone' } },
        });

        expect(response.status).toBe(200);
        expect(response.body.errors?.[0]?.extensions?.code).toBe(
          'BAD_USER_INPUT',
        );
        expect(response.body.data?.myConnectedAccounts ?? null).toBeNull();
      });
    });

    it('should reject requesting hidden fields via GraphQL', async () => {
      const response = await makeMetadataApiRequest({
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
      const response = await makeMetadataApiRequest({
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
      const response = await makeMetadataApiRequest({
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
      const response = await makeMetadataApiRequestWithMemberRole({
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
      const response = await makeMetadataApiRequestWithMemberRole({
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
      const response = await makeMetadataApiRequestWithMemberRole({
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
      const response = await makeMetadataApiRequest({
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
