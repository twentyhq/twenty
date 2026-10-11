import { createHash } from 'crypto';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { http, HttpResponse } from 'msw';
import request from 'supertest';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { uploadApplicationFile } from 'test/integration/metadata/suites/application/utils/upload-application-file.util';
import { generateTransientTokenResponse } from 'test/integration/utils/generate-transient-token.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { setupHttpMock } from 'test/integration/utils/http-mock.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { z } from 'zod';

import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { plaintextStringSchema } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const APPLICATION_IDENTIFIER = v4();
const PROVIDER_IDENTIFIER = v4();
const ON_CONNECT_IDENTIFIER = v4();
const TOKEN_ENDPOINT = 'https://connection-provider.example.com/token';

describe('app connection OAuth callback', () => {
  let provider: ConnectionProviderEntity;
  let fixtureDirectory: string;
  let onConnectExecutionsPath: string;
  let tokenExchanges: string[];

  setupHttpMock(
    http.post(TOKEN_ENDPOINT, async ({ request: tokenRequest }) => {
      const { code } = z
        .object({ code: z.string().min(1) })
        .parse(await tokenRequest.json());

      tokenExchanges.push(code);

      return HttpResponse.json({
        access_token: code,
        refresh_token: `refresh-${code}`,
        token_type: 'Bearer',
        scope: 'read',
      });
    }),
  );

  const readExecutions = (path: string): string[] =>
    existsSync(path) ? readFileSync(path, 'utf8').trim().split('\n') : [];

  const readAccounts = (): Promise<ConnectedAccountEntity[]> =>
    globalThis.testDataSource.query(
      'SELECT * FROM core."connectedAccount" WHERE "connectionProviderId" = $1 ORDER BY "createdAt", id',
      [provider.id],
    );

  const authorize = async ({
    reconnectingConnectedAccountId,
    redirectLocation,
  }: {
    reconnectingConnectedAccountId?: string;
    redirectLocation?: string;
  } = {}): Promise<string> => {
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
        visibility: 'workspace',
        reconnectingConnectedAccountId,
        redirectLocation,
      });

    expect(response.status).toBe(302);
    const authorizationUrl = new URL(response.headers.location);

    expect(authorizationUrl.origin).toBe(
      'https://connection-provider.example.com',
    );
    const state = authorizationUrl.searchParams.get('state');

    assertIsDefinedOrThrow(state);

    return state;
  };

  const callback = async (state: string, code: string): Promise<URL> => {
    const response = await request(`http://localhost:${APP_PORT}`)
      .get('/auth/apps/callback')
      .query({ state, code });

    expect(response.status).toBe(302);
    await waitForAllJobsToFinish();

    return new URL(response.headers.location);
  };

  beforeAll(async () => {
    fixtureDirectory = mkdtempSync(join(tmpdir(), 'app-connection-callback-'));
    onConnectExecutionsPath = join(fixtureDirectory, 'on-connect-executions');

    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
      name: 'OAuth callback integration',
      description: 'Callback persistence and onConnect execution',
      sourcePath: 'oauth-callback-integration',
    });
    jest.useRealTimers();

    const functions = [
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

    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: APPLICATION_IDENTIFIER,
        roleId: v4(),
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
              name: 'callback-provider',
              displayName: 'Callback provider',
              type: 'oauth',
              oauth: {
                authorizationEndpoint:
                  'https://connection-provider.example.com/authorize',
                tokenEndpoint: TOKEN_ENDPOINT,
                scopes: ['read'],
                clientIdVariable: 'CLIENT_ID',
                clientSecretVariable: 'CLIENT_SECRET',
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
    const encryption = getAppProviderByClassName<SecretEncryptionService>(
      'SecretEncryptionService',
    );

    for (const key of ['CLIENT_ID', 'CLIENT_SECRET']) {
      await globalThis.testDataSource.query(
        `INSERT INTO core."applicationRegistrationVariable" (key, "encryptedValue", "applicationRegistrationId")
         SELECT $1, $2, "applicationRegistrationId" FROM core.application WHERE id = $3`,
        [
          key,
          encryption.encryptVersioned(
            plaintextStringSchema.parse(`test-${key}`),
          ),
          provider.applicationId,
        ],
      );
    }
  }, 120000);

  beforeEach(() => {
    tokenExchanges = [];
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

  it('saves the connection and runs onConnect for it', async () => {
    const redirect = await callback(await authorize(), 'account-a');
    const [connection] = await readAccounts();

    expect(redirect.searchParams.get('errorMessage')).toBeNull();
    expect(redirect.pathname).toBe(
      `/settings/applications/${provider.applicationId}`,
    );
    expect(redirect.hash).toBe('#settings');
    expect(connection.externalAccountId).toBeNull();
    expect(readExecutions(onConnectExecutionsPath)).toEqual([connection.id]);
  });

  it('keeps a separate connection per Add until the app deduplicates', async () => {
    await callback(await authorize(), 'account-a');
    await callback(await authorize(), 'account-a-new-token');
    const connections = await readAccounts();

    expect(connections).toHaveLength(2);
    expect(readExecutions(onConnectExecutionsPath)).toEqual(
      connections.map(({ id }) => id),
    );
  });

  it('keeps the requested return page', async () => {
    const returnPage = `/settings/applications/${provider.applicationId}?tab=account#general`;
    const redirect = await callback(
      await authorize({ redirectLocation: returnPage }),
      'account-a',
    );

    expect(redirect.pathname).toBe(
      `/settings/applications/${provider.applicationId}`,
    );
    expect(redirect.searchParams.get('tab')).toBe('account');
    expect(redirect.hash).toBe('#general');
  });

  it('replaces credentials on the selected connection and runs onConnect again on reconnect', async () => {
    await callback(await authorize(), 'account-a');
    const [original] = await readAccounts();
    const redirect = await callback(
      await authorize({ reconnectingConnectedAccountId: original.id }),
      'account-a-new-token',
    );
    const [reconnected] = await readAccounts();
    const encryption =
      getAppProviderByClassName<ConnectedAccountTokenEncryptionService>(
        'ConnectedAccountTokenEncryptionService',
      );

    assertIsDefinedOrThrow(reconnected.accessToken);
    expect(redirect.searchParams.has('errorMessage')).toBe(false);
    expect(reconnected.id).toBe(original.id);
    expect(
      encryption.decrypt({
        ciphertext: reconnected.accessToken,
        workspaceId: SEED_APPLE_WORKSPACE_ID,
      }),
    ).toBe('account-a-new-token');
    expect(readExecutions(onConnectExecutionsPath)).toEqual([
      original.id,
      original.id,
    ]);
  });

  it('rejects tampered state before exchanging a code or executing the app', async () => {
    const state = await authorize();
    const redirect = await callback(`${state}invalid`, 'account-a');

    expect(redirect.searchParams.get('errorMessage')).toContain(
      'invalid or expired',
    );
    expect(tokenExchanges).toEqual([]);
    expect(readExecutions(onConnectExecutionsPath)).toEqual([]);
    expect(await readAccounts()).toEqual([]);
  });
});
