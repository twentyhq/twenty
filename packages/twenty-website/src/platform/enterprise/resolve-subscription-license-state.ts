import { SUBSCRIPTION_LICENSE_OUTCOME } from './subscription-license-outcome';

const SECONDS_PER_DAY = 24 * 60 * 60;
const GRACE_MARGIN_SECONDS = SECONDS_PER_DAY;

const LICENSED_STATUSES = new Set(['active', 'trialing']);

const GRACE_STATUSES = new Set(['past_due']);

export type ResolveSubscriptionLicenseStateInput = {
  status: string;
  nextPaymentAttempt: number | null;
  now?: Date;
};

export type SubscriptionLicenseState =
  | {
      outcome: typeof SUBSCRIPTION_LICENSE_OUTCOME.LICENSED;
      graceExpiresAt: null;
    }
  | {
      outcome: typeof SUBSCRIPTION_LICENSE_OUTCOME.GRACE;
      graceExpiresAt: number;
    }
  | {
      outcome: typeof SUBSCRIPTION_LICENSE_OUTCOME.REJECTED;
      graceExpiresAt: null;
    };

export function resolveSubscriptionLicenseState({
  status,
  nextPaymentAttempt,
  now = new Date(),
}: ResolveSubscriptionLicenseStateInput): SubscriptionLicenseState {
  if (LICENSED_STATUSES.has(status)) {
    return {
      outcome: SUBSCRIPTION_LICENSE_OUTCOME.LICENSED,
      graceExpiresAt: null,
    };
  }

  if (!GRACE_STATUSES.has(status)) {
    return {
      outcome: SUBSCRIPTION_LICENSE_OUTCOME.REJECTED,
      graceExpiresAt: null,
    };
  }

  if (typeof nextPaymentAttempt !== 'number' || nextPaymentAttempt <= 0) {
    return {
      outcome: SUBSCRIPTION_LICENSE_OUTCOME.REJECTED,
      graceExpiresAt: null,
    };
  }

  const nowSeconds = Math.floor(now.getTime() / 1000);
  const graceExpiresAt = nextPaymentAttempt + GRACE_MARGIN_SECONDS;

  if (graceExpiresAt <= nowSeconds) {
    return {
      outcome: SUBSCRIPTION_LICENSE_OUTCOME.REJECTED,
      graceExpiresAt: null,
    };
  }

  return {
    outcome: SUBSCRIPTION_LICENSE_OUTCOME.GRACE,
    graceExpiresAt,
  };
}
