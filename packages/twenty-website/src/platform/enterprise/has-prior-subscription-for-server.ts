import type Stripe from 'stripe';

import { isSearchableServerId } from './is-searchable-server-id';
import { normalizeServerId } from './normalize-server-id';
import { STRIPE_METADATA_KEY } from './stripe-metadata-key';

export async function hasPriorSubscriptionForServer({
  stripe,
  serverId,
}: {
  stripe: Stripe;
  serverId: unknown;
}): Promise<boolean> {
  const normalizedServerId = normalizeServerId(serverId);

  if (!isSearchableServerId(normalizedServerId)) {
    return false;
  }

  try {
    const result = await stripe.subscriptions.search({
      query: `metadata['${STRIPE_METADATA_KEY.BOUND_SERVER_ID}']:'${normalizedServerId}'`,
      limit: 1,
    });

    return result.data.length > 0;
  } catch {
    return false;
  }
}
