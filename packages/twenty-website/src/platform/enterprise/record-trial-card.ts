import type Stripe from 'stripe';

import { extractCardFingerprint } from './extract-card-fingerprint';
import { findPriorTrialForCard } from './find-prior-trial-for-card';
import { STRIPE_METADATA_KEY } from './stripe-metadata-key';
import {
  TRIAL_CARD_RECORD_OUTCOME,
  type TrialCardRecordOutcome,
} from './trial-card-record-outcome';

type SubscriptionRecorder = {
  subscriptions: Pick<
    Stripe['subscriptions'],
    'retrieve' | 'search' | 'update'
  >;
};

// Records which card consumed a trial and flags a card that has had one before.
// The trial is never revoked: checkout has already shown this customer a free
// period, and billing them against what the page promised is not something we
// do to catch the minority who forged their server id.
export async function recordTrialCard({
  stripe,
  subscriptionId,
}: {
  stripe: SubscriptionRecorder;
  subscriptionId: string;
}): Promise<TrialCardRecordOutcome> {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['default_payment_method'],
  });

  if (subscription.status !== 'trialing') {
    return TRIAL_CARD_RECORD_OUTCOME.NOT_TRIALING;
  }

  const cardFingerprint = extractCardFingerprint(
    subscription.default_payment_method,
  );

  if (cardFingerprint === undefined) {
    return TRIAL_CARD_RECORD_OUTCOME.CARD_UNKNOWN;
  }

  // Stripe redelivers a webhook until it is acknowledged, and the stamp is the
  // only record that this subscription was already looked at.
  if (
    subscription.metadata?.[STRIPE_METADATA_KEY.TRIAL_CARD_FINGERPRINT] ===
    cardFingerprint
  ) {
    return TRIAL_CARD_RECORD_OUTCOME.ALREADY_RECORDED;
  }

  const priorTrialSubscriptionId = await findPriorTrialForCard({
    stripe,
    cardFingerprint,
    excludedSubscriptionId: subscriptionId,
  });

  await stripe.subscriptions.update(subscriptionId, {
    metadata: {
      [STRIPE_METADATA_KEY.TRIAL_CARD_FINGERPRINT]: cardFingerprint,
      ...(priorTrialSubscriptionId === undefined
        ? {}
        : {
            [STRIPE_METADATA_KEY.PRIOR_TRIAL_SUBSCRIPTION_ID]:
              priorTrialSubscriptionId,
          }),
    },
  });

  if (priorTrialSubscriptionId === undefined) {
    return TRIAL_CARD_RECORD_OUTCOME.FIRST_TRIAL_FOR_CARD;
  }

  console.warn(
    `[enterprise-stripe-webhook] ${subscriptionId} trials on a card that already trialed on ${priorTrialSubscriptionId}`,
  );

  return TRIAL_CARD_RECORD_OUTCOME.REPEAT_FLAGGED;
}
