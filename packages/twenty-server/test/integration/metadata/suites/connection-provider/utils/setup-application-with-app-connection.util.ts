import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { findConnectionProvidersByApplication } from 'test/integration/metadata/suites/connection-provider/utils/find-connection-providers-by-application.util';
import { generateAppleAdminApplicationTokenPair } from 'test/integration/utils/generate-apple-admin-application-token-pair.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { ConnectedAccountProvider } from 'twenty-shared/types';
import { v4 as uuidv4 } from 'uuid';

import { type PlaintextString } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

export type ApplicationWithAppConnection = {
  applicationUniversalIdentifier: string;
  applicationId: string;
  applicationToken: string;
  connectionProviderName: string;
  connectedAccountId: string;
  connectedAccountHandle: string;
  connectedAccountAccessToken: string;
  logicFunctionUniversalIdentifier: string;
};

const CONNECTION_PROVIDER_NAME = 'slack';

export const setupApplicationWithAppConnection = async ({
  name,
}: {
  name: string;
}): Promise<ApplicationWithAppConnection> => {
  const applicationUniversalIdentifier = uuidv4();
  const roleUniversalIdentifier = uuidv4();
  const logicFunctionUniversalIdentifier = uuidv4();
  const sourcePath = `test-${name.toLowerCase().replace(/\s+/g, '-')}`;

  await setupApplicationForSync({
    applicationUniversalIdentifier,
    name,
    description: `App for testing ${name}`,
    sourcePath,
  });

  await syncApplication({
    manifest: buildBaseManifest({
      appId: applicationUniversalIdentifier,
      roleId: roleUniversalIdentifier,
      overrides: {
        roles: [
          {
            universalIdentifier: roleUniversalIdentifier,
            label: `Test Role ${sourcePath}`,
            description: 'A test role',
          },
        ],
        logicFunctions: [
          {
            universalIdentifier: logicFunctionUniversalIdentifier,
            name: `${sourcePath}-handler`,
            handlerName: 'handler',
            sourceHandlerPath: 'src/handler.ts',
            builtHandlerPath: 'dist/handler.mjs',
            builtHandlerChecksum: 'handler-checksum',
          },
        ],
        connectionProviders: [
          {
            universalIdentifier: uuidv4(),
            name: CONNECTION_PROVIDER_NAME,
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

  const [connectionProvider] = await findConnectionProvidersByApplication(
    applicationUniversalIdentifier,
  );

  const connectedAccountId = uuidv4();
  const connectedAccountHandle = `${sourcePath}@slack.test`;
  const connectedAccountAccessToken = `xoxb-${uuidv4()}`;

  const encryptedAccessToken =
    getAppProviderByClassName<ConnectedAccountTokenEncryptionService>(
      'ConnectedAccountTokenEncryptionService',
    ).encrypt({
      plaintext: connectedAccountAccessToken as PlaintextString,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });

  // Without a refresh token, an APP connection's access token is served as is.
  await globalThis.testDataSource.query(
    `INSERT INTO core."connectedAccount"
       (id, handle, provider, visibility, "workspaceId", "userWorkspaceId",
        "applicationId", "connectionProviderId", "accessToken")
     VALUES ($1, $2, $3, 'workspace', $4, $5, $6, $7, $8)`,
    [
      connectedAccountId,
      connectedAccountHandle,
      ConnectedAccountProvider.APP,
      SEED_APPLE_WORKSPACE_ID,
      USER_WORKSPACE_DATA_SEED_IDS.JANE,
      connectionProvider.applicationId,
      connectionProvider.id,
      encryptedAccessToken,
    ],
  );

  const applicationTokenPair = await generateAppleAdminApplicationTokenPair({
    applicationId: connectionProvider.applicationId,
  });

  return {
    applicationUniversalIdentifier,
    applicationId: connectionProvider.applicationId,
    applicationToken: applicationTokenPair.applicationAccessToken.token,
    connectionProviderName: CONNECTION_PROVIDER_NAME,
    connectedAccountId,
    connectedAccountHandle,
    connectedAccountAccessToken,
    logicFunctionUniversalIdentifier,
  };
};

export const cleanupApplicationWithAppConnection = async ({
  applicationUniversalIdentifier,
  applicationId,
}: Pick<
  ApplicationWithAppConnection,
  'applicationUniversalIdentifier' | 'applicationId'
>) => {
  await globalThis.testDataSource.query(
    `DELETE FROM core."messageChannel" WHERE "connectedAccountId" IN (
       SELECT id FROM core."connectedAccount" WHERE "applicationId" = $1)`,
    [applicationId],
  );
  await globalThis.testDataSource.query(
    `DELETE FROM core."connectedAccount" WHERE "applicationId" = $1`,
    [applicationId],
  );
  await cleanupApplicationAndAppRegistration({
    applicationUniversalIdentifier,
  });
};
