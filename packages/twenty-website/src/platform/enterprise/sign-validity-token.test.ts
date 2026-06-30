import { generateKeyPairSync } from 'node:crypto';

import { signValidityToken } from './sign-validity-token';
import { verifyJwt } from './verify-jwt';

const SECONDS_PER_DAY = 24 * 60 * 60;
const DEFAULT_DURATION_DAYS = 30;

type ValidityClaims = {
  exp: number;
  iat: number;
  status: string;
  sub: string;
};

const verifiedClaims = (token: string): ValidityClaims => {
  const claims = verifyJwt<ValidityClaims>(token);

  if (claims === null) {
    throw new Error('expected a verifiable validity token');
  }

  return claims;
};

describe('signValidityToken', () => {
  beforeAll(() => {
    const { privateKey, publicKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      privateKeyEncoding: { format: 'pem', type: 'pkcs8' },
      publicKeyEncoding: { format: 'pem', type: 'spki' },
    });
    process.env.ENTERPRISE_JWT_PRIVATE_KEY = privateKey;
    process.env.ENTERPRISE_JWT_PUBLIC_KEY = publicKey;
    delete process.env.ENTERPRISE_VALIDITY_TOKEN_DURATION_DAYS;
  });

  it('signs a verifiable "valid" token carrying the subscription id', () => {
    const claims = verifiedClaims(signValidityToken('sub_round_trip'));

    expect(claims.sub).toBe('sub_round_trip');
    expect(claims.status).toBe('valid');
  });

  it('defaults exp to the duration window when no cancellation is set', () => {
    const claims = verifiedClaims(signValidityToken('sub_default'));

    expect(claims.exp - claims.iat).toBe(
      DEFAULT_DURATION_DAYS * SECONDS_PER_DAY,
    );
  });

  it('clamps exp down to a cancellation inside the window', () => {
    const cancelAt = Math.floor(Date.now() / 1000) + 10 * SECONDS_PER_DAY;
    const claims = verifiedClaims(
      signValidityToken('sub_clamped', { subscriptionCancelAt: cancelAt }),
    );

    expect(claims.exp).toBe(cancelAt);
  });

  it('ignores a cancellation beyond the default window', () => {
    const cancelAt = Math.floor(Date.now() / 1000) + 60 * SECONDS_PER_DAY;
    const claims = verifiedClaims(
      signValidityToken('sub_far', { subscriptionCancelAt: cancelAt }),
    );

    expect(claims.exp - claims.iat).toBe(
      DEFAULT_DURATION_DAYS * SECONDS_PER_DAY,
    );
  });

  it('treats a non-positive cancellation as no cancellation', () => {
    const claims = verifiedClaims(
      signValidityToken('sub_zero', { subscriptionCancelAt: 0 }),
    );

    expect(claims.exp - claims.iat).toBe(
      DEFAULT_DURATION_DAYS * SECONDS_PER_DAY,
    );
  });
});
