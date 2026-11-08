import { createHash, randomUUID } from 'crypto';
import http from 'http';

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { isString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

export type FakeOAuthServer = {
  registeredClientIds: string[];
  tokenRequests: URLSearchParams[];
  issuedAccessTokens: Set<string>;
  issuedRefreshTokens: Set<string>;
  forgetRegisteredClients: () => void;
};

export type FakeMcpServer = {
  url: string;
  receivedAuthorizationHeaders: (string | undefined)[];
  stopOfferingSearchDocs: () => void;
  startRequiringSignIn: () => void;
  oauth: FakeOAuthServer;
  close: () => Promise<void>;
};

type AuthorizationCode = {
  clientId: string;
  codeChallenge: string;
  redirectUri: string;
  resource: string | null;
};

type FakeMcpServerState = {
  isSearchDocsOffered: boolean;
  isDeletePageOffered: boolean;
};

const createMcpServer = ({
  isSearchDocsOffered,
  isDeletePageOffered,
}: FakeMcpServerState): McpServer => {
  const mcpServer = new McpServer({ name: 'fake', version: '1.0.0' });

  if (isSearchDocsOffered) {
    mcpServer.registerTool(
      'search_docs',
      {
        description: 'Search the documentation',
        inputSchema: { query: z.string() },
        annotations: { readOnlyHint: true },
      },
      async ({ query }) => ({
        content: [{ type: 'text', text: `results for ${query}` }],
      }),
    );
  }

  if (isDeletePageOffered) {
    mcpServer.registerTool(
      'delete_page',
      {
        description: 'Delete a documentation page',
        inputSchema: { pageId: z.string() },
        annotations: { destructiveHint: true },
      },
      async ({ pageId }) => ({
        content: [{ type: 'text', text: `deleted ${pageId}` }],
      }),
    );
  }
  mcpServer.registerTool(
    'docs.search',
    { description: 'Dropped by the sanitizer' },
    async () => ({ content: [] }),
  );

  return mcpServer;
};

// A stateless transport is single-use, so every request gets its own server and transport.
const handleMcpRequest = async ({
  request,
  response,
  state,
}: {
  request: http.IncomingMessage;
  response: http.ServerResponse;
  state: FakeMcpServerState;
}): Promise<void> => {
  const transport = new StreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  await createMcpServer(state).connect(transport);
  await transport.handleRequest(request, response);
};

const readBody = async (request: http.IncomingMessage): Promise<string> => {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(chunk as Buffer);
  }

  return Buffer.concat(chunks).toString();
};

const sendJson = (
  response: http.ServerResponse,
  status: number,
  body: unknown,
): void => {
  response
    .writeHead(status, { 'Content-Type': 'application/json' })
    .end(JSON.stringify(body));
};

