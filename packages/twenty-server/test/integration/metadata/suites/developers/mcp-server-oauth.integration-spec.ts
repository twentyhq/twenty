import request from 'supertest';
import {
  createMcpServer,
  deleteMcpServer,
  deleteMcpServerConnection,
  getMcpServerConnections,
  syncMcpServerTools,
  updateMcpServer,
} from 'test/integration/metadata/suites/utils/mcp-server-test.util';
import {
  type FakeMcpServer,
  startFakeMcpServer,
} from 'test/integration/metadata/suites/utils/mcp-server-fake-server.util';
import { updateFeatureFlag } from 'test/integration/metadata/suites/utils/update-feature-flag.util';
import { updateConfigVariable } from 'test/integration/twenty-config/utils/update-config-variable.util';
import { generateTransientTokenResponse } from 'test/integration/utils/generate-transient-token.util';
import { FeatureFlagKey } from 'twenty-shared/types';
import { assertIsDefinedOrThrow } from 'twenty-shared/utils';
import { v4 as uuidv4 } from 'uuid';

import { type ConnectedAccountEntity } from 'src/engine/metadata-modules/connected-account/entities/connected-account.entity';
import { type McpServerOAuthClientEntity } from 'src/engine/metadata-modules/mcp-server/entities/mcp-server-oauth-client.entity';

const twentyServer = () => request(`http://localhost:${APP_PORT}`);

