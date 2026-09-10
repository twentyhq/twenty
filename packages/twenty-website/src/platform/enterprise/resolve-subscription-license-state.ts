import { SUBSCRIPTION_LICENSE_OUTCOME } from './subscription-license-outcome';

const SECONDS_PER_DAY = 24 * 60 * 60;
const GRACE_MARGIN_SECONDS = SECONDS_PER_DAY;

const LICENSED_STATUSES = new Set(['active', 'trialing']);

const GRACE_STATUSES = new Set(['past_due']);

export type ResolveSubscriptionLicenseStateInput = {
  status: string;
  nextPaymentAttempt: number | null;
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

const licensed = (): SubscriptionLicenseState => ({
  outcome: SUBSCRIPTION_LICENSE_OUTCOME.LICENSED,
  graceExpiresAt: null,
});

const rejected = (): SubscriptionLicenseState => ({
  outcome: SUBSCRIPTION_LICENSE_OUTCOME.REJECTED,
  graceExpiresAt: null,
});

const grace = (graceExpiresAt: number): SubscriptionLicenseState => ({
  outcome: SUBSCRIPTION_LICENSE_OUTCOME.GRACE,
  graceExpiresAt,
});

export function resolveSubscriptionLicenseState({
  status,
  nextPaymentAttempt,
}: ResolveSubscriptionLicenseStateInput): SubscriptionLicenseState {
  if (LICENSED_STATUSES.has(status)) {
    return licensed();
  }

  if (GRACE_STATUSES.has(status)) {
    if (typeof nextPaymentAttempt !== 'number' || nextPaymentAttempt <= 0) {
      return rejected();
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    const graceExpiresAt = nextPaymentAttempt + GRACE_MARGIN_SECONDS;

    if (graceExpiresAt <= nowSeconds) {
      return rejected();
    }

    return grace(graceExpiresAt);
  }

  return rejected();
}