// A minimal OAuth 2.1 authorization server with dynamic client registration and PKCE.
const createFakeOAuthServer = () => {
  const registeredClientIds: string[] = [];
  const tokenRequests: URLSearchParams[] = [];
  const issuedAccessTokens = new Set<string>();
  const issuedRefreshTokens = new Set<string>();
  const authorizationCodes = new Map<string, AuthorizationCode>();

  const issueTokens = () => {
    const accessToken = `access-${randomUUID()}`;
    const refreshToken = `refresh-${randomUUID()}`;

    issuedAccessTokens.add(accessToken);
    issuedRefreshTokens.add(refreshToken);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'docs:read',
    };
  };

  const handleRequest = async ({
    request,
    response,
    baseUrl,
  }: {
    request: http.IncomingMessage;
    response: http.ServerResponse;
    baseUrl: string;
  }): Promise<boolean> => {
    const url = new URL(request.url ?? '/', baseUrl);

    if (url.pathname === '/.well-known/oauth-protected-resource/mcp') {
      sendJson(response, 200, {
        resource: `${baseUrl}/mcp`,
        authorization_servers: [baseUrl],
        scopes_supported: ['docs:read'],
      });

      return true;
    }

    if (url.pathname === '/.well-known/oauth-authorization-server') {
      sendJson(response, 200, {
        issuer: baseUrl,
        authorization_endpoint: `${baseUrl}/authorize`,
        token_endpoint: `${baseUrl}/token`,
        registration_endpoint: `${baseUrl}/register`,
        response_types_supported: ['code'],
        grant_types_supported: ['authorization_code', 'refresh_token'],
        code_challenge_methods_supported: ['S256'],
        token_endpoint_auth_methods_supported: ['none'],
      });

      return true;
    }

    if (url.pathname === '/register' && request.method === 'POST') {
      const clientMetadata = JSON.parse(await readBody(request));
      const clientId = `client-${randomUUID()}`;

      registeredClientIds.push(clientId);
      sendJson(response, 201, {
        ...clientMetadata,
        client_id: clientId,
        client_id_issued_at: Math.floor(Date.now() / 1000),
      });

      return true;
    }

    if (url.pathname === '/authorize') {
      const clientId = url.searchParams.get('client_id') ?? '';
      const redirectUri = url.searchParams.get('redirect_uri') ?? '';
      const codeChallenge = url.searchParams.get('code_challenge') ?? '';

      if (!registeredClientIds.includes(clientId)) {
        sendJson(response, 400, { error: 'invalid_client' });

        return true;
      }

      const code = randomUUID();

      authorizationCodes.set(code, {
        clientId,
        codeChallenge,
        redirectUri,
        resource: url.searchParams.get('resource'),
      });

      const callbackUrl = new URL(redirectUri);

      callbackUrl.searchParams.set('code', code);
      callbackUrl.searchParams.set(
        'state',
        url.searchParams.get('state') ?? '',
      );
      response.writeHead(302, { Location: callbackUrl.toString() }).end();

      return true;
    }

    if (url.pathname === '/token' && request.method === 'POST') {
      const params = new URLSearchParams(await readBody(request));
      const clientId = params.get('client_id') ?? '';

      tokenRequests.push(params);

      if (!registeredClientIds.includes(clientId)) {
        sendJson(response, 401, { error: 'invalid_client' });

        return true;
      }

      if (params.get('grant_type') === 'refresh_token') {
        const refreshToken = params.get('refresh_token') ?? '';

        if (!issuedRefreshTokens.delete(refreshToken)) {
          sendJson(response, 400, { error: 'invalid_grant' });

          return true;
        }

        sendJson(response, 200, issueTokens());

        return true;
      }

      const authorizationCode = authorizationCodes.get(
        params.get('code') ?? '',
      );
      const expectedChallenge = createHash('sha256')
        .update(params.get('code_verifier') ?? '')
        .digest('base64url');

      authorizationCodes.delete(params.get('code') ?? '');

      if (
        !isDefined(authorizationCode) ||
        authorizationCode.clientId !== clientId ||
        authorizationCode.redirectUri !== params.get('redirect_uri') ||
        authorizationCode.codeChallenge !== expectedChallenge
      ) {
        sendJson(response, 400, { error: 'invalid_grant' });

        return true;
      }

      sendJson(response, 200, issueTokens());

      return true;
    }

    return false;
  };

  const isAuthorized = (authorizationHeader: string | undefined): boolean =>
    isDefined(authorizationHeader) &&
    issuedAccessTokens.has(authorizationHeader.replace(/^Bearer /, ''));

  return {
    handleRequest,
    isAuthorized,
    state: {
      registeredClientIds,
      tokenRequests,
      issuedAccessTokens,
      issuedRefreshTokens,
      forgetRegisteredClients: () => {
        registeredClientIds.length = 0;
      },
    },
  };
};

export const startFakeMcpServer = ({
  isDeletePageOffered = false,
  isSignInRequired = false,
}: {
  isDeletePageOffered?: boolean;
  isSignInRequired?: boolean;
} = {}): Promise<FakeMcpServer> =>
  new Promise((resolve, reject) => {
    const receivedAuthorizationHeaders: (string | undefined)[] = [];
    const state: FakeMcpServerState = {
      isSearchDocsOffered: true,
      isDeletePageOffered,
    };
    const fakeOAuthServer = createFakeOAuthServer();
    let baseUrl = '';
    let isSignInRequiredNow = isSignInRequired;

    const handleRequest = async (
      request: http.IncomingMessage,
      response: http.ServerResponse,
    ): Promise<void> => {
      if (
        isSignInRequiredNow &&
        (await fakeOAuthServer.handleRequest({ request, response, baseUrl }))
      ) {
        return;
      }

      receivedAuthorizationHeaders.push(request.headers.authorization);

      if (
        isSignInRequiredNow &&
        !fakeOAuthServer.isAuthorized(request.headers.authorization)
      ) {
        response
          .writeHead(401, {
            'WWW-Authenticate': `Bearer resource_metadata="${baseUrl}/.well-known/oauth-protected-resource/mcp", scope="docs:read"`,
          })
          .end();

        return;
      }

      await handleMcpRequest({ request, response, state });
    };

    const server = http.createServer((request, response) => {
      handleRequest(request, response).catch(() => {
        response.writeHead(500).end();
      });
    });

    server.listen(0, '127.0.0.1', () => {
      const address = server.address();

      if (!isDefined(address) || isString(address)) {
        reject(new Error('Fake MCP server did not bind to a TCP port'));

        return;
      }

      baseUrl = `http://127.0.0.1:${address.port}`;

      resolve({
        url: `${baseUrl}/mcp`,
        receivedAuthorizationHeaders,
        oauth: fakeOAuthServer.state,
        stopOfferingSearchDocs: () => {
          state.isSearchDocsOffered = false;
        },
        startRequiringSignIn: () => {
          isSignInRequiredNow = true;
        },
        close: () =>
          new Promise((resolveClose) => {
            server.closeAllConnections();
            server.close(() => resolveClose());
          }),
      });
    });
  });
