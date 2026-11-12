import { http, HttpResponse } from 'msw';
import request from 'supertest';
import { buildBaseManifest } from 'test/integration/metadata/suites/application/utils/build-base-manifest.util';
import { cleanupApplicationAndAppRegistration } from 'test/integration/metadata/suites/application/utils/cleanup-application-and-app-registration.util';
import { setupApplicationForSync } from 'test/integration/metadata/suites/application/utils/setup-application-for-sync.util';
import { syncApplication } from 'test/integration/metadata/suites/application/utils/sync-application.util';
import { readFlowCookie } from 'test/integration/metadata/suites/connection-provider/utils/read-flow-cookie.util';
import { buildSignedInBrowserHeaders } from 'test/integration/metadata/suites/connection-provider/utils/build-signed-in-browser-headers.util';
import { generateTransientTokenResponse } from 'test/integration/utils/generate-transient-token.util';
import { getAppProviderByClassName } from 'test/integration/utils/get-app-provider-by-class-name.util';
import { setupHttpMock } from 'test/integration/utils/http-mock.util';
import { waitForAllJobsToFinish } from 'test/integration/utils/wait-for-all-jobs-to-finish.util';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { v4 } from 'uuid';
import { z } from 'zod';

import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { type ConnectionProviderOAuthClientEntity } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/entities/connection-provider-oauth-client.entity';
import { type TwentyConfigService } from 'src/engine/core-modules/twenty-config/twenty-config.service';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type ConnectedAccountTokenEncryptionService } from 'src/engine/metadata-modules/connected-account/services/connected-account-token-encryption.service';
import { SEED_APPLE_WORKSPACE_ID } from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';

const APPLICATION_IDENTIFIER = v4();
const PROVIDER_IDENTIFIER = v4();
const RESOURCE_URL = 'https://mcp-resource.example.com/mcp';
const RESOURCE_METADATA_URL =
  'https://mcp-resource.example.com/.well-known/oauth-protected-resource/mcp';
const AUTHORIZATION_SERVER_URL = 'https://mcp-authorization.example.com';
const REGISTERED_CLIENT_ID = 'registered-twenty-client';

