import { gql } from 'graphql-tag';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { makeMetadataAPIRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { makeMetadataAPIRequestWithMemberRole } from 'test/integration/metadata/suites/utils/make-metadata-api-request-with-member-role.util';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const APPLICATION_CONNECTED_ACCOUNTS_QUERY = gql`
  query ApplicationConnectedAccounts($applicationId: UUID!) {
    applicationConnectedAccounts(applicationId: $applicationId) {
      id
    }
  }
`;

const APP_ID = uuidv4();
const APP_ROLE_ID = uuidv4();
const APP_PROVIDER_ID = uuidv4();

const SHARED_BY_TIM_ID = uuidv4();
const PRIVATE_OF_JANE_ID = uuidv4();
const PRIVATE_OF_TIM_ID = uuidv4();
const ARCHIVED_SHARED_BY_TIM_ID = uuidv4();

describe('applicationConnectedAccounts resolver (e2e)', () => {
  let applicationDbId: string;
  let providerDbId: string;

  const insertAppConnection = async ({
    id,
    visibility,
    userWorkspaceId,
    archivedAt = null,
  }: {
    id: string;
    visibility: 'user' | 'workspace';
    userWorkspaceId: string;
    archivedAt?: Date | null;
  }): Promise<void> => {
    await globalThis.testDataSource.query(
      `INSERT INTO core."connectedAccount"
         (id, handle, provider, visibility, "workspaceId", "userWorkspaceId",
          "applicationId", "connectionProviderId", "archivedAt")
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        id,
        'slack-bot@apple.dev',
        ConnectedAccountProvider.APP,
        visibility,
        SEED_APPLE_WORKSPACE_ID,
        userWorkspaceId,
        applicationDbId,
        providerDbId,
        archivedAt,
      ],
    );
  };

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APP_ID,
      name: 'test-application-connected-accounts',
      description: 'App for testing the application connections query',
      sourcePath: 'test-application-connected-accounts',
    });

    await syncApplication({
      manifest: buildBaseManifest({
        appId: APP_ID,
        roleId: APP_ROLE_ID,
        overrides: {
          connectionProviders: [
            {
              universalIdentifier: APP_PROVIDER_ID,
              name: 'slack',
              displayName: 'Slack',
              type: 'oauth',
              oauth: {
                authorizationEndpoint: 'https://slack.com/oauth/v2/authorize',
                tokenEndpoint: 'https://slack.com/api/oauth.v2.access',
                scopes: ['chat:write'],
                clientIdVariable: 'SLACK_CLIENT_ID',
                clientSecretVariable: 'SLACK_CLIENT_SECRET',
              },
            },
          ],
        },
      }),
      expectToFail: false,
    });

    jest.useRealTimers();

    const [provider] = await findConnectionProvidersByApplication(APP_ID);

    applicationDbId = provider.applicationId;
    providerDbId = provider.id;

    await insertAppConnection({
      id: SHARED_BY_TIM_ID,
      visibility: 'workspace',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
    });
    await insertAppConnection({
      id: PRIVATE_OF_JANE_ID,
      visibility: 'user',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
    });
    await insertAppConnection({
      id: PRIVATE_OF_TIM_ID,
      visibility: 'user',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
    });
    await insertAppConnection({
      id: ARCHIVED_SHARED_BY_TIM_ID,
      visibility: 'workspace',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.TIM,
      archivedAt: new Date(),
    });
  }, 180000);

  afterAll(async () => {
    await globalThis.testDataSource.query(
      `DELETE FROM core."connectedAccount"
        WHERE "workspaceId" = $1 AND "applicationId" = $2`,
      [SEED_APPLE_WORKSPACE_ID, applicationDbId],
    );

    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APP_ID,
    });
  }, 120000);

  it('returns workspace-shared connections and the caller own private ones', async () => {
    const response = await makeMetadataAPIRequest({
      query: APPLICATION_CONNECTED_ACCOUNTS_QUERY,
      variables: { applicationId: applicationDbId },
    });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();

    const accounts: { id: string }[] =
      response.body.data.applicationConnectedAccounts;

    expect(accounts).toHaveLength(2);
    expect(accounts).toEqual(
      expect.arrayContaining([
        { id: SHARED_BY_TIM_ID },
        { id: PRIVATE_OF_JANE_ID },
      ]),
    );
  });

  it('denies a member without the applications settings permission', async () => {
    const response = await makeMetadataAPIRequestWithMemberRole({
      query: APPLICATION_CONNECTED_ACCOUNTS_QUERY,
      variables: { applicationId: applicationDbId },
    });

    expect(response.status).toBe(200);
    expect(response.body.data?.applicationConnectedAccounts ?? null).toBeNull();
    expect(response.body.errors).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          extensions: expect.objectContaining({
            code: 'FORBIDDEN',
            subCode: 'PERMISSION_DENIED',
          }),
        }),
      ]),
    );
  });

  it('returns nothing for an application without connections', async () => {
    const response = await makeMetadataAPIRequest({
      query: APPLICATION_CONNECTED_ACCOUNTS_QUERY,
      variables: { applicationId: uuidv4() },
    });

    expect(response.status).toBe(200);
    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.applicationConnectedAccounts).toEqual([]);
  });
});
