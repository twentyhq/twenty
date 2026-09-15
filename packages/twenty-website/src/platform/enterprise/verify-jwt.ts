import { constants, verify } from 'node:crypto';

function getPublicKey(): string {
  const key = process.env.ENTERPRISE_JWT_PUBLIC_KEY;

  if (!key) {
    throw new Error('ENTERPRISE_JWT_PUBLIC_KEY is not configured');
  }

  return key.replace(/\\n/g, '\n');
}

function base64UrlDecode(data: string): string {
  return Buffer.from(data, 'base64url').toString('utf-8');
}

export function verifyJwt<TPayload extends Record<string, unknown>>(
  token: string,
): TPayload | null {
  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const signatureBuffer = Buffer.from(signature, 'base64url');

    const isValid = verify(
      'sha256',
      Buffer.from(signingInput),
      {
        key: getPublicKey(),
        padding: constants.RSA_PKCS1_PADDING,
      },
      signatureBuffer,
    );

    if (!isValid) {
      return null;
    }

    return JSON.parse(base64UrlDecode(encodedPayload)) as TPayload;
  } catch {
    return null;
  }
}
