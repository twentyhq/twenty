import type Stripe from 'stripe';

import { isSearchableMetadataValue } from './is-searchable-metadata-value';
import { STRIPE_METADATA_KEY } from './stripe-metadata-key';

type SubscriptionSearcher = {
  subscriptions: Pick<Stripe['subscriptions'], 'search'>;
};

export async function hasPriorTrialForCard({
  stripe,
  cardFingerprint,
  excludedSubscriptionId,
}: {
  stripe: SubscriptionSearcher;
  cardFingerprint: unknown;
  excludedSubscriptionId: string;
}): Promise<boolean> {
  if (!isSearchableMetadataValue(cardFingerprint)) {
    return false;
  }

  try {
    // The subscription being enforced carries the same fingerprint once it has
    // been stamped, and a webhook retry arriving after the search index catches
    // up would otherwise see it and end its own trial.
    const result = await stripe.subscriptions.search({
      query: `metadata['${STRIPE_METADATA_KEY.TRIAL_CARD_FINGERPRINT}']:'${cardFingerprint}'`,
      limit: 2,
    });

    return result.data.some(
      (subscription) => subscription.id !== excludedSubscriptionId,
    );
  } catch (error: unknown) {
    console.error(
      '[enterprise-stripe-webhook] prior-trial lookup failed, keeping the trial',
      error,
    );

    return false;
  }
}
