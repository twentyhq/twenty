import gql from 'graphql-tag';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { findApplicationConnectedAccounts } from 'test/integration/metadata/suites/connected-account/utils/find-application-connected-accounts.util';
import { findApplicationConnectionProviders } from 'test/integration/metadata/suites/connection-provider/utils/find-application-connection-providers.util';
import { insertAppPreferencesConnectedAccount } from 'test/integration/metadata/suites/connection-provider/utils/insert-app-preferences-connected-account.util';
import { setupAppPreferencesConnectionApplication } from 'test/integration/metadata/suites/connection-provider/utils/setup-app-preferences-connection-application.util';
import { startAppPreferencesAuthorization } from 'test/integration/metadata/suites/connection-provider/utils/start-app-preferences-authorization.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { v4 as uuidv4 } from 'uuid';

import { SEED_YCOMBINATOR_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

describe('Member application connection access', () => {
  let application: Awaited<
    ReturnType<typeof setupAppPreferencesConnectionApplication>
  >;
  const ownAccountId = uuidv4();
  const ownArchivedAccountId = uuidv4();
  const otherPrivateAccountId = uuidv4();
  const sharedAccountId = uuidv4();
  const archivedSharedAccountId = uuidv4();
  const foreignApplicationId = uuidv4();
  const foreignProviderId = uuidv4();
  const foreignAccountId = uuidv4();

  beforeAll(async () => {
    application = await setupAppPreferencesConnectionApplication({
      name: 'Member Connection Access',
    });
    for (const account of [
      { id: ownAccountId, userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY },
      {
        id: ownArchivedAccountId,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
        archivedAt: new Date(),
      },
      {
        id: otherPrivateAccountId,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
      },
      {
        id: sharedAccountId,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
        visibility: 'workspace',
      },
      {
        id: archivedSharedAccountId,
        userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
        visibility: 'workspace',
        archivedAt: new Date(),
      },
    ] satisfies Omit<
      Parameters<typeof insertAppPreferencesConnectedAccount>[0],
      'applicationId' | 'connectionProviderId'
    >[]) {
      await insertAppPreferencesConnectedAccount({
        ...account,
        applicationId: application.id,
        connectionProviderId: application.providerId,
      });
    }
    await globalThis.testDataSource.query(
      `INSERT INTO core."application"
         (id, "universalIdentifier", name, "sourcePath", "workspaceId")
       VALUES ($1, $2, $3, $4, $5)`,
      [
        foreignApplicationId,
        uuidv4(),
        'Foreign Access App',
        'foreign-access-app',
        SEED_YCOMBINATOR_WORKSPACE_ID,
      ],
    );
    await globalThis.testDataSource.query(
      `INSERT INTO core."connectionProvider"
         (id, "universalIdentifier", name, "displayName", type, "applicationId", "workspaceId")
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        foreignProviderId,
        uuidv4(),
        'preferences',
        'Foreign Provider',
        'oauth',
        foreignApplicationId,
        SEED_YCOMBINATOR_WORKSPACE_ID,
      ],
    );
    await insertAppPreferencesConnectedAccount({
      id: foreignAccountId,
      workspaceId: SEED_YCOMBINATOR_WORKSPACE_ID,
      applicationId: foreignApplicationId,
      connectionProviderId: foreignProviderId,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY_ACME,
    });
  }, 120000);

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: application.universalIdentifier,
    });
    await globalThis.testDataSource.query(
      `DELETE FROM core."application" WHERE id = $1`,
      [foreignApplicationId],
    );
  }, 120000);

  it('exposes own and active shared APP metadata while hiding other private, archived shared and foreign accounts', async () => {
    const response = await makeMetadataApiRequest(
      {
        query: gql`
          query MemberPreferenceAccounts {
            myConnectedAccounts {
              id
              provider
              applicationId
              connectionProviderId
              userWorkspaceId
              visibility
              archivedAt
              authFailedAt
              name
            }
          }
        `,
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    const accounts: {
      id: string;
      applicationId: string;
      connectionProviderId: string;
    }[] = response.body.data.myConnectedAccounts;

    expect(response.body.errors).toBeUndefined();
    expect(accounts.map(({ id }) => id)).toEqual(
      expect.arrayContaining([
        ownAccountId,
        ownArchivedAccountId,
        sharedAccountId,
      ]),
    );
    for (const hiddenId of [
      otherPrivateAccountId,
      archivedSharedAccountId,
      foreignAccountId,
    ]) {
      expect(accounts.map(({ id }) => id)).not.toContain(hiddenId);
    }
    expect(accounts.find(({ id }) => id === ownAccountId)).toEqual(
      expect.objectContaining({
        applicationId: application.id,
        connectionProviderId: application.providerId,
      }),
    );
    expect(JSON.stringify(accounts)).not.toContain('accessToken');
  });

  it('provides public provider readiness to an ordinary member without client credentials', async () => {
    const { data, errors } = await findApplicationConnectionProviders({
      input: { applicationId: application.id },
      gqlFields:
        'id name applicationId oauth { scopes isClientCredentialsConfigured }',
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(errors).toBeUndefined();
    expect(data.applicationConnectionProviders).toEqual([
      {
        id: application.providerId,
        name: 'preferences',
        applicationId: application.id,
        oauth: { scopes: ['read'], isClientCredentialsConfigured: false },
      },
    ]);
  });

  it('keeps the administration account query protected by Applications permission', async () => {
    const { errors } = await findApplicationConnectedAccounts({
      input: { applicationId: application.id },
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
      expectToFail: true,
    });

    expect(errors).toHaveLength(1);
  });

  it('keeps account credentials inaccessible through GraphQL', async () => {
    const response = await makeMetadataApiRequest(
      {
        query: gql`
          query HiddenPreferenceCredentials {
            myConnectedAccounts {
              accessToken
              refreshToken
              oidcTokenClaims
            }
          }
        `,
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(response.body.errors).toHaveLength(3);
    expect(response.body.data).toBeUndefined();
  });

  it.each([
    ['another member private account', otherPrivateAccountId],
    ['another member shared account', sharedAccountId],
    ['foreign workspace account', foreignAccountId],
  ])('refuses member disconnect and reconnect of %s', async (_label, id) => {
    const response = await makeMetadataApiRequest(
      {
        query: gql`
          mutation DisconnectPreferenceAccount($id: UUID!) {
            disconnectConnectedAccount(id: $id) {
              id
              archivedAt
            }
          }
        `,
        variables: { id },
      },
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );
    const authorizeResponse = await startAppPreferencesAuthorization({
      applicationId: application.id,
      reconnectingConnectedAccountId: id,
    });
    const errorMessage = new URL(
      authorizeResponse.headers.location,
    ).searchParams.get('errorMessage');

    expect(response.body.errors).toHaveLength(1);
    expect(authorizeResponse.status).toBe(302);
    expect(errorMessage).toMatch(
      /Cannot reconnect connectedAccount|does not have permission/,
    );
    const [account]: { archivedAt: Date | null }[] =
      await globalThis.testDataSource.query(
        `SELECT "archivedAt" FROM core."connectedAccount" WHERE id = $1`,
        [id],
      );

    expect(account.archivedAt).toBeNull();
  });
});
