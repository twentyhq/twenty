import { signJwt } from './sign-jwt';

const DEFAULT_VALIDITY_TOKEN_DURATION_DAYS = 30;
const SECONDS_PER_DAY = 24 * 60 * 60;

type EnterpriseValidityPayload = {
  exp: number;
  iat: number;
  status: 'valid';
  sub: string;
};

type SignValidityTokenOptions = {
  subscriptionCancelAt: number | null;
};

function getValidityTokenDurationDays(): number {
  const value = process.env.ENTERPRISE_VALIDITY_TOKEN_DURATION_DAYS;

  if (value === undefined || value === '') {
    return DEFAULT_VALIDITY_TOKEN_DURATION_DAYS;
  }

  const parsed = Number.parseInt(value, 10);

  if (Number.isNaN(parsed) || parsed < 1) {
    return DEFAULT_VALIDITY_TOKEN_DURATION_DAYS;
  }

  return parsed;
}

function computeValidityExp(
  nowSeconds: number,
  durationDays: number,
  subscriptionCancelAt: number | null,
): number {
  const defaultExp = nowSeconds + durationDays * SECONDS_PER_DAY;

  if (subscriptionCancelAt === null || subscriptionCancelAt <= 0) {
    return defaultExp;
  }

  return Math.min(defaultExp, subscriptionCancelAt);
}

export function signValidityToken(
  subscriptionId: string,
  options?: SignValidityTokenOptions,
): string {
  const now = Math.floor(Date.now() / 1000);
  const durationDays = getValidityTokenDurationDays();
  const subscriptionCancelAt = options?.subscriptionCancelAt ?? null;
  const exp = computeValidityExp(now, durationDays, subscriptionCancelAt);

  const payload: EnterpriseValidityPayload = {
    exp,
    iat: now,
    status: 'valid',
    sub: subscriptionId,
  };

  return signJwt(payload);
}
