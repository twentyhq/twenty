import { generateKeyPairSync, randomUUID } from 'crypto';
import { createServer } from 'http';

import { isObject } from '@sniptt/guards';
import * as jwt from 'jsonwebtoken';
import { IDENTITY_ASSERTION_TEST_CONFIG } from 'test/integration/graphql/suites/auth/identity-assertion/utils/identity-assertion-test-config.constant';
import { isDefined } from 'twenty-shared/utils';

export type IdentityAssertionIssuer = Awaited<
  ReturnType<typeof startIdentityAssertionIssuer>
>;

export const startIdentityAssertionIssuer = async () => {
  const signingKeys = {
    RS256: {
      keyId: randomUUID(),
      ...generateKeyPairSync('rsa', { modulusLength: 2048 }),
    },
    ES256: {
      keyId: randomUUID(),
      ...generateKeyPairSync('ec', { namedCurve: 'P-256' }),
    },
  };

  const server = createServer((_request, response) => {
    response.setHeader('Content-Type', 'application/json');
    response.end(
      JSON.stringify({
        keys: Object.values(signingKeys).map(({ keyId, publicKey }) => ({
          kid: keyId,
          ...publicKey.export({ format: 'jwk' }),
        })),
      }),
    );
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  const address = server.address();

  if (!isObject(address)) {
    throw new Error('Identity assertion issuer did not bind to a port');
  }

  return {
    signingKeysUrl: `http://127.0.0.1:${address.port}/keys`,
    signAssertion: ({
      email,
      algorithm = 'RS256',
      issuer = IDENTITY_ASSERTION_TEST_CONFIG.issuer,
      audience = IDENTITY_ASSERTION_TEST_CONFIG.audience,
      expiresInSeconds = 60,
      signingKeyId = signingKeys[algorithm].keyId,
    }: {
      email?: string;
      algorithm?: keyof typeof signingKeys;
      issuer?: string;
      audience?: string;
      expiresInSeconds?: number;
      signingKeyId?: string;
    }) =>
      jwt.sign(
        isDefined(email) ? { email } : {},
        signingKeys[algorithm].privateKey,
        {
          algorithm,
          keyid: signingKeyId,
          issuer,
          audience,
          expiresIn: expiresInSeconds,
        },
      ),
    stop: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
};
