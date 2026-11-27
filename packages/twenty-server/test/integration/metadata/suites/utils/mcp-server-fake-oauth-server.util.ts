import { createHash, randomUUID } from 'crypto';
import http from 'http';

import { isDefined } from 'twenty-shared/utils';

export type FakeOAuthServer = {
  registeredClientIds: string[];
  tokenRequests: URLSearchParams[];
  issuedAccessTokens: Set<string>;
  issuedRefreshTokens: Set<string>;
  forgetRegisteredClients: () => void;
};

type AuthorizationCode = {
  clientId: string;
  codeChallenge: string;
  redirectUri: string;
  resource: string | null;
};

const readBody = async (request: http.IncomingMessage): Promise<string> => {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString();
};

const sendJson = ({
  response,
  status,
  body,
}: {
  response: http.ServerResponse;
  status: number;
  body: unknown;
}): void => {
  response
    .writeHead(status, { 'Content-Type': 'application/json' })
    .end(JSON.stringify(body));
};

export const createFakeOAuthServer = () => {
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
      sendJson({
        response,
        status: 200,
        body: {
          resource: `${baseUrl}/mcp`,
          authorization_servers: [baseUrl],
          scopes_supported: ['docs:read'],
        },
      });

      return true;
    }

    if (url.pathname === '/.well-known/oauth-authorization-server') {
      sendJson({
        response,
        status: 200,
        body: {
          issuer: baseUrl,
          authorization_endpoint: `${baseUrl}/authorize`,
          token_endpoint: `${baseUrl}/token`,
          registration_endpoint: `${baseUrl}/register`,
          response_types_supported: ['code'],
          grant_types_supported: ['authorization_code', 'refresh_token'],
          code_challenge_methods_supported: ['S256'],
          token_endpoint_auth_methods_supported: ['none'],
        },
      });

      return true;
    }

    if (url.pathname === '/register' && request.method === 'POST') {
      const clientMetadata = JSON.parse(await readBody(request));
      const clientId = `client-${randomUUID()}`;

      registeredClientIds.push(clientId);
      sendJson({
        response,
        status: 201,
        body: {
          ...clientMetadata,
          client_id: clientId,
          client_id_issued_at: Math.floor(Date.now() / 1000),
        },
      });

      return true;
    }

    if (url.pathname === '/authorize') {
      const clientId = url.searchParams.get('client_id') ?? '';
      const redirectUri = url.searchParams.get('redirect_uri') ?? '';
      const codeChallenge = url.searchParams.get('code_challenge') ?? '';
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
        sendJson({ response, status: 401, body: { error: 'invalid_client' } });

        return true;
      }

      if (params.get('grant_type') === 'refresh_token') {
        const refreshToken = params.get('refresh_token') ?? '';

        if (!issuedRefreshTokens.delete(refreshToken)) {
          sendJson({ response, status: 400, body: { error: 'invalid_grant' } });

          return true;
        }

        sendJson({ response, status: 200, body: issueTokens() });

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
        sendJson({ response, status: 400, body: { error: 'invalid_grant' } });

        return true;
      }

      sendJson({ response, status: 200, body: issueTokens() });

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
