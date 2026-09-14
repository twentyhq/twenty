import { signJwt } from './sign-jwt';

const DEFAULT_VALIDITY_TOKEN_DURATION_DAYS = 7;
const SECONDS_PER_DAY = 24 * 60 * 60;

type EnterpriseValidityPayload = {
  exp: number;
  iat: number;
  status: 'valid';
  sub: string;
};

type SignValidityTokenOptions = {
  subscriptionCancelAt: number | null;
  graceExpiresAt?: number | null;
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
  caps: (number | null | undefined)[],
): number {
  const defaultExp = nowSeconds + durationDays * SECONDS_PER_DAY;
  const applicableCaps = caps.filter(
    (cap): cap is number => typeof cap === 'number' && cap > 0,
  );

  return Math.min(defaultExp, ...applicableCaps);
}

export function signValidityToken(
  subscriptionId: string,
  options?: SignValidityTokenOptions,
): string {
  const now = Math.floor(Date.now() / 1000);
  const durationDays = getValidityTokenDurationDays();
  const exp = computeValidityExp(now, durationDays, [
    options?.subscriptionCancelAt,
    options?.graceExpiresAt,
  ]);

  const payload: EnterpriseValidityPayload = {
    exp,
    iat: now,
    status: 'valid',
    sub: subscriptionId,
  };

  return signJwt(payload);
}
