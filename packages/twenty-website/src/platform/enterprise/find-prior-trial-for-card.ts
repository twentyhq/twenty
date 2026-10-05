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

  const result = await stripe.subscriptions.search({
    query: `metadata['${STRIPE_METADATA_KEY.TRIAL_CARD_FINGERPRINT}']:'${cardFingerprint}'`,
    limit: 2,
  });

  return result.data.find(
    (subscription) => subscription.id !== excludedSubscriptionId,
  )?.id;
}
