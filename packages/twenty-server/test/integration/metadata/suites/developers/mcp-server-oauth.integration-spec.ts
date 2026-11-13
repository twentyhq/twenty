import request from 'supertest';
import {
  createMcpServer,
  deleteConnectedAccount,
  deleteMcpServer,
  getMyConnectedAccounts,
  syncMcpServerTools,
  updateMcpServer,
} from 'test/integration/metadata/suites/utils/mcp-server-test.util';
import {
  type FakeMcpServer,
  startFakeMcpServer,
} from 'test/integration/metadata/suites/utils/mcp-server-fake-server.util';
import { buildSignedInBrowserHeaders } from 'test/integration/metadata/suites/connection-provider/utils/build-signed-in-browser-headers.util';
import { readFlowCookie } from 'test/integration/metadata/suites/connection-provider/utils/read-flow-cookie.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { generateTransientTokenResponse } from 'test/integration/utils/generate-transient-token.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { type ConnectionProviderEntity } from 'src/engine/core-modules/application/connection-provider/connection-provider.entity';
import { type ConnectionProviderOAuthClientEntity } from 'src/engine/core-modules/application/connection-provider/oauth-discovery/entities/connection-provider-oauth-client.entity';
import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';

const twentyServer = () => request(`http://localhost:${APP_PORT}`);

type CreatedMcpServer = {
  id: string;
  name: string;
  applicationId: string;
  connectionProviderId: string | null;
  signInScope: 'USER' | 'WORKSPACE' | null;
};

