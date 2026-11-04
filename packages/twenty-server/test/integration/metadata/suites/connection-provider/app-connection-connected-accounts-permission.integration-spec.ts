import { http, HttpResponse } from 'msw';
import request from 'supertest';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { generateTransientTokenResponse } from 'test/integration/utils/generate-transient-token.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { setupHttpMock } from 'test/integration/utils/http-mock.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { z } from 'zod';

import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { type AppOAuthStateJwtPayload } from 'src/engine/core-modules/auth/types/app-oauth-state-jwt-payload.type';
import { JwtTokenTypeEnum } from 'src/engine/core-modules/auth/types/jwt-token-type.enum';
import { type JwtWrapperService } from 'src/engine/core-modules/jwt/services/jwt-wrapper.service';
import { plaintextStringSchema } from 'src/engine/core-modules/secret-encryption/branded-strings/plaintext-string.type';
import { type SecretEncryptionService } from 'src/engine/core-modules/secret-encryption/secret-encryption.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';
import { USER_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-users.util';

const APPLICATION_IDENTIFIER = v4();
const PROVIDER_IDENTIFIER = v4();
const AUTHORIZATION_ENDPOINT =
  'https://connected-accounts-permission.example.com/authorize';
const TOKEN_ENDPOINT =
  'https://connected-accounts-permission.example.com/token';

describe('app connection connected accounts permission', () => {
  let provider: ConnectionProviderEntity;
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

  const readAccounts = (): Promise<ConnectedAccountEntity[]> =>
    globalThis.testDataSource.query(
      'SELECT * FROM core."connectedAccount" WHERE "connectionProviderId" = $1 ORDER BY "createdAt", id',
      [provider.id],
    );

  const authorize = async (accessToken: string): Promise<URL> => {
    const transient = await generateTransientTokenResponse({
      token: accessToken,
    });

    expect(transient.errors).toBeUndefined();

    const response = await request(`http://localhost:${APP_PORT}`)
      .get('/auth/apps/authorize')
      .query({
        applicationId: provider.applicationId,
        providerName: provider.name,
        transientToken:
          transient.data.generateTransientToken.transientToken.token,
        scope: 'USER',
      });

    expect(response.status).toBe(302);

    return new URL(response.headers.location);
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
    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
      name: 'Connected accounts permission integration',
      description: 'User connections require the connected accounts permission',
      sourcePath: 'connected-accounts-permission-integration',
    });
    jest.useRealTimers();

    const { errors } = await syncApplication({
      manifest: buildBaseManifest({
        appId: APPLICATION_IDENTIFIER,
        roleId: v4(),
        overrides: {
          connectionProviders: [
            {
              universalIdentifier: PROVIDER_IDENTIFIER,
              name: 'connected-accounts-permission-provider',
              displayName: 'Connected accounts permission provider',
              type: 'oauth',
              scope: 'USER',
              oauth: {
                authorizationEndpoint: AUTHORIZATION_ENDPOINT,
                tokenEndpoint: TOKEN_ENDPOINT,
                scopes: ['read'],
                clientIdVariable: 'CLIENT_ID',
                clientSecretVariable: 'CLIENT_SECRET',
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
  });

  it('refuses a guest without the connected accounts permission to start a user connection', async () => {
    const redirect = await authorize(APPLE_PHIL_GUEST_ACCESS_TOKEN);

    expect(redirect.origin).not.toBe(new URL(AUTHORIZATION_ENDPOINT).origin);
    expect(redirect.searchParams.get('errorMessage')).toContain(
      'does not have permission',
    );
  });

  it('lets a member with the connected accounts permission connect a user connection', async () => {
    const authorizationUrl = await authorize(APPLE_JONY_MEMBER_ACCESS_TOKEN);

    expect(authorizationUrl.origin).toBe(
      new URL(AUTHORIZATION_ENDPOINT).origin,
    );

    const state = authorizationUrl.searchParams.get('state');

    assertIsDefinedOrThrow(state);

    const redirect = await callback(state, 'jony-code');
    const connections = await readAccounts();

    expect(redirect.searchParams.has('errorMessage')).toBe(false);
    expect(tokenExchanges).toEqual(['jony-code']);
    expect(connections).toHaveLength(1);
    expect(connections[0]).toMatchObject({
      scope: 'USER',
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.JONY,
    });
  });

  it('refuses the callback for a member without the connected accounts permission', async () => {
    const jwtWrapperService =
      getAppProviderByClassName<JwtWrapperService>('JwtWrapperService');

    const statePayload: AppOAuthStateJwtPayload = {
      sub: provider.id,
      type: JwtTokenTypeEnum.APP_OAUTH_STATE,
      connectionProviderId: provider.id,
      workspaceId: SEED_APPLE_WORKSPACE_ID,
      userId: USER_DATA_SEED_IDS.PHIL,
      userWorkspaceId: USER_WORKSPACE_DATA_SEED_IDS.PHIL,
      scope: 'USER',
      reconnectingConnectedAccountId: null,
      redirectLocation: null,
      codeVerifier: null,
    };

    const state = await jwtWrapperService.signAsyncOrThrow(statePayload, {
      expiresIn: '10m',
    });

    const redirect = await callback(state, 'phil-code');

    expect(redirect.searchParams.get('errorMessage')).toContain(
      'does not have permission',
    );
    expect(tokenExchanges).toEqual([]);
    expect(await readAccounts()).toEqual([]);
  });
});
