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
import {
  type LogicFunctionManifest,
  type Manifest,
} from 'twenty-shared/application';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { z } from 'zod';

import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { type LegacyAppOAuthStateJwtPayload } from 'src/engine/core-modules/auth/types/app-oauth-state-jwt-payload.type';
import { type JwtPayload } from 'src/engine/core-modules/auth/types/jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { plaintextStringSchema } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const APPLICATION_IDENTIFIER = v4();
const PROVIDER_IDENTIFIER = v4();
const IDENTIFY_ACCOUNT_IDENTIFIER = v4();
const ON_CONNECT_IDENTIFIER = v4();
const TOKEN_ENDPOINT = 'https://connection-provider.example.com/token';

// The token endpoint echoes the authorization code as the access token, and
// the identify function reads the account from its "<account>:<suffix>" shape.
const IDENTIFY_ACCOUNT_SOURCE = `export const handler = ({ accessToken }) => {
  const [account] = accessToken.split(':');
  if (account === 'unidentifiable') return { externalAccountId: null };
  if (account === 'silent') return;
  if (account === 'broken') throw new Error('upstream identity endpoint failed');
  return { externalAccountId: account, handle: 'Handle ' + account };
};`;

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

  const decryptAccessToken = (connectedAccount: ConnectedAccountEntity) => {
    const encryption =
      getAppProviderByClassName<ConnectedAccountTokenEncryptionService>(
        'ConnectedAccountTokenEncryptionService',
      );

    assertIsDefinedOrThrow(connectedAccount.accessToken);

    return encryption.decrypt({
      ciphertext: connectedAccount.accessToken,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
    });
  };

  const authorize = async ({
    reconnectingConnectedAccountId,
  }: {
    reconnectingConnectedAccountId?: string;
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
        scope: 'WORKSPACE',
        reconnectingConnectedAccountId,
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
      description: 'Callback account identification and onConnect execution',
      sourcePath: 'oauth-callback-integration',
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

  it('stores the identified account on first connect and runs onConnect for it', async () => {
    const redirect = await callback(await authorize(), 'team-a:first');
    const [connection] = await readAccounts();

    expect(redirect.searchParams.get('errorMessage')).toBeNull();
    expect(connection).toMatchObject({
      externalAccountId: 'team-a',
      handle: 'Handle team-a',
    });
    expect(readExecutions(onConnectExecutionsPath)).toEqual([connection.id]);
  });

  it('replaces credentials on the same connection when the reconnect resolves to the same account', async () => {
    await callback(await authorize(), 'team-a:first');
    const [original] = await readAccounts();

    const redirect = await callback(
      await authorize({ reconnectingConnectedAccountId: original.id }),
      'team-a:second',
    );
    const connections = await readAccounts();

    expect(redirect.searchParams.has('errorMessage')).toBe(false);
    expect(connections).toHaveLength(1);
    expect(connections[0]).toMatchObject({
      id: original.id,
      externalAccountId: 'team-a',
    });
    expect(decryptAccessToken(connections[0])).toBe('team-a:second');
    expect(readExecutions(onConnectExecutionsPath)).toEqual([
      original.id,
      original.id,
    ]);
  });

  it('refuses a reconnect that resolves to a different account and leaves the connection untouched', async () => {
    await callback(await authorize(), 'team-a:first');
    const [original] = await readAccounts();

    const redirect = await callback(
      await authorize({ reconnectingConnectedAccountId: original.id }),
      'team-b:first',
    );
    const connections = await readAccounts();

    expect(redirect.searchParams.get('errorMessage')).toContain(
      'Handle team-b',
    );
    expect(redirect.searchParams.get('errorMessage')).toContain(
      'Handle team-a',
    );
    expect(connections).toHaveLength(1);
    expect(connections[0]).toMatchObject({
      id: original.id,
      externalAccountId: 'team-a',
      handle: 'Handle team-a',
    });
    expect(decryptAccessToken(connections[0])).toBe('team-a:first');
    expect(readExecutions(onConnectExecutionsPath)).toEqual([original.id]);
  });

  it('pins the identified account on a reconnect target that predates identification', async () => {
    await callback(await authorize(), 'team-a:first');
    const [original] = await readAccounts();

    await globalThis.testDataSource.query(
      'UPDATE core."connectedAccount" SET "externalAccountId" = NULL WHERE id = $1',
      [original.id],
    );

    const redirect = await callback(
      await authorize({ reconnectingConnectedAccountId: original.id }),
      'team-b:first',
    );
    const [reconnected] = await readAccounts();

    expect(redirect.searchParams.has('errorMessage')).toBe(false);
    expect(reconnected).toMatchObject({
      id: original.id,
      externalAccountId: 'team-b',
    });
  });

  it('keeps the previous behaviour when the identify function opts out', async () => {
    const redirect = await callback(await authorize(), 'unidentifiable:first');
    const [connection] = await readAccounts();

    expect(redirect.searchParams.has('errorMessage')).toBe(false);
    expect(connection.externalAccountId).toBeNull();
    expect(readExecutions(onConnectExecutionsPath)).toEqual([connection.id]);
  });

  it('clears the stored account when a reconnect opts out', async () => {
    await callback(await authorize(), 'team-a:first');
    const [original] = await readAccounts();

    const redirect = await callback(
      await authorize({ reconnectingConnectedAccountId: original.id }),
      'unidentifiable:second',
    );
    const connections = await readAccounts();

    expect(redirect.searchParams.has('errorMessage')).toBe(false);
    expect(connections).toHaveLength(1);
    expect(connections[0]).toMatchObject({
      id: original.id,
      externalAccountId: null,
    });
    expect(decryptAccessToken(connections[0])).toBe('unidentifiable:second');
  });

  it('saves nothing and skips onConnect when the identify function returns nothing', async () => {
    const redirect = await callback(await authorize(), 'silent:first');

    expect(redirect.searchParams.get('errorMessage')).toContain(
      'invalid result',
    );
    expect(await readAccounts()).toEqual([]);
    expect(readExecutions(onConnectExecutionsPath)).toEqual([]);
  });

  it('saves nothing and skips onConnect when the identify function fails', async () => {
    const redirect = await callback(await authorize(), 'broken:first');

    expect(redirect.searchParams.get('errorMessage')).toContain(
      'upstream identity endpoint failed',
    );
    expect(redirect.searchParams.get('errorMessage')).not.toContain(
      'broken:first',
    );
    expect(await readAccounts()).toEqual([]);
    expect(readExecutions(onConnectExecutionsPath)).toEqual([]);
  });

  it('completes the callback for a state signed before visibility was renamed to scope', async () => {
    const legacyStatePayload: LegacyAppOAuthStateJwtPayload = {
      sub: provider.id,
      type: JwtTokenTypeEnum.APP_OAUTH_STATE,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      connectionProviderId: provider.id,
      userId: USER_DATA_SEED_IDS.JANE,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JANE,
      visibility: 'workspace',
      reconnectingConnectedAccountId: null,
      redirectLocation: null,
      codeVerifier: null,
    };
    const legacyState = await getAppProviderByClassName<JwtWrapperService>(
      'JwtWrapperService',
    ).signAsyncOrThrow(legacyStatePayload as unknown as JwtPayload, {
      expiresIn: 60,
    });

    const redirect = await callback(legacyState, 'team-a:first');

    expect(redirect.searchParams.get('errorMessage')).toBeNull();
    expect(await readAccounts()).toMatchObject([
      { scope: 'WORKSPACE', externalAccountId: 'team-a' },
    ]);
  });

  it('rejects tampered state before exchanging a code or executing the app', async () => {
    const state = await authorize();
    const redirect = await callback(`${state}invalid`, 'team-a:first');

    expect(redirect.searchParams.get('errorMessage')).toContain(
      'invalid or expired',
    );
    expect(tokenExchanges).toEqual([]);
    expect(readExecutions(onConnectExecutionsPath)).toEqual([]);
    expect(await readAccounts()).toEqual([]);
  });

  describe('identify function owned by another application', () => {
    const OTHER_APPLICATION_IDENTIFIER = v4();
    const OTHER_IDENTIFY_ACCOUNT_IDENTIFIER = v4();
    const OTHER_ROLE_IDENTIFIER = v4();
    let otherIdentifyExecutionsPath: string;
    let otherLogicFunctionManifest: LogicFunctionManifest;

    const buildOtherApplicationManifest = (
      connectionProviders: Manifest['connectionProviders'] = [],
    ) =>
      buildBaseManifest({
        appId: OTHER_APPLICATION_IDENTIFIER,
        roleId: OTHER_ROLE_IDENTIFIER,
        overrides: {
          roles: [
            {
              universalIdentifier: OTHER_ROLE_IDENTIFIER,
              label: 'Other application role',
            },
          ],
          logicFunctions: [otherLogicFunctionManifest],
          connectionProviders,
        },
      });

    beforeAll(async () => {
      otherIdentifyExecutionsPath = join(
        fixtureDirectory,
        'other-identify-executions',
      );

      const source = `import { appendFileSync } from 'node:fs';
export const handler = () => {
  appendFileSync(${JSON.stringify(otherIdentifyExecutionsPath)}, 'executed\\n');
  return { externalAccountId: 'other-application' };
};`;

      await setupApplicationForSync({
        applicationUniversalIdentifier: OTHER_APPLICATION_IDENTIFIER,
        name: 'OAuth callback other application',
        description: 'Owns a logic function another app tries to use',
        sourcePath: 'oauth-callback-other-application',
      });
      jest.useRealTimers();

      const uploaded = await uploadApplicationFile({
        applicationUniversalIdentifier: OTHER_APPLICATION_IDENTIFIER,
        fileFolder: 'BuiltLogicFunction',
        filePath: 'dist/other-identify-account.mjs',
        filename: 'other-identify-account.mjs',
        contentType: 'application/javascript',
        fileBuffer: Buffer.from(source),
      });

      expect(uploaded.errors).toBeUndefined();

      otherLogicFunctionManifest = {
        universalIdentifier: OTHER_IDENTIFY_ACCOUNT_IDENTIFIER,
        name: 'other-identify-account',
        handlerName: 'handler',
        sourceHandlerPath: 'src/other-identify-account.ts',
        builtHandlerPath: 'dist/other-identify-account.mjs',
        builtHandlerChecksum: createHash('sha256').update(source).digest('hex'),
        timeoutSeconds: 10,
      };

      const { errors } = await syncApplication({
        manifest: buildOtherApplicationManifest(),
      });

      expect(errors).toBeUndefined();
      jest.useRealTimers();
    }, 120000);

    beforeEach(() => {
      rmSync(otherIdentifyExecutionsPath, { force: true });
    });

    afterAll(async () => {
      await cleanupApplicationAndAppRegistration({
        applicationUniversalIdentifier: OTHER_APPLICATION_IDENTIFIER,
      });
    });

    it('refuses to install a provider that references it without writing anything', async () => {
      const foreignProviderIdentifier = v4();
      const manifest = buildOtherApplicationManifest([
        {
          universalIdentifier: foreignProviderIdentifier,
          name: 'foreign-identify-provider',
          displayName: 'Foreign identify provider',
          type: 'oauth',
          oauth: {
            authorizationEndpoint:
              'https://connection-provider.example.com/authorize',
            tokenEndpoint: TOKEN_ENDPOINT,
            scopes: ['read'],
            clientIdVariable: 'CLIENT_ID',
            clientSecretVariable: 'CLIENT_SECRET',
          },
          identifyAccountLogicFunction: {
            universalIdentifier: IDENTIFY_ACCOUNT_IDENTIFIER,
          },
        },
      ]);

      for (const dryRun of [true, false]) {
        const { errors } = await syncApplication({
          manifest,
          dryRun,
          expectToFail: true,
        });

        expect(errors?.[0]?.message).toContain(
          'identifyAccount logic function of connection provider foreign-identify-provider',
        );
      }

      expect(
        await globalThis.testDataSource.query(
          'SELECT id FROM core."connectionProvider" WHERE "universalIdentifier" = $1',
          [foreignProviderIdentifier],
        ),
      ).toEqual([]);
    });

    it('does not run it for a provider that already references it', async () => {
      await globalThis.testDataSource.query(
        'UPDATE core."connectionProvider" SET "identifyAccountLogicFunctionUniversalIdentifier" = $1 WHERE id = $2',
        [OTHER_IDENTIFY_ACCOUNT_IDENTIFIER, provider.id],
      );

      try {
        const redirect = await callback(await authorize(), 'team-a:first');

        expect(redirect.searchParams.get('errorMessage')).toContain(
          'not found in its application',
        );
        expect(await readAccounts()).toEqual([]);
        expect(readExecutions(otherIdentifyExecutionsPath)).toEqual([]);
        expect(readExecutions(onConnectExecutionsPath)).toEqual([]);
      } finally {
        await globalThis.testDataSource.query(
          'UPDATE core."connectionProvider" SET "identifyAccountLogicFunctionUniversalIdentifier" = $1 WHERE id = $2',
          [IDENTIFY_ACCOUNT_IDENTIFIER, provider.id],
        );
      }
    });
  });
});
