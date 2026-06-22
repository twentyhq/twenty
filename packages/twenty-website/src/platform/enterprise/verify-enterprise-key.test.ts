import { generateKeyPairSync } from 'node:crypto';

import { signEnterpriseKey } from './sign-enterprise-key';
import { verifyEnterpriseKey } from './verify-enterprise-key';

describe('verifyEnterpriseKey', () => {
  beforeAll(() => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      privateKeyEncoding: { format: 'pem', type: 'pkcs8' },
      publicKeyEncoding: { format: 'pem', type: 'spki' },
    });
    process.env.ENTERPRISE_JWT_PRIVATE_KEY = privateKey;
    process.env.ENTERPRISE_JWT_PUBLIC_KEY = publicKey;
  });

  it('recovers the claims from a key it signed', () => {
    const payload = verifyEnterpriseKey(
      signEnterpriseKey('sub_12345', 'Acme, Inc.'),
    );

    if (payload === null) {
      throw new Error('expected a verifiable enterprise key');
    }

    expect(payload.sub).toBe('sub_12345');
    expect(payload.licensee).toBe('Acme, Inc.');
    expect(typeof payload.iat).toBe('number');
  });

  it('rejects a token whose payload was swapped under the original signature', () => {
    const token = signEnterpriseKey('sub_12345', 'Acme, Inc.');
    const [header, , signature] = token.split('.');
    const forgedPayload = Buffer.from(
      JSON.stringify({ iat: 0, licensee: 'Attacker', sub: 'sub_evil' }),
    ).toString('base64url');

    expect(
      verifyEnterpriseKey(`${header}.${forgedPayload}.${signature}`),
    ).toBeNull();
  });

  it('rejects a malformed token', () => {
    expect(verifyEnterpriseKey('not-a-jwt')).toBeNull();
    expect(verifyEnterpriseKey('only.two')).toBeNull();
  });
});
