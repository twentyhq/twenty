import { generateKeyPairSync, randomUUID } from 'crypto';
import { createServer } from 'http';

import { isObject } from '@sniptt/guards';
import * as jwt from 'jsonwebtoken';
import { isDefined } from 'twenty-shared/utils';

export type CloudflareAccessIssuer = Awaited<
  ReturnType<typeof startCloudflareAccessIssuer>
>;

export const startCloudflareAccessIssuer = async () => {
  const { publicKey, privateKey } = generateKeyPairSync('rsa', {
    modulusLength: 2048,
  });
  const keyId = randomUUID();
  const { n, e } = publicKey.export({ format: 'jwk' });

  const server = createServer((_request, response) => {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ keys: [{ kid: keyId, kty: 'RSA', n, e }] }));
  });

  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));

  const address = server.address();

  if (!isObject(address)) {
    throw new Error('Cloudflare Access issuer did not bind to a port');
  }

  const issuerUrl = `http://127.0.0.1:${address.port}`;

  return {
    issuerUrl,
    signAssertion: ({
      email,
      audience,
      issuer = issuerUrl,
      expiresInSeconds = 60,
      signingKeyId = keyId,
    }: {
      email?: string;
      audience: string;
      issuer?: string;
      expiresInSeconds?: number;
      signingKeyId?: string;
    }) =>
      jwt.sign(isDefined(email) ? { email } : {}, privateKey, {
        algorithm: 'RS256',
        keyid: signingKeyId,
        issuer,
        audience,
        expiresIn: expiresInSeconds,
      }),
    stop: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
};
