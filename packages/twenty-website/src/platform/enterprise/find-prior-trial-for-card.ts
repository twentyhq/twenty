import type Stripe from 'stripe';

import { isSearchableMetadataValue } from './is-searchable-metadata-value';
import { STRIPE_METADATA_KEY } from './stripe-metadata-key';

type SubscriptionSearcher = {
  subscriptions: Pick<Stripe['subscriptions'], 'search'>;
};

export async function findPriorTrialForCard({
  stripe,
  cardFingerprint,
  excludedSubscriptionId,
}: {
  stripe: SubscriptionSearcher;
  cardFingerprint: unknown;
  excludedSubscriptionId: string;
}): Promise<string | undefined> {
  if (!isSearchableMetadataValue(cardFingerprint)) {
    return undefined;
  }

  try {
    // The subscription being recorded carries the same fingerprint once it has
    // been stamped, so a webhook retry arriving after the search index catches
    // up would otherwise report the subscription against itself.
    const result = await stripe.subscriptions.search({
      query: `metadata['${STRIPE_METADATA_KEY.TRIAL_CARD_FINGERPRINT}']:'${cardFingerprint}'`,
      limit: 2,
    });

    return result.data.find(
      (subscription) => subscription.id !== excludedSubscriptionId,
    )?.id;
  } catch (error: unknown) {
    console.error(
      '[enterprise-stripe-webhook] prior-trial lookup failed, recording nothing',
      error,
    );

    return undefined;
  }
}
