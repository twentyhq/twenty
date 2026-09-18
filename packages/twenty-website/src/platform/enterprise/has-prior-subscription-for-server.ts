import type Stripe from 'stripe';

import { isSearchableMetadataValue } from './is-searchable-metadata-value';
import { normalizeServerId } from './normalize-server-id';
import { STRIPE_METADATA_KEY } from './stripe-metadata-key';

type SubscriptionSearcher = {
  subscriptions: Pick<Stripe['subscriptions'], 'search'>;
};

export async function hasPriorSubscriptionForServer({
  stripe,
  serverId,
}: {
  stripe: SubscriptionSearcher;
  serverId: unknown;
}): Promise<boolean> {
  const normalizedServerId = normalizeServerId(serverId);

  if (!isSearchableMetadataValue(normalizedServerId)) {
    return false;
  }

  // TRIAL_SERVER_ID alone would suffice going forward, but subscriptions sold
  // before it existed only carry BOUND_SERVER_ID. Stripe allows up to 10
  // clauses and forbids mixing OR with AND.
  const query = [
    `metadata['${STRIPE_METADATA_KEY.TRIAL_SERVER_ID}']:'${normalizedServerId}'`,
    `metadata['${STRIPE_METADATA_KEY.BOUND_SERVER_ID}']:'${normalizedServerId}'`,
  ].join(' OR ');

  try {
    const result = await stripe.subscriptions.search({ query, limit: 1 });

    return result.data.length > 0;
  } catch (error: unknown) {
    console.error(
      '[enterprise-checkout] prior-subscription lookup failed, granting the trial',
      error,
    );

    return false;
  }
}