describe('MCP server sign-in through OAuth discovery (e2e)', () => {
  let fakeMcpServer: FakeMcpServer;
  let mcpServerId: string;

  const readConnectedAccounts = (): Promise<ConnectedAccountEntity[]> =>
    globalThis.testDataSource.query(
      'SELECT * FROM core."connectedAccount" WHERE "mcpServerId" = $1 ORDER BY "createdAt"',
      [mcpServerId],
    );

  const readOAuthClients = (): Promise<McpServerOAuthClientEntity[]> =>
    globalThis.testDataSource.query(
      'SELECT * FROM core."mcpServerOAuthClient" WHERE "mcpServerId" = $1',
      [mcpServerId],
    );

  const requestAuthorization = async (
    query: Record<string, string> = {},
  ): Promise<URL> => {
    const transient = await generateTransientTokenResponse({
      token: APPLE_JANE_ADMIN_ACCESS_TOKEN,
    });

    const response = await twentyServer()
      .get('/auth/mcp-servers/authorize')
      .query({
        mcpServerId,
        transientToken:
          transient.data.generateTransientToken.transientToken.token,
        ...query,
      });

    expect(response.status).toBe(302);

    return new URL(response.headers.location);
  };

  const signIn = async (query: Record<string, string> = {}): Promise<URL> => {
    const authorizationUrl = await requestAuthorization(query);
    const authorizationResponse = await fetch(authorizationUrl, {
      redirect: 'manual',
    });
    const callbackLocation = authorizationResponse.headers.get('location');

    assertIsDefinedOrThrow(callbackLocation);

    const callbackUrl = new URL(callbackLocation);
    const callbackResponse = await twentyServer()
      .get(callbackUrl.pathname)
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
    mcpServerId = response.body.data.createMcpServer.id;
  });

  afterAll(async () => {
    await deleteMcpServer(mcpServerId);
    await fakeMcpServer.close();
    await updateConfigVariable({
      input: { key: 'OUTBOUND_HTTP_ALLOWED_INTERNAL_HOSTS', value: [] },
    });
  });

  it('asks to sign in when the server rejects an unauthenticated sync', async () => {
    const response = await syncMcpServerTools(mcpServerId);

    expect(response.body.data.syncMcpServerTools).toMatchObject({
      tools: [],
      toolsSyncError:
        'This MCP server requires signing in. Connect an account to use it.',
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
      redirect_uri: expect.stringMatching(/\/auth\/mcp-servers\/callback$/),
      resource: fakeMcpServer.url,
      scope: 'docs:read',
    });
    expect(authorizationUrl.searchParams.get('code_challenge')).toBeTruthy();
    expect(authorizationUrl.searchParams.get('state')).toBeTruthy();

    const [oauthClient] = await readOAuthClients();

    expect(oauthClient).toMatchObject({
      registrationMethod: 'DYNAMIC_CLIENT_REGISTRATION',
      clientId: registeredClientId,
      clientSecret: null,
    });
  });

  it('stores the tokens as a connected account and syncs the tools with them', async () => {
    const redirectUrl = await signIn();

    expect(redirectUrl.pathname).toBe(
      `/settings/ai/mcp-servers/${mcpServerId}`,
    );
    expect(redirectUrl.searchParams.get('errorMessage')).toBeNull();

    const connectedAccounts = await readConnectedAccounts();

    expect(connectedAccounts).toHaveLength(1);
    expect(connectedAccounts[0]).toMatchObject({
      provider: 'mcp',
      scope: 'USER',
      scopes: ['docs:read'],
      authFailedAt: null,
    });
    expect(connectedAccounts[0].accessToken).toMatch(/^enc:v2:/);
    expect(connectedAccounts[0].refreshToken).toMatch(/^enc:v2:/);

    const syncResponse = await syncMcpServerTools(mcpServerId);

    expect(syncResponse.body.data.syncMcpServerTools.toolsSyncError).toBeNull();
    expect(
      syncResponse.body.data.syncMcpServerTools.tools.map(
        ({ name }: { name: string }) => name,
      ),
    ).toEqual(['search_docs']);
  });

  it('reuses the registered client when signing in again', async () => {
    await signIn();

    expect(fakeMcpServer.oauth.registeredClientIds).toHaveLength(1);
    expect(await readConnectedAccounts()).toHaveLength(1);
  });

  it('refreshes an expired access token with the resource indicator', async () => {
    await globalThis.testDataSource.query(
      `UPDATE core."connectedAccount" SET "accessTokenExpiresAt" = now() - interval '1 hour', "lastCredentialsRefreshedAt" = now() - interval '2 hours' WHERE "mcpServerId" = $1`,
      [mcpServerId],
    );
    const tokenRequestCount = fakeMcpServer.oauth.tokenRequests.length;

    const syncResponse = await syncMcpServerTools(mcpServerId);

    expect(syncResponse.body.data.syncMcpServerTools.toolsSyncError).toBeNull();

    const refreshRequests = fakeMcpServer.oauth.tokenRequests
      .slice(tokenRequestCount)
      .filter((params) => params.get('grant_type') === 'refresh_token');

    expect(refreshRequests).toHaveLength(1);
    expect(refreshRequests[0].get('resource')).toBe(fakeMcpServer.url);
  });

  it('lists the connection to its owner and lets them remove it', async () => {
    const listResponse = await getMcpServerConnections(mcpServerId);

    expect(listResponse.body.errors).toBeUndefined();
    expect(listResponse.body.data.mcpServerConnections).toEqual([
      expect.objectContaining({ scope: 'USER', isOwnedByCurrentUser: true }),
    ]);

    const memberListResponse = await getMcpServerConnections(
      mcpServerId,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(memberListResponse.body.data.mcpServerConnections).toEqual([]);

    const [{ id }] = listResponse.body.data.mcpServerConnections;
    const memberDeleteResponse = await deleteMcpServerConnection(
      id,
      APPLE_JONY_MEMBER_ACCESS_TOKEN,
    );

    expect(memberDeleteResponse.body.errors?.[0]?.extensions?.code).toBe(
      'NOT_FOUND',
    );

    const deleteResponse = await deleteMcpServerConnection(id);

    expect(deleteResponse.body.errors).toBeUndefined();
    expect(await readConnectedAccounts()).toHaveLength(0);
  });

  it('registers again when the authorization server forgot the client', async () => {
    const [previousOAuthClient] = await readOAuthClients();

    fakeMcpServer.oauth.forgetRegisteredClients();

    const redirectUrl = await signIn();
    const [oauthClient] = await readOAuthClients();

    expect(redirectUrl.searchParams.get('errorMessage')).toBeNull();
    expect(fakeMcpServer.oauth.registeredClientIds).toEqual([
      oauthClient.clientId,
    ]);
    expect(oauthClient.clientId).not.toBe(previousOAuthClient.clientId);
    expect(await readConnectedAccounts()).toHaveLength(1);
  });

  it('forgets every sign-in when the server URL changes', async () => {
    const response = await updateMcpServer({
      id: mcpServerId,
      update: { url: `${fakeMcpServer.url}/` },
    });

    expect(response.body.errors).toBeUndefined();
    expect(await readConnectedAccounts()).toHaveLength(0);
    expect(await readOAuthClients()).toHaveLength(0);

    await updateMcpServer({
      id: mcpServerId,
      update: { url: fakeMcpServer.url },
    });
  });

  it('redirects with an error when the server does not ask for sign-in', async () => {
    const openMcpServer = await startFakeMcpServer();
    const createResponse = await createMcpServer({
      name: `open_${uuidv4().slice(0, 8)}`,
      label: 'Fake open docs',
      url: openMcpServer.url,
    });
    const openMcpServerId = createResponse.body.data.createMcpServer.id;

    try {
      const redirectUrl = await requestAuthorization({
        mcpServerId: openMcpServerId,
      });

      expect(redirectUrl.pathname).toBe(
        `/settings/ai/mcp-servers/${openMcpServerId}`,
      );
      expect(redirectUrl.searchParams.get('errorMessage')).toBe(
        'This MCP server does not ask for sign-in.',
      );
    } finally {
      await deleteMcpServer(openMcpServerId);
      await openMcpServer.close();
    }
  });
});