describe('app connection OAuth discovery flow', () => {
  let provider: ConnectionProviderEntity;
  let registrationCount: number;
  let tokenRequests: URLSearchParams[];

  setupHttpMock(
    http.post(
      RESOURCE_URL,
      () =>
        new HttpResponse(null, {
          status: 401,
          headers: {
            'WWW-Authenticate': `Bearer resource_metadata="${RESOURCE_METADATA_URL}"`,
          },
        }),
    ),
    http.get(RESOURCE_METADATA_URL, () =>
      HttpResponse.json({
        resource: RESOURCE_URL,
        authorization_servers: [AUTHORIZATION_SERVER_URL],
      }),
    ),
    http.get(
      `${AUTHORIZATION_SERVER_URL}/.well-known/oauth-authorization-server`,
      () =>
        HttpResponse.json({
          issuer: AUTHORIZATION_SERVER_URL,
          authorization_endpoint: `${AUTHORIZATION_SERVER_URL}/authorize`,
          token_endpoint: `${AUTHORIZATION_SERVER_URL}/token`,
          registration_endpoint: `${AUTHORIZATION_SERVER_URL}/register`,
          response_types_supported: ['code'],
          grant_types_supported: ['authorization_code', 'refresh_token'],
          code_challenge_methods_supported: ['S256'],
          token_endpoint_auth_methods_supported: ['none'],
        }),
    ),
    http.post(
      `${AUTHORIZATION_SERVER_URL}/register`,
      async ({ request: registrationRequest }) => {
        registrationCount += 1;

        return HttpResponse.json(
          {
            client_id: REGISTERED_CLIENT_ID,
            ...z
              .record(z.string(), z.unknown())
              .parse(await registrationRequest.json()),
          },
          { status: 201 },
        );
      },
    ),
    http.get(
      `${AUTHORIZATION_SERVER_URL}/authorize`,
      () => new HttpResponse('<html>Sign in</html>', { status: 200 }),
    ),
    http.post(
      `${AUTHORIZATION_SERVER_URL}/token`,
      async ({ request: tokenRequest }) => {
        const params = new URLSearchParams(await tokenRequest.text());

        tokenRequests.push(params);

        if (params.get('code') === 'rejected-client-code') {
          return HttpResponse.json(
            { error: 'invalid_client' },
            { status: 401 },
          );
        }

        return HttpResponse.json({
          access_token: `access-${params.get('code')}`,
          refresh_token: `refresh-${params.get('code')}`,
          token_type: 'Bearer',
          expires_in: 3600,
          scope: 'read',
        });
      },
    ),
  );

  const readAccounts = (): Promise<ConnectedAccountEntity[]> =>
    globalThis.testDataSource.query(
      'SELECT * FROM core."connectedAccount" WHERE "connectionProviderId" = $1 ORDER BY "createdAt", id',
      [provider.id],
    );

  const readStoredClients = (): Promise<
    ConnectionProviderOAuthClientEntity[]
  > =>
    globalThis.testDataSource.query(
      'SELECT * FROM core."connectionProviderOAuthClient" WHERE "connectionProviderId" = $1',
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

  const getServerUrl = () =>
    getAppProviderByClassName<TwentyConfigService>('TwentyConfigService').get(
      'SERVER_URL',
    );

  let browserCookie: string | undefined;

  const authorize = async (): Promise<URL> => {
    const transient = await generateTransientTokenResponse({
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    expect(transient.errors).toBeUndefined();

    const transientToken =
      transient.data.generateTransientToken.transientToken.token;
    const response = await request(`http://localhost:${APP_PORT}`)
      .get('/auth/apps/authorize')
      .set(
        await buildSignedInBrowserHeaders({
          transientToken,
          flowCookie: browserCookie,
        }),
      )
      .query({
        applicationId: provider.applicationId,
        providerName: provider.name,
        transientToken,
      });

    expect(response.status).toBe(302);
    browserCookie = readFlowCookie(response);

    return new URL(response.headers.location);
  };

  const getState = (authorizationUrl: URL): string => {
    const state = authorizationUrl.searchParams.get('state');

    assertIsDefinedOrThrow(state);

    return state;
  };

  const decodeStatePayload = (state: string): Record<string, unknown> =>
    JSON.parse(Buffer.from(state.split('.')[1], 'base64url').toString());

  const callback = async ({
    state,
    code,
  }: {
    state: string;
    code: string;
  }): Promise<URL> => {
    const response = await request(`http://localhost:${APP_PORT}`)
      .get('/auth/apps/callback')
      .set('Cookie', browserCookie ?? '')
      .query({ state, code });

    expect(response.status).toBe(302);
    await waitForAllJobsToFinish();

    return new URL(response.headers.location);
  };

  beforeAll(async () => {
    await setupApplicationForSync({
      applicationUniversalIdentifier: APPLICATION_IDENTIFIER,
      name: 'OAuth discovery integration',
      description: 'Sign-in to a resource that publishes its OAuth settings',
      sourcePath: 'oauth-discovery-integration',
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
              name: 'discovery-provider',
              displayName: 'Discovery provider',
              type: 'oauth-discovery',
              oauthDiscovery: { resourceUrl: RESOURCE_URL },
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

  beforeEach(async () => {
    registrationCount = 0;
    tokenRequests = [];
    browserCookie = undefined;
    await globalThis.testDataSource.query(
      'DELETE FROM core."connectionProviderOAuthClient" WHERE "connectionProviderId" = $1',
      [provider.id],
    );
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

  it('publishes the client metadata document authorization servers identify Twenty with', async () => {
    const response = await request(`http://localhost:${APP_PORT}`).get(
      '/auth/apps/client-metadata.json',
    );

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      client_id: `${getServerUrl()}/auth/apps/client-metadata.json`,
      client_name: 'Twenty',
      redirect_uris: [`${getServerUrl()}/auth/apps/callback`],
      token_endpoint_auth_method: 'none',
    });
  });

  it('discovers the authorization server, registers a client and redirects with PKCE and a resource indicator', async () => {
    const authorizationUrl = await authorize();
    const statePayload = decodeStatePayload(getState(authorizationUrl));
    const storedClients = await readStoredClients();

    expect(authorizationUrl.origin).toBe(AUTHORIZATION_SERVER_URL);
    expect(authorizationUrl.pathname).toBe('/authorize');
    expect(authorizationUrl.searchParams.get('client_id')).toBe(
      REGISTERED_CLIENT_ID,
    );
    expect(authorizationUrl.searchParams.get('code_challenge_method')).toBe(
      'S256',
    );
    expect(authorizationUrl.searchParams.get('resource')).toBe(RESOURCE_URL);
    expect(authorizationUrl.searchParams.get('redirect_uri')).toBe(
      `${getServerUrl()}/auth/apps/callback`,
    );
    expect(statePayload.flowSecretId).toEqual(expect.any(String));
    expect(statePayload).not.toHaveProperty('codeVerifier');
    expect(registrationCount).toBe(1);
    expect(storedClients).toHaveLength(1);
    expect(storedClients[0]).toMatchObject({
      registrationMethod: 'DYNAMIC_CLIENT_REGISTRATION',
      clientId: REGISTERED_CLIENT_ID,
      clientSecret: null,
      tokenEndpointAuthMethod: 'none',
      redirectUri: `${getServerUrl()}/auth/apps/callback`,
    });
  });

  it('exchanges the code as a public client bound to the resource and stores the connection', async () => {
    const state = getState(await authorize());
    const redirect = await callback({ state: state, code: 'first-code' });
    const [connection] = await readAccounts();
    const [tokenRequest] = tokenRequests;

    expect(redirect.searchParams.get('errorMessage')).toBeNull();
    expect(tokenRequests).toHaveLength(1);
    expect(tokenRequest.get('grant_type')).toBe('authorization_code');
    expect(tokenRequest.get('code')).toBe('first-code');
    expect(tokenRequest.get('client_id')).toBe(REGISTERED_CLIENT_ID);
    expect(tokenRequest.get('client_secret')).toBeNull();
    expect(tokenRequest.get('code_verifier')).toEqual(expect.any(String));
    expect(tokenRequest.get('resource')).toBe(RESOURCE_URL);
    expect(tokenRequest.get('redirect_uri')).toBe(
      `${getServerUrl()}/auth/apps/callback`,
    );
    expect(connection).toMatchObject({ scopes: ['read'] });
    expect(decryptAccessToken(connection)).toBe('access-first-code');
  });

  it('reuses the stored client for the next sign-in instead of registering again', async () => {
    await authorize();
    const secondAuthorizationUrl = await authorize();

    expect(secondAuthorizationUrl.searchParams.get('client_id')).toBe(
      REGISTERED_CLIENT_ID,
    );
    expect(registrationCount).toBe(1);
    expect(await readStoredClients()).toHaveLength(1);
  });

  it('forgets the stored client once the token endpoint rejects it', async () => {
    const state = getState(await authorize());

    const redirect = await callback({
      state: state,
      code: 'rejected-client-code',
    });

    expect(redirect.searchParams.get('errorMessage')).toEqual(
      expect.any(String),
    );
    expect(await readStoredClients()).toHaveLength(0);
    expect(await readAccounts()).toHaveLength(0);
  });

  it('completes two sign-ins started in the same browser', async () => {
    const firstState = getState(await authorize());
    const secondState = getState(await authorize());

    const firstRedirect = await callback({
      state: firstState,
      code: 'first-code',
    });
    const secondRedirect = await callback({
      state: secondState,
      code: 'second-code',
    });

    expect(firstRedirect.searchParams.get('errorMessage')).toBeNull();
    expect(secondRedirect.searchParams.get('errorMessage')).toBeNull();
    expect(tokenRequests.map((params) => params.get('code'))).toEqual([
      'first-code',
      'second-code',
    ]);
  });

  it('refuses a callback whose flow secrets were already consumed', async () => {
    const state = getState(await authorize());

    await callback({ state: state, code: 'first-code' });
    await callback({ state: state, code: 'replayed-code' });

    expect(tokenRequests.map((params) => params.get('code'))).toEqual([
      'first-code',
    ]);
    expect(await readAccounts()).toHaveLength(1);
  });
});
