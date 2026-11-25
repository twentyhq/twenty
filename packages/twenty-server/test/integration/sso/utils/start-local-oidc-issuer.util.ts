import { generateKeyPairSync, randomUUID } from 'node:crypto';
import {
  createServer,
  type IncomingMessage,
  type ServerResponse,
} from 'node:http';

import * as jwt from 'jsonwebtoken';
import { isDefined } from 'twenty-shared/utils';

export type LocalOidcIssuer = {
  issuerUrl: string;
  host: string;
  close: () => Promise<void>;
};

type PendingAuthorization = {
  email: string;
  clientId: string;
  nonce: string | null;
};

const SIGNING_KEY_ID = 'local-oidc-issuer';

const readBody = async (request: IncomingMessage) => {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(chunk as Buffer);
  }

  return Buffer.concat(chunks).toString();
};

const sendJson = (response: ServerResponse, status: number, body: object) => {
  response.writeHead(status, { 'Content-Type': 'application/json' });
  response.end(JSON.stringify(body));
};

// Stands in for an OIDC provider the workspace admin controls: it signs in
// whatever email the authorization request names in login_hint.
export const startLocalOidcIssuer = async (): Promise<LocalOidcIssuer> => {
  const { privateKey, publicKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  const pendingAuthorizationByCode = new Map<string, PendingAuthorization>();
  const emailByAccessToken = new Map<string, string>();

  let issuerUrl = '';

  const handleRequest = async (
    request: IncomingMessage,
    response: ServerResponse,
  ) => {
    const url = new URL(request.url ?? '/', issuerUrl);

    switch (url.pathname) {
      case '/.well-known/openid-configuration':
        return sendJson(response, 200, {
          issuer: issuerUrl,
          authorization_endpoint: `${issuerUrl}/authorize`,
          token_endpoint: `${issuerUrl}/token`,
          userinfo_endpoint: `${issuerUrl}/userinfo`,
          jwks_uri: `${issuerUrl}/jwks`,
          response_types_supported: ['code'],
          subject_types_supported: ['public'],
          id_token_signing_alg_values_supported: ['RS256'],
          code_challenge_methods_supported: ['S256'],
          token_endpoint_auth_methods_supported: [
            'client_secret_basic',
            'client_secret_post',
          ],
        });
      case '/jwks':
        return sendJson(response, 200, {
          keys: [
            {
              ...publicKey.export({ format: 'jwk' }),
              kid: SIGNING_KEY_ID,
              alg: 'RS256',
              use: 'sig',
            },
          ],
        });
      case '/authorize': {
        const email = url.searchParams.get('login_hint');
        const clientId = url.searchParams.get('client_id');
        const redirectUri = url.searchParams.get('redirect_uri');

        if (
          !isDefined(email) ||
          !isDefined(clientId) ||
          !isDefined(redirectUri)
        ) {
          return sendJson(response, 400, { error: 'invalid_request' });
        }

        const code = randomUUID();

        pendingAuthorizationByCode.set(code, {
          email,
          clientId,
          nonce: url.searchParams.get('nonce'),
        });

        const callbackUrl = new URL(redirectUri);

        callbackUrl.searchParams.set('code', code);
        callbackUrl.searchParams.set(
          'state',
          url.searchParams.get('state') ?? '',
        );

        response.writeHead(302, { Location: callbackUrl.toString() });

        return response.end();
      }
      case '/token': {
        const code = new URLSearchParams(await readBody(request)).get('code');
        const pendingAuthorization = isDefined(code)
          ? pendingAuthorizationByCode.get(code)
          : undefined;

        if (!isDefined(code) || !isDefined(pendingAuthorization)) {
          return sendJson(response, 400, { error: 'invalid_grant' });
        }

        pendingAuthorizationByCode.delete(code);

        const { email, clientId, nonce } = pendingAuthorization;
        const accessToken = randomUUID();

        emailByAccessToken.set(accessToken, email);

        return sendJson(response, 200, {
          access_token: accessToken,
          token_type: 'Bearer',
          expires_in: 300,
          id_token: jwt.sign(
            {
              email,
              email_verified: true,
              ...(isDefined(nonce) ? { nonce } : {}),
            },
            privateKey.export({ format: 'pem', type: 'pkcs1' }),
            {
              algorithm: 'RS256',
              keyid: SIGNING_KEY_ID,
              issuer: issuerUrl,
              audience: clientId,
              subject: email,
              expiresIn: 300,
            },
          ),
        });
      }
      case '/userinfo': {
        const accessToken = request.headers.authorization?.replace(
          /^Bearer /,
          '',
        );
        const email = isDefined(accessToken)
          ? emailByAccessToken.get(accessToken)
          : undefined;

        if (!isDefined(email)) {
          return sendJson(response, 401, { error: 'invalid_token' });
        }

        return sendJson(response, 200, {
          sub: email,
          email,
          email_verified: true,
        });
      }
      default:
        return sendJson(response, 404, { error: 'not_found' });
    }
  };

  const server = createServer((request, response) => {
    handleRequest(request, response).catch((error: unknown) =>
      sendJson(response, 500, { error: String(error) }),
    );
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  const address = server.address();

  if (!isDefined(address) || typeof address === 'string') {
    throw new Error('Local OIDC issuer is not listening on a TCP port');
  }

  issuerUrl = `http://127.0.0.1:${address.port}`;

  return {
    issuerUrl,
    host: '127.0.0.1',
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
};
