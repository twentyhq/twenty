import type Stripe from 'stripe';

import { extractCardFingerprint } from './extract-card-fingerprint';
import { hasPriorTrialForCard } from './has-prior-trial-for-card';
import { STRIPE_METADATA_KEY } from './stripe-metadata-key';
import {
  TRIAL_ELIGIBILITY_OUTCOME,
  type TrialEligibilityOutcome,
} from './trial-eligibility-outcome';

type SubscriptionEnforcer = {
  subscriptions: Pick<
    Stripe['subscriptions'],
    'retrieve' | 'search' | 'update'
  >;
};

// Checkout withholds the trial on the serverId the instance reports, which the
// buyer controls. The card fingerprint comes from Stripe and cannot be chosen,
// so it is what actually holds: a card that has consumed a trial gets charged
// straight away on its next subscription.
export async function enforceTrialEligibility({
  stripe,
  subscriptionId,
}: {
  stripe: SubscriptionEnforcer;
  subscriptionId: string;
}): Promise<TrialEligibilityOutcome> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method'],
  });

  if (subscription.status !== 'trialing') {
    return TRIAL_ELIGIBILITY_OUTCOME.NOT_TRIALING;
  }

  const cardFingerprint = extractCardFingerprint(
    subscription.default_payment_method,
  );

  if (cardFingerprint === undefined) {
    return TRIAL_ELIGIBILITY_OUTCOME.CARD_UNKNOWN;
  }

  // Stripe redelivers a webhook until it is acknowledged, and the stamp is the
  // only record that this subscription was already judged.
  if (
    subscription.metadata?.[STRIPE_METADATA_KEY.TRIAL_CARD_FINGERPRINT] ===
    cardFingerprint
  ) {
    return TRIAL_ELIGIBILITY_OUTCOME.ALREADY_ENFORCED;
  }

  const hasPriorTrial = await hasPriorTrialForCard({
    stripe,
    cardFingerprint,
    excludedSubscriptionId: subscriptionId,
  });

  await stripe.subscriptions.update(subscriptionId, {
    metadata: { [STRIPE_METADATA_KEY.TRIAL_CARD_FINGERPRINT]: cardFingerprint },
    // Ending the trial bills the first period immediately, which is the point:
    // the purchase stands, the free month does not.
    ...(hasPriorTrial ? { trial_end: 'now' as const } : {}),
  });

  return hasPriorTrial
    ? TRIAL_ELIGIBILITY_OUTCOME.TRIAL_ENDED
    : TRIAL_ELIGIBILITY_OUTCOME.TRIAL_KEPT;
}
