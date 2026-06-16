import { constants, sign } from 'node:crypto';

type EnterpriseKeyPayload = {
  iat: number;
  licensee: string;
  sub: string;
};

const ALGORITHM = 'RS256';

function getPrivateKey(): string {
  const key = process.env.ENTERPRISE_JWT_PRIVATE_KEY;

  if (!key) {
    throw new Error('ENTERPRISE_JWT_PRIVATE_KEY is not configured');
  }

  return key.replace(/\\n/g, '\n');
}

function base64UrlEncode(data: string): string {
  return Buffer.from(data).toString('base64url');
}

function signJwt(payload: Record<string, unknown>, privateKey: string): string {
  const header = { alg: ALGORITHM, typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signature = sign('sha256', Buffer.from(signingInput), {
    key: privateKey,
    padding: constants.RSA_PKCS1_PADDING,
  }).toString('base64url');

  return `${signingInput}.${signature}`;
}

export function signEnterpriseKey(
  subscriptionId: string,
  licensee: string,
): string {
  const payload: EnterpriseKeyPayload = {
    iat: Math.floor(Date.now() / 1000),
    licensee,
    sub: subscriptionId,
  };

  return signJwt(payload, getPrivateKey());
}
