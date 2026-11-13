import { createHash } from 'crypto';

import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { connectApplicationWithApiKeyQueryFactory } from 'test/integration/metadata/suites/connection-provider/utils/connect-application-with-api-key-query-factory.util';
import { makeMetadataApiRequest } from 'test/integration/metadata/suites/utils/make-metadata-api-request.util';
import { type MarkerServer } from 'test/integration/types/marker-server.type';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { startMarkerServer } from 'test/integration/utils/start-marker-server.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const APPLICATION_IDENTIFIER = v4();
const ROLE_IDENTIFIER = v4();
const PROVIDER_IDENTIFIER = v4();
const IDENTIFY_ACCOUNT_IDENTIFIER = v4();
const ON_CONNECT_IDENTIFIER = v4();

const IDENTIFY_ACCOUNT_SOURCE = `export const handler = ({ accessToken }) => {
  if (!accessToken.startsWith('valid-')) throw new Error('401 Unauthorized');
  return { externalAccountId: 'company-a', handle: 'Company A (' + accessToken + ')' };
};`;

describe('app connection api-key flow', () => {
  let provider: ConnectionProviderEntity;
  let markerServer: MarkerServer;
  let onConnectExecutionsUrl: string;

  const readOnConnectExecutions = (): string[] =>
    markerServer.hasMarker(onConnectExecutionsUrl)
      ? markerServer.readMarker(onConnectExecutionsUrl).trim().split('\n')
      : [];

  const readAccounts = (): Promise<ConnectedAccountEntity[]> =>
    globalThis.testDataSource.query(
      'SELECT * FROM core."connectedAccount" WHERE "connectionProviderId" = $1 ORDER BY "createdAt", id',
      [provider.id],
    );

  const decryptAccessToken = (
    ciphertext: ConnectedAccountEntity['accessToken'],
  ) => {
    assertIsDefinedOrThrow(ciphertext);

    return getAppProviderByClassName<ConnectedAccountTokenEncryptionService>(
      'ConnectedAccountTokenEncryptionService',
    ).decrypt({ ciphertext, workspaceId: SEED_APPLE_WORKSPACE_ID });
  };

  const connectWithApiKey = async ({
    apiKey,
    reconnectingConnectedAccountId,
    token,
  }: {
    apiKey: string;
    reconnectingConnectedAccountId?: string;
    token?: string;
  }) => {
    const response = await makeMetadataApiRequest(
      connectApplicationWithApiKeyQueryFactory({
        input: {
          applicationId: provider.applicationId,
          providerName: provider.name,
          apiKey,
          reconnectingConnectedAccountId,
        },
      }),
      token,
    );

    await waitForAllJobsToFinish();

    return response;
  };

  beforeAll(async () => {
    markerServer = await startMarkerServer();
    onConnectExecutionsUrl = markerServer.markerUrl('on-connect-executions');

    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
      name: 'API key flow integration',
      description: 'API key connection flow',
      sourcePath: 'api-key-flow-integration',
    });
    jest.useRealTimers();

    const functions = [
      {
        universalIdentifier: IDENTIFY_ACCOUNT_IDENTIFIER,
        name: 'identify-account',
        source: IDENTIFY_ACCOUNT_SOURCE,
      },
      {
        universalIdentifier: ON_CONNECT_IDENTIFIER,
        name: 'on-connect',
        source: `export const handler = async ({ connectedAccountId }) => {
  await fetch(${JSON.stringify(onConnectExecutionsUrl)}, { method: 'POST', body: connectedAccountId + '\\n' });
};`,
      },
    ];

    for (const logicFunction of functions) {
      const uploaded = await uploadApplicationFile({
        applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
        fileFolder: 'BuiltLogicFunction',
        filePath: `dist/${logicFunction.name}.mjs`,
        filename: `${logicFunction.name}.mjs`,
        contentType: 'application/javascript',
        fileBuffer: Buffer.from(logicFunction.source),
      });

      expect(uploaded.errors).toBeUndefined();
    }

    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: APPLICATION_IDENTIFIER,
        roleId: ROLE_IDENTIFIER,
        overrides: {
          logicFunctions: functions.map((logicFunction) => ({
            universalIdentifier: logicFunction.universalIdentifier,
            name: logicFunction.name,
            handlerName: 'handler',
            sourceHandlerPath: `src/${logicFunction.name}.ts`,
            builtHandlerPath: `dist/${logicFunction.name}.mjs`,
            builtHandlerChecksum: createHash('sha256')
              .update(logicFunction.source)
              .digest('hex'),
            timeoutSeconds: 10,
          })),
          connectionProviders: [
            {
              universalIdentifier: PROVIDER_IDENTIFIER,
              name: 'key-provider',
              displayName: 'Key provider',
              type: 'api-key',
              identifyAccountLogicFunction: {
                universalIdentifier: IDENTIFY_ACCOUNT_IDENTIFIER,
              },
              onConnectLogicFunction: {
                universalIdentifier: ON_CONNECT_IDENTIFIER,
              },
            },
          ],
        },
      }),
    });

    expect(errors).toBeUndefined();
    jest.useRealTimers();
    [provider] = await globalThis.testDataSource.query(
      'SELECT * FROM core."connectionProvider" WHERE "universalIdentifier" = $1',
      [PROVIDER_IDENTIFIER],
    );
  }, 120000);

  beforeEach(() => {
    markerServer.clearMarker(onConnectExecutionsUrl);
  });

  afterEach(async () => {
    await globalThis.testDataSource.query(
      'DELETE FROM core."connectedAccount" WHERE "applicationId" = $1',
      [provider.applicationId],
    );
  });

  afterAll(async () => {
    await cleanupApplicationAndAppRegistration({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
    });
    await markerServer.close();
  });

  it('stores the provider without any config block', () => {
    expect(provider).toMatchObject({
      type: 'api-key',
      oauthConfig: null,
      customConfig: null,
      oauthDiscoveryConfig: null,
    });
  });

  it('saves the key encrypted, names the connection from the identify function and runs onConnect', async () => {
    const response = await connectWithApiKey({ apiKey: '  valid-key-1 ' });
    const [connection] = await readAccounts();

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.connectApplicationWithApiKey).toBe(connection.id);
    expect(connection).toMatchObject({
      provider: 'app',
      externalAccountId: 'company-a',
      handle: 'Company A (valid-key-1)',
      refreshToken: null,
      scope: 'WORKSPACE',
    });
    expect(connection.accessToken).not.toBe('valid-key-1');
    expect(decryptAccessToken(connection.accessToken)).toBe('valid-key-1');
    expect(readOnConnectExecutions()).toEqual([connection.id]);
  });

  it('saves nothing when the identify function rejects the key', async () => {
    const response = await connectWithApiKey({ apiKey: 'wrong-key' });

    expect(response.body.errors?.[0]?.extensions?.code).toBe('BAD_USER_INPUT');
    expect(await readAccounts()).toHaveLength(0);
    expect(readOnConnectExecutions()).toEqual([]);
  });

  it('refuses callers that are not a member session', async () => {
    const response = await connectWithApiKey({
      apiKey: 'valid-key-1',
      token: API_KEY_ACCESS_TOKEN,
    });

    expect(response.body.errors).toBeDefined();
    expect(await readAccounts()).toHaveLength(0);
  });

  it('replaces the key of the connection being reconnected', async () => {
    await connectWithApiKey({ apiKey: 'valid-key-1' });
    const [connection] = await readAccounts();

    const response = await connectWithApiKey({
      apiKey: 'valid-key-2',
      reconnectingConnectedAccountId: connection.id,
    });
    const accounts = await readAccounts();

    expect(response.body.errors).toBeUndefined();
    expect(accounts).toHaveLength(1);
    expect(accounts[0]).toMatchObject({
      id: connection.id,
      handle: 'Company A (valid-key-2)',
    });
    expect(decryptAccessToken(accounts[0].accessToken)).toBe('valid-key-2');
  });
});
