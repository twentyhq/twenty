import { createHash } from 'crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import request from 'supertest';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { generateTransientTokenResponse } from 'test/integration/utils/generate-transient-token.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { type Manifest } from 'twenty-shared/application';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const APPLICATION_IDENTIFIER = v4();
const ROLE_IDENTIFIER = v4();
const PROVIDER_IDENTIFIER = v4();
const AUTHORIZE_IDENTIFIER = v4();
const CALLBACK_IDENTIFIER = v4();
const ON_CONNECT_IDENTIFIER = v4();
const HOSTED_AUTH_ORIGIN = 'https://hosted-auth.example.com';

const AUTHORIZE_SOURCE = `export const handler = ({ callbackUrl }) => ({
  authorizationUrl: ${JSON.stringify(HOSTED_AUTH_ORIGIN)} + '/connect?notify=' + encodeURIComponent(callbackUrl),
});`;

// The browser return carries no account; the notification posts it.
const CALLBACK_SOURCE = `export const handler = ({ httpMethod, body }) => {
  if (httpMethod === 'GET') return null;
  if (body.account_id === 'broken') throw new Error('upstream account lookup failed');
  return {
    externalAccountId: body.account_id,
    handle: 'Handle ' + body.account_id,
    ...(body.token ? { accessToken: body.token } : {}),
  };
};`;