describe('MCP server sign-in through an oauth-discovery connection provider (e2e)', () => {
  let fakeMcpServer: FakeMcpServer;
  let mcpServer: CreatedMcpServer;

  const readConnectionProvider = (
    id: string,
  ): Promise<ConnectionProviderEntity[]> =>
    globalThis.testDataSource.query(
      'SELECT * FROM core."connectionProvider" WHERE id = $1',
      [id],
    );

  const readConnectedAccounts = (
    connectionProviderId: string,
  ): Promise<ConnectedAccountEntity[]> =>
    globalThis.testDataSource.query(
      'SELECT * FROM core."connectedAccount" WHERE "connectionProviderId" = $1 ORDER BY "createdAt"',
      [connectionProviderId],
    );

  const readOAuthClients = (
    connectionProviderId: string,
  ): Promise<ConnectionProviderOAuthClientEntity[]> =>
    globalThis.testDataSource.query(
      'SELECT * FROM core."connectionProviderOAuthClient" WHERE "connectionProviderId" = $1',
      [connectionProviderId],
    );

  const getConnectionProviderId = (): string => {
    assertIsDefinedOrThrow(mcpServer.connectionProviderId);

    return mcpServer.connectionProviderId;
  };

  const expireAccessToken = ({
    shouldClearAuthFailure = false,
  }: { shouldClearAuthFailure?: boolean } = {}) =>
    globalThis.testDataSource.query(
      `UPDATE core."connectedAccount" SET "accessTokenExpiresAt" = now() - interval '1 hour', "lastCredentialsRefreshedAt" = now() - interval '2 hours'${shouldClearAuthFailure ? ', "authFailedAt" = NULL, "authFailedReason" = NULL' : ''} WHERE "connectionProviderId" = $1`,
      [getConnectionProviderId()],
    );

  let browserCookie: string | undefined;

  const requestAuthorization = async ({
    reconnectingConnectedAccountId,
    accessToken = APPLE_JANE_ADMIN_ACCESS_TOKEN,
  }: {
    reconnectingConnectedAccountId?: string;
    accessToken?: string;
  } = {}): Promise<URL> => {
    const [connectionProvider] = await readConnectionProvider(
      getConnectionProviderId(),
    );
    const transient = await generateTransientTokenResponse({
      token: accessToken,
    });
    const transientToken =
      transient.data.generateTransientToken.transientToken.token;

    const response = await twentyServer()
      .get('/auth/apps/authorize')
      .set(
        await buildSignedInBrowserHeaders({
          transientToken,
          flowCookie: browserCookie,
        }),
      )
      .query({
        applicationId: mcpServer.applicationId,
        providerName: connectionProvider.name,
        transientToken,
        ...(reconnectingConnectedAccountId && {
          reconnectingConnectedAccountId,
        }),
      });

    expect(response.status).toBe(302);
    browserCookie = readFlowCookie(response) ?? browserCookie;

    return new URL(response.headers.location);
  };

  const signIn = async ({
    reconnectingConnectedAccountId,
  }: {
    reconnectingConnectedAccountId?: string;
  } = {}): Promise<URL> => {
    const authorizationUrl = await requestAuthorization({
      reconnectingConnectedAccountId,
    });
    const authorizationResponse = await fetch(authorizationUrl, {
      redirect: 'manual',
    });
    const callbackLocation = authorizationResponse.headers.get('location');

    assertIsDefinedOrThrow(callbackLocation);

    const callbackUrl = new URL(callbackLocation);
    const callbackResponse = await twentyServer()
      .get(callbackUrl.pathname)
      .set('Cookie', browserCookie ?? '')
      .query(Object.fromEntries(callbackUrl.searchParams));

    expect(callbackResponse.status).toBe(302);

    return new URL(callbackResponse.headers.location);
  };

  beforeAll(async () => {
    await updateFeatureFlag({
      featureFlag: FeatureFlagKey.IS_MCP_SERVERS_ENABLED,
      value: true,
      expectToFail: false,
    });
    await updateConfigVariable({
      input: {
        key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS',
        value: ['127.0.0.1'],
      },
    });
    fakeMcpServer = await startFakeMcpServer({ isSignInRequired: true });

    const response = await createMcpServer({
      name: `oauth_${uuidv4().slice(0, 8)}`,
      label: 'Fake OAuth docs',
      url: fakeMcpServer.url,
    });

    expect(response.body.errors).toBeUndefined();
    mcpServer = response.body.data.createMcpServer;
  });

  afterAll(async () => {
    await deleteMcpServer(mcpServer.id);
    await fakeMcpServer.close();
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS', value: [] },
    });
  });

  it('gives a server that asks for sign-in its own oauth-discovery connection provider', async () => {
    const [connectionProvider] = await readConnectionProvider(
      getConnectionProviderId(),
    );

    expect(mcpServer.signInScope).toBe('USER');
    expect(connectionProvider).toMatchObject({
      type: 'oauth-discovery',
      scope: 'USER',
      displayName: 'Fake OAuth docs',
      oauthConfig: null,
      oauthDiscoveryConfig: { resourceUrl: fakeMcpServer.url },
      applicationId: mcpServer.applicationId,
    });
  });

  it('asks to sign in when the server rejects an unauthenticated sync', async () => {
    const response = await syncMcpServerTools(mcpServer.id);

    expect(response.body.data.syncMcpServerTools).toMatchObject({
      tools: [],
      toolsSyncError: expect.stringContaining(
        `No connected account usable by the caller for provider ${getConnectionProviderId()}`,
      ),
    });
  });

  it('registers Twenty dynamically and sends the user to the authorization server', async () => {
    const authorizationUrl = await requestAuthorization();
    const [registeredClientId] = fakeMcpServer.oauth.registeredClientIds;
    const fakeServerUrl = new URL(fakeMcpServer.url);

    expect(fakeMcpServer.oauth.registeredClientIds).toHaveLength(1);
    expect(authorizationUrl.origin).toBe(fakeServerUrl.origin);
    expect(authorizationUrl.pathname).toBe('/authorize');
    expect(Object.fromEntries(authorizationUrl.searchParams)).toMatchObject({
      client_id: registeredClientId,
      response_type: 'code',
      code_challenge_method: 'S256',
      redirect_uri: expect.stringMatching(/\/auth\/apps\/callback$/),
      resource: fakeMcpServer.url,
      scope: 'docs:read',
    });
    expect(authorizationUrl.searchParams.get('code_challenge')).toBeTruthy();
    expect(authorizationUrl.searchParams.get('state')).toBeTruthy();

    const [oauthClient] = await readOAuthClients(getConnectionProviderId());

    expect(oauthClient).toMatchObject({
      registrationMethod: 'DYNAMIC_CLIENT_REGISTRATION',
      clientId: registeredClientId,
      clientSecret: null,
    });
  });

  it('stores the tokens as an app connected account and syncs the tools with them', async () => {
    const redirectUrl = await signIn();

    expect(redirectUrl.searchParams.get('errorMessage')).toBeNull();

    const connectedAccounts = await readConnectedAccounts(
      getConnectionProviderId(),
    );

    expect(connectedAccounts).toHaveLength(1);
    expect(connectedAccounts[0]).toMatchObject({
      provider: 'app',
      scope: 'USER',
      scopes: ['docs:read'],
      authFailedAt: null,
    });
    expect(connectedAccounts[0].accessToken).toMatch(/^enc:v2:/);
    expect(connectedAccounts[0].refreshToken).toMatch(/^enc:v2:/);

    const syncResponse = await syncMcpServerTools(mcpServer.id);

    expect(syncResponse.body.data.syncMcpServerTools.toolsSyncError).toBeNull();
    expect(
      syncResponse.body.data.syncMcpServerTools.tools.map(
        ({ name }: { name: string }) => name,
      ),
    ).toEqual(['search_docs']);
  });

  it('reuses the registered client when reconnecting', async () => {
    const [connectedAccount] = await readConnectedAccounts(
      getConnectionProviderId(),
    );

    await signIn({ reconnectingConnectedAccountId: connectedAccount.id });

    expect(fakeMcpServer.oauth.registeredClientIds).toHaveLength(1);
    expect(
      (await readConnectedAccounts(getConnectionProviderId())).map(
        ({ id }) => id,
      ),
    ).toEqual([connectedAccount.id]);
  });

  it('refreshes an expired access token with the resource indicator', async () => {
    await expireAccessToken();
    const tokenRequestCount = fakeMcpServer.oauth.tokenRequests.length;

    const syncResponse = await syncMcpServerTools(mcpServer.id);

    expect(syncResponse.body.data.syncMcpServerTools.toolsSyncError).toBeNull();

    const refreshRequests = fakeMcpServer.oauth.tokenRequests
      .slice(tokenRequestCount)
      .filter((params) => params.get('grant_type') === 'refresh_token');

    expect(refreshRequests).toHaveLength(1);
    expect(refreshRequests[0].get('resource')).toBe(fakeMcpServer.url);
  });

  it('asks to sign in again once the authorization server rejects the refresh token', async () => {
    const [{ refreshToken: consumedRefreshToken }] =
      await readConnectedAccounts(getConnectionProviderId());

    await expireAccessToken();
    await syncMcpServerTools(mcpServer.id);
    await globalThis.testDataSource.query(
      `UPDATE core."connectedAccount" SET "refreshToken" = $2 WHERE "connectionProviderId" = $1`,
      [getConnectionProviderId(), consumedRefreshToken],
    );
    await expireAccessToken();

    const syncResponse = await syncMcpServerTools(mcpServer.id);
    const [connectedAccount] = await readConnectedAccounts(
      getConnectionProviderId(),
    );

    expect(syncResponse.body.data.syncMcpServerTools.toolsSyncError).toBe(
      'The connected account for this MCP server was signed out. Sign in again to use it.',
    );
    expect(connectedAccount.authFailedAt).not.toBeNull();
  });

  it('refreshes the token once the server rejects it and keeps the account', async () => {
    const [connectedAccount] = await readConnectedAccounts(
      getConnectionProviderId(),
    );

    await signIn({ reconnectingConnectedAccountId: connectedAccount.id });
    const [signedInConnectedAccount] = await readConnectedAccounts(
      getConnectionProviderId(),
    );

    fakeMcpServer.oauth.issuedAccessTokens.clear();

    const syncResponse = await syncMcpServerTools(mcpServer.id);
    const [refreshedConnectedAccount] = await readConnectedAccounts(
      getConnectionProviderId(),
    );

    expect(syncResponse.body.data.syncMcpServerTools.toolsSyncError).toBeNull();
    expect(refreshedConnectedAccount.authFailedAt).toBeNull();
    expect(refreshedConnectedAccount.accessToken).not.toBe(
      signedInConnectedAccount.accessToken,
    );
  });

  it('asks to sign in again once the server rejects the access token and its refresh', async () => {
    const [connectedAccount] = await readConnectedAccounts(
      getConnectionProviderId(),
    );

    await signIn({ reconnectingConnectedAccountId: connectedAccount.id });
    fakeMcpServer.oauth.issuedAccessTokens.clear();
    fakeMcpServer.oauth.issuedRefreshTokens.clear();

    const syncResponse = await syncMcpServerTools(mcpServer.id);
    const [revokedConnectedAccount] = await readConnectedAccounts(
      getConnectionProviderId(),
    );

    expect(syncResponse.body.data.syncMcpServerTools.toolsSyncError).toBe(
      'The connected account for this MCP server was signed out. Sign in again to use it.',
    );
    expect(revokedConnectedAccount.authFailedAt).not.toBeNull();
  });

  it('keeps a valid account when concurrent calls refresh the same token', async () => {
    await expireAccessToken({ shouldClearAuthFailure: true });
    const [connectedAccount] = await readConnectedAccounts(
      getConnectionProviderId(),
    );

    await signIn({ reconnectingConnectedAccountId: connectedAccount.id });
    await expireAccessToken();

    const syncResponses = await Promise.all([
      syncMcpServerTools(mcpServer.id),
      syncMcpServerTools(mcpServer.id),
    ]);
    const [refreshedConnectedAccount] = await readConnectedAccounts(
      getConnectionProviderId(),
    );

    expect(
      syncResponses.map(
        (response) => response.body.data.syncMcpServerTools.toolsSyncError,
      ),
    ).toEqual([null, null]);
    expect(refreshedConnectedAccount.authFailedAt).toBeNull();
  });

  it('lists the connection to its owner only and lets them remove it', async () => {
    const findServerConnections = async (token?: string) => {
      const response = await getMyConnectedAccounts(token);

      expect(response.body.errors).toBeUndefined();

      return response.body.data.myConnectedAccounts.filter(
        (connectedAccount: { connectionProviderId: string | null }) =>
          connectedAccount.connectionProviderId === getConnectionProviderId(),
      );
    };

    const connections = await findServerConnections();

    expect(connections).toEqual([
      expect.objectContaining({ provider: 'app', scope: 'USER' }),
    ]);
    expect(await findServerConnections(APPLE_JONY_MEMBER_ACCESS_TOKEN)).toEqual(
      [],
    );

    const [{ id }] = connections;
    const memberDeleteResponse = await deleteConnectedAccount({
      id,
      token: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(memberDeleteResponse.body.errors?.[0]?.extensions?.code).toBe(
      'FORBIDDEN',
    );

    const deleteResponse = await deleteConnectedAccount({ id });

    expect(deleteResponse.body.errors).toBeUndefined();
    expect(await readConnectedAccounts(getConnectionProviderId())).toHaveLength(
      0,
    );
  });

  it('registers again when the authorization server forgot the client', async () => {
    const [previousOAuthClient] = await readOAuthClients(
      getConnectionProviderId(),
    );

    fakeMcpServer.oauth.forgetRegisteredClients();

    const rejectedRedirectUrl = await signIn();

    expect(rejectedRedirectUrl.searchParams.get('errorMessage')).toEqual(
      expect.any(String),
    );
    expect(await readOAuthClients(getConnectionProviderId())).toHaveLength(0);

    const redirectUrl = await signIn();
    const [oauthClient] = await readOAuthClients(getConnectionProviderId());

    expect(redirectUrl.searchParams.get('errorMessage')).toBeNull();
    expect(fakeMcpServer.oauth.registeredClientIds).toEqual([
      oauthClient.clientId,
    ]);
    expect(oauthClient.clientId).not.toBe(previousOAuthClient.clientId);
    expect(await readConnectedAccounts(getConnectionProviderId())).toHaveLength(
      1,
    );
  });

  it('moves to a new sign-in when the server URL changes', async () => {
    const previousConnectionProviderId = getConnectionProviderId();

    const response = await updateMcpServer({
      id: mcpServer.id,
      update: { url: `${fakeMcpServer.url}/` },
    });

    expect(response.body.errors).toBeUndefined();
    mcpServer = response.body.data.updateMcpServer;

    expect(mcpServer.connectionProviderId).not.toBe(
      previousConnectionProviderId,
    );
    expect(await readConnectionProvider(previousConnectionProviderId)).toEqual(
      [],
    );
    expect(await readConnectedAccounts(previousConnectionProviderId)).toEqual(
      [],
    );
    expect(await readOAuthClients(previousConnectionProviderId)).toEqual([]);
  });

  it('switches to one shared workspace account that only an admin can connect', async () => {
    const userConnectionProviderId = getConnectionProviderId();

    const response = await updateMcpServer({
      id: mcpServer.id,
      update: { signInScope: 'WORKSPACE' },
    });

    expect(response.body.errors).toBeUndefined();
    mcpServer = response.body.data.updateMcpServer;

    const [connectionProvider] = await readConnectionProvider(
      getConnectionProviderId(),
    );

    expect(mcpServer.signInScope).toBe('WORKSPACE');
    expect(connectionProvider).toMatchObject({
      type: 'oauth-discovery',
      scope: 'WORKSPACE',
    });
    expect(await readConnectionProvider(userConnectionProviderId)).toEqual([]);

    const memberAuthorizationResponse = await requestAuthorization({
      accessToken: APPLE_JONY_MEMBER_ACCESS_TOKEN,
    });

    expect(
      memberAuthorizationResponse.searchParams.get('errorMessage'),
    ).toContain('does not have permission');

    const redirectUrl = await signIn();
    const connectedAccounts = await readConnectedAccounts(
      getConnectionProviderId(),
    );

    expect(redirectUrl.searchParams.get('errorMessage')).toBeNull();
    expect(connectedAccounts).toEqual([
      expect.objectContaining({ provider: 'app', scope: 'WORKSPACE' }),
    ]);

    const syncResponse = await syncMcpServerTools(mcpServer.id);

    expect(syncResponse.body.data.syncMcpServerTools.toolsSyncError).toBeNull();
  });

  it('removes its sign-in provider with the server', async () => {
    const otherMcpServerResponse = await createMcpServer({
      name: `oauth_${uuidv4().slice(0, 8)}`,
      label: 'Another fake OAuth docs',
      url: fakeMcpServer.url,
    });
    const otherMcpServer: CreatedMcpServer =
      otherMcpServerResponse.body.data.createMcpServer;

    assertIsDefinedOrThrow(otherMcpServer.connectionProviderId);

    await deleteMcpServer(otherMcpServer.id);

    expect(
      await readConnectionProvider(otherMcpServer.connectionProviderId),
    ).toEqual([]);
  });

  it('shares one registered client between concurrent first sign-ins', async () => {
    const otherMcpServerResponse = await createMcpServer({
      name: `oauth_${uuidv4().slice(0, 8)}`,
      label: 'Concurrent fake OAuth docs',
      url: fakeMcpServer.url,
    });
    const otherMcpServer: CreatedMcpServer =
      otherMcpServerResponse.body.data.createMcpServer;
    const previousMcpServer = mcpServer;

    mcpServer = otherMcpServer;

    try {
      const authorizationUrls = await Promise.all([
        requestAuthorization(),
        requestAuthorization(),
      ]);
      const [oauthClient] = await readOAuthClients(getConnectionProviderId());

      expect(
        authorizationUrls.map((url) => url.searchParams.get('client_id')),
      ).toEqual([oauthClient.clientId, oauthClient.clientId]);
    } finally {
      mcpServer = previousMcpServer;
      await deleteMcpServer(otherMcpServer.id);
    }
  });

  it('sets up sign-in on sync when a server starts asking for it later', async () => {
    const laterSignInMcpServer = await startFakeMcpServer();
    const createResponse = await createMcpServer({
      name: `later_${uuidv4().slice(0, 8)}`,
      label: 'Fake docs that add sign-in',
      url: laterSignInMcpServer.url,
    });
    const laterSignInMcpServerRecord: CreatedMcpServer =
      createResponse.body.data.createMcpServer;

    try {
      expect(laterSignInMcpServerRecord.connectionProviderId).toBeNull();

      laterSignInMcpServer.startRequiringSignIn();

      const syncResponse = await syncMcpServerTools(
        laterSignInMcpServerRecord.id,
      );

      expect(syncResponse.body.data.syncMcpServerTools).toMatchObject({
        connectionProviderId: expect.any(String),
        signInScope: 'USER',
        toolsSyncError:
          'This MCP server requires signing in. Connect an account to use it.',
      });
    } finally {
      await deleteMcpServer(laterSignInMcpServerRecord.id);
      await laterSignInMcpServer.close();
    }
  });

  it('leaves a server that does not ask for sign-in without a provider', async () => {
    const openMcpServer = await startFakeMcpServer();
    const createResponse = await createMcpServer({
      name: `open_${uuidv4().slice(0, 8)}`,
      label: 'Fake open docs',
      url: openMcpServer.url,
    });
    const openMcpServerRecord: CreatedMcpServer =
      createResponse.body.data.createMcpServer;

    try {
      expect(openMcpServerRecord.connectionProviderId).toBeNull();
    } finally {
      await deleteMcpServer(openMcpServerRecord.id);
      await openMcpServer.close();
    }
  });
});
