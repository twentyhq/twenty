import * as crypto from 'crypto';

type EnterpriseKeyPayload = {
  sub: string;
  licensee: string;
  iat: number;
};

type EnterpriseValidityPayload = {
  sub: string;
  status: 'valid';
  iat: number;
  exp: number;
};

const ALGORITHM = 'RS256';
const DEFAULT_VALIDITY_TOKEN_DURATION_DAYS = 30;

const getValidityTokenDurationDays = (): number => {
  const value = process.env.ENTERPRISE_VALIDITY_TOKEN_DURATION_DAYS;

  if (value === undefined || value === '') {
    return DEFAULT_VALIDITY_TOKEN_DURATION_DAYS;
  }

  const parsed = parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return DEFAULT_VALIDITY_TOKEN_DURATION_DAYS;
  }

  return parsed;
};

type SignValidityTokenOptions = {
  subscriptionCancelAt: number | null;
};

const computeValidityExp = (
  nowSeconds: number,
  durationDays: number,
  subscriptionCancelAt: number | null,
): number => {
  const defaultExp = nowSeconds + durationDays * 24 * 60 * 60;

  if (subscriptionCancelAt === null || subscriptionCancelAt <= 0) {
    return defaultExp;
  }

  return Math.min(defaultExp, subscriptionCancelAt);
};

const getPrivateKey = (): string => {
  const key = process.env.ENTERPRISE_JWT_PRIVATE_KEY;

  if (!key) {
    throw new Error('ENTERPRISE_JWT_PRIVATE_KEY is not configured');
  }

  return key.replace(/\\n/g, '\n');
};

const base64UrlEncode = (data: string): string => {
  return Buffer.from(data).toString('base64url');
};

const base64UrlDecode = (data: string): string => {
  return Buffer.from(data, 'base64url').toString('utf-8');
};

const signJwt = (
  payload: Record<string, unknown>,
  privateKey: string,
): string => {
  const header = { alg: ALGORITHM, typ: 'JWT' };
  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(payload));
  const signingInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .sign('sha256', Buffer.from(signingInput), {
      key: privateKey,
      padding: crypto.constants.RSA_PKCS1_PADDING,
    })
    .toString('base64url');

  return `${signingInput}.${signature}`;
};

export const verifyJwt = <T extends Record<string, unknown>>(
  token: string,
  publicKey: string,
): T | null => {
  try {
    const parts = token.split('.');

    if (parts.length !== 3) {
      return null;
    }

    const [encodedHeader, encodedPayload, signature] = parts;
    const signingInput = `${encodedHeader}.${encodedPayload}`;

    const signatureBuffer = Buffer.from(signature, 'base64url');

    const isValid = crypto.verify(
      'sha256',
      Buffer.from(signingInput),
      {
        key: publicKey,
        padding: crypto.constants.RSA_PKCS1_PADDING,
      },
      signatureBuffer,
    );

    if (!isValid) {
      return null;
    }

    return JSON.parse(base64UrlDecode(encodedPayload)) as T;
  } catch {
    return null;
  }
};

export const signEnterpriseKey = (
  subscriptionId: string,
  licensee: string,
): string => {
  const payload: EnterpriseKeyPayload = {
    sub: subscriptionId,
    licensee,
    iat: Math.floor(Date.now() / 1000),
  };

  return signJwt(payload, getPrivateKey());
};

export const signValidityToken = (
  subscriptionId: string,
  options?: SignValidityTokenOptions,
): string => {
  const now = Math.floor(Date.now() / 1000);
  const durationDays = getValidityTokenDurationDays();
  const subscriptionCancelAt = options?.subscriptionCancelAt ?? null;
  const exp = computeValidityExp(now, durationDays, subscriptionCancelAt);

  const payload: EnterpriseValidityPayload = {
    sub: subscriptionId,
    status: 'valid',
    iat: now,
    exp,
  };

  return signJwt(payload, getPrivateKey());
};

export const verifyEnterpriseKey = (
  token: string,
): EnterpriseKeyPayload | null => {
  const publicKey = getPublicKey();

  return verifyJwt<EnterpriseKeyPayload>(token, publicKey);
};

const getPublicKey = (): string => {
  const key = process.env.ENTERPRISE_JWT_PUBLIC_KEY;

  if (!key) {
    throw new Error('ENTERPRISE_JWT_PUBLIC_KEY is not configured');
  }

  return key.replace(/\\n/g, '\n');
};