describe('app connection custom flow', () => {
  let provider: ConnectionProviderEntity;
  let logicFunctionManifests: Manifest['logicFunctions'];
  let fixtureDirectory: string;
  let onConnectExecutionsPath: string;

  const readOnConnectExecutions = (): string[] =>
    existsSync(onConnectExecutionsPath)
      ? readFileSync(onConnectExecutionsPath, 'utf8').trim().split('\n')
      : [];

  const readAccounts = (): Promise<ConnectedAccountEntity[]> =>
    globalThis.testDataSource.query(
      'SELECT * FROM core."connectedAccount" WHERE "connectionProviderId" = $1 ORDER BY "createdAt", id',
      [provider.id],
    );

  const authorize = async ({
    reconnectingConnectedAccountId,
  }: { reconnectingConnectedAccountId?: string } = {}): Promise<URL> => {
    const transient = await generateTransientTokenResponse({
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(transient.errors).toBeUndefined();

    const response = await request(`http://localhost:${APP_PORT}`)
      .get('/auth/apps/authorize')
      .query({
        applicationId: provider.applicationId,
        providerName: provider.name,
        transientToken:
          transient.data.generateTransientToken.transientToken.token,
        reconnectingConnectedAccountId,
      });

    expect(response.status).toBe(302);

    const authorizationUrl = new URL(response.headers.location);

    expect(authorizationUrl.origin).toBe(HOSTED_AUTH_ORIGIN);

    const callbackUrl = authorizationUrl.searchParams.get('notify');

    assertIsDefinedOrThrow(callbackUrl);

    return new URL(callbackUrl);
  };

  const notify = async ({
    callbackUrl,
    body,
  }: {
    callbackUrl: URL;
    body: Record<string, string>;
  }) => {
    const response = await request(`http://localhost:${APP_PORT}`)
      .post(`${callbackUrl.pathname}${callbackUrl.search}`)
      .send(body);

    await waitForAllJobsToFinish();

    return response;
  };

  const returnInBrowser = async (callbackUrl: URL): Promise<URL> => {
    const response = await request(`http://localhost:${APP_PORT}`).get(
      `${callbackUrl.pathname}${callbackUrl.search}`,
    );

    expect(response.status).toBe(302);
    await waitForAllJobsToFinish();

    return new URL(response.headers.location);
  };

  beforeAll(async () => {
    fixtureDirectory = mkdtempSync(join(tmpdir(), 'app-connection-custom-'));
    onConnectExecutionsPath = join(fixtureDirectory, 'on-connect-executions');

    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
      name: 'Custom flow integration',
      description: 'Custom connection flow authorize and callback',
      sourcePath: 'custom-flow-integration',
    });
    jest.useRealTimers();

    const functions = [
      {
        universalIdentifier: AUTHORIZE_IDENTIFIER,
        name: 'authorize',
        source: AUTHORIZE_SOURCE,
      },
      {
        universalIdentifier: CALLBACK_IDENTIFIER,
        name: 'callback',
        source: CALLBACK_SOURCE,
      },
      {
        universalIdentifier: ON_CONNECT_IDENTIFIER,
        name: 'on-connect',
        source: `import { appendFileSync } from 'node:fs';
export const handler = ({ connectedAccountId }) => {
  appendFileSync(${JSON.stringify(onConnectExecutionsPath)}, connectedAccountId + '\\n');
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

    logicFunctionManifests = functions.map((logicFunction) => ({
      universalIdentifier: logicFunction.universalIdentifier,
      name: logicFunction.name,
      handlerName: 'handler',
      sourceHandlerPath: `src/${logicFunction.name}.ts`,
      builtHandlerPath: `dist/${logicFunction.name}.mjs`,
      builtHandlerChecksum: createHash('sha256')
        .update(logicFunction.source)
        .digest('hex'),
      timeoutSeconds: 10,
    }));

    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: APPLICATION_IDENTIFIER,
        roleId: ROLE_IDENTIFIER,
        overrides: {
          logicFunctions: logicFunctionManifests,
          connectionProviders: [
            {
              universalIdentifier: PROVIDER_IDENTIFIER,
              name: 'hosted-provider',
              displayName: 'Hosted provider',
              type: 'custom',
              custom: {
                authorizeLogicFunction: {
                  universalIdentifier: AUTHORIZE_IDENTIFIER,
                },
                callbackLogicFunction: {
                  universalIdentifier: CALLBACK_IDENTIFIER,
                },
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
    rmSync(onConnectExecutionsPath, { force: true });
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
    rmSync(fixtureDirectory, { recursive: true, force: true });
  });

  it('stores the provider and sends the member to the URL the authorize function returns', async () => {
    expect(provider).toMatchObject({
      type: 'custom',
      oauthConfig: null,
      customConfig: {
        authorizeLogicFunctionUniversalIdentifier: AUTHORIZE_IDENTIFIER,
        callbackLogicFunctionUniversalIdentifier: CALLBACK_IDENTIFIER,
      },
    });

    const callbackUrl = await authorize();

    expect(callbackUrl.pathname).toBe('/auth/apps/custom/callback');
    expect(callbackUrl.searchParams.get('state')).toEqual(expect.any(String));
  });

  it('saves the account the notification reports and runs onConnect for it', async () => {
    const response = await notify({
      callbackUrl: await authorize(),
      body: {
        account_id: 'account-a',
      },
    });
    const [connection] = await readAccounts();

    expect(response.status).toBe(200);
    expect(connection).toMatchObject({
      provider: 'app',
      externalAccountId: 'account-a',
      handle: 'Handle account-a',
      accessToken: null,
      refreshToken: null,
      scope: 'WORKSPACE',
    });
    expect(readOnConnectExecutions()).toEqual([connection.id]);
  });

  it('returns the browser to the app settings without saving anything itself', async () => {
    const redirect = await returnInBrowser(await authorize());

    expect(redirect.searchParams.has('errorMessage')).toBe(false);
    expect(redirect.pathname).toBe(
      `/settings/applications/${provider.applicationId}`,
    );
    expect(await readAccounts()).toHaveLength(0);
    expect(readOnConnectExecutions()).toEqual([]);
  });

  it('stores an access token the callback returns, encrypted', async () => {
    await notify({
      callbackUrl: await authorize(),
      body: {
        account_id: 'account-a',
        token: 'token-a',
      },
    });
    const [connection] = await readAccounts();

    assertIsDefinedOrThrow(connection.accessToken);
    expect(connection.accessToken).not.toBe('token-a');
    expect(
      getAppProviderByClassName<ConnectedAccountTokenEncryptionService>(
        'ConnectedAccountTokenEncryptionService',
      ).decrypt({
        ciphertext: connection.accessToken,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      }),
    ).toBe('token-a');
  });

  it('updates the existing connection and runs onConnect once when the same account is reported again', async () => {
    const callbackUrl = await authorize();

    await notify({ callbackUrl, body: { account_id: 'account-a' } });
    await notify({
      callbackUrl,
      body: { account_id: 'account-a', token: 'token-a' },
    });
    await notify({
      callbackUrl: await authorize(),
      body: { account_id: 'account-a' },
    });

    const connections = await readAccounts();

    expect(connections).toHaveLength(1);
    expect(readOnConnectExecutions()).toEqual([connections[0].id]);
  });

  it('ignores a replayed report for a connection archived after its state was issued', async () => {
    const callbackUrl = await authorize();

    await notify({ callbackUrl, body: { account_id: 'account-a' } });
    const [connection] = await readAccounts();

    await globalThis.testDataSource.query(
      `UPDATE core."connectedAccount" SET "archivedAt" = NOW() + INTERVAL '5 seconds' WHERE id = $1`,
      [connection.id],
    );

    await notify({ callbackUrl, body: { account_id: 'account-a' } });

    const [replayed] = await readAccounts();

    expect(replayed.archivedAt).not.toBeNull();
    expect(readOnConnectExecutions()).toEqual([connection.id]);
  });

  it('restores an archived connection when a new authorization reports it', async () => {
    await notify({
      callbackUrl: await authorize(),
      body: { account_id: 'account-a' },
    });
    const [connection] = await readAccounts();

    await globalThis.testDataSource.query(
      `UPDATE core."connectedAccount" SET "archivedAt" = NOW() - INTERVAL '5 seconds' WHERE id = $1`,
      [connection.id],
    );

    await notify({
      callbackUrl: await authorize(),
      body: { account_id: 'account-a' },
    });

    const connections = await readAccounts();

    expect(connections).toHaveLength(1);
    expect(connections[0].archivedAt).toBeNull();
  });

  it('runs onConnect again when an explicit reconnect reports the same account', async () => {
    await notify({
      callbackUrl: await authorize(),
      body: { account_id: 'account-a' },
    });
    const [original] = await readAccounts();

    await notify({
      callbackUrl: await authorize({
        reconnectingConnectedAccountId: original.id,
      }),
      body: { account_id: 'account-a' },
    });

    expect(readOnConnectExecutions()).toEqual([original.id, original.id]);
  });

  it('keeps the stored token when a later report of the account omits it', async () => {
    await notify({
      callbackUrl: await authorize(),
      body: {
        account_id: 'account-a',
        token: 'token-a',
      },
    });
    const [original] = await readAccounts();

    await notify({
      callbackUrl: await authorize(),
      body: { account_id: 'account-a' },
    });

    const connections = await readAccounts();

    expect(connections).toHaveLength(1);
    expect(connections[0].accessToken).toBe(original.accessToken);
  });

  it('serialises simultaneous reports of one account into one connection', async () => {
    const callbackUrl = await authorize();

    await Promise.all([
      notify({ callbackUrl, body: { account_id: 'account-a' } }),
      notify({ callbackUrl, body: { account_id: 'account-a' } }),
    ]);

    expect(await readAccounts()).toHaveLength(1);
  });

  it('refuses a reconnect that reports a different account and leaves the connection untouched', async () => {
    await notify({
      callbackUrl: await authorize(),
      body: { account_id: 'account-a' },
    });
    const [original] = await readAccounts();

    const response = await notify({
      callbackUrl: await authorize({
        reconnectingConnectedAccountId: original.id,
      }),
      body: { account_id: 'account-b' },
    });
    const connections = await readAccounts();

    expect(response.status).toBe(400);
    expect(connections).toHaveLength(1);
    expect(connections[0]).toMatchObject({
      id: original.id,
      externalAccountId: 'account-a',
    });
  });

  it('saves nothing and skips onConnect when the callback function fails', async () => {
    const response = await notify({
      callbackUrl: await authorize(),
      body: {
        account_id: 'broken',
      },
    });

    expect(response.status).toBe(500);
    expect(await readAccounts()).toHaveLength(0);
    expect(readOnConnectExecutions()).toEqual([]);
  });

  it('refuses turning the provider into an OAuth one and keeps it custom', async () => {
    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: APPLICATION_IDENTIFIER,
        roleId: ROLE_IDENTIFIER,
        overrides: {
          logicFunctions: logicFunctionManifests,
          connectionProviders: [
            {
              universalIdentifier: PROVIDER_IDENTIFIER,
              name: 'hosted-provider',
              displayName: 'Hosted provider',
              type: 'oauth',
              oauth: {
                authorizationEndpoint:
                  'https://hosted-auth.example.com/authorize',
                tokenEndpoint: 'https://hosted-auth.example.com/token',
                scopes: [],
                clientIdVariable: 'CLIENT_ID',
                clientSecretVariable: 'CLIENT_SECRET',
              },
            },
          ],
        },
      }),
      expectToFail: true,
    });

    expect(JSON.stringify(errors)).toContain(
      'Connection provider type cannot be changed after creation',
    );

    const [storedProvider] = await globalThis.testDataSource.query(
      'SELECT type FROM core."connectionProvider" WHERE "universalIdentifier" = $1',
      [PROVIDER_IDENTIFIER],
    );

    expect(storedProvider.type).toBe('custom');
  });

  it('rejects a notification with a tampered state', async () => {
    const callbackUrl = await authorize();

    callbackUrl.searchParams.set(
      'state',
      `${callbackUrl.searchParams.get('state')}tampered`,
    );

    const response = await notify({
      callbackUrl,
      body: { account_id: 'account-a' },
    });

    expect(response.status).toBe(400);
    expect(await readAccounts()).toHaveLength(0);
  });
});
