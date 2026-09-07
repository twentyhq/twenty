import { SUBSCRIPTION_LICENSE_OUTCOME } from './subscription-license-outcome';

const SECONDS_PER_DAY = 24 * 60 * 60;

const LICENSED_STATUSES = new Set(['active', 'trialing']);

// Stripe retries a failed invoice for the whole dunning window before it
// resolves the subscription to canceled or unpaid. Cutting the license off at
// the first failed charge takes an instance down while the customer's payment
// is still being retried, so past_due keeps its license until dunning ends.
const GRACE_STATUSES = new Set(['past_due']);

export type ResolveSubscriptionLicenseStateInput = {
  status: string;
  currentPeriodStart: number | null;
  gracePeriodDays: number;
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
  currentPeriodStart,
  gracePeriodDays,
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

  const nowSeconds = Math.floor(now.getTime() / 1000);

  // The failed invoice that opens dunning is the one billed at the start of the
  // current period. Anchoring there bounds the grace even if Stripe is
  // configured to leave a subscription past_due instead of resolving it.
  const graceAnchor =
    typeof currentPeriodStart === 'number' && currentPeriodStart > 0
      ? currentPeriodStart
      : nowSeconds;

  const graceExpiresAt = graceAnchor + gracePeriodDays * SECONDS_PER_DAY;

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
