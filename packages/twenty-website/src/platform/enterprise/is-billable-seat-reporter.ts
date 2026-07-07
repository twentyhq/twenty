import isEmpty from 'lodash.isempty';

import { isDefined } from 'twenty-shared/utils';

import { normalizeServerId } from './normalize-server-id';
import { STRIPE_METADATA_KEY } from './stripe-metadata-key';
import { type StripeMetadata } from './stripe-metadata';

export function isBillableSeatReporter({
  stripeMetadata,
  serverId,
}: {
  stripeMetadata: StripeMetadata;
  serverId?: string;
}): boolean {
  const normalizedServerId = normalizeServerId(serverId);
  const boundServerId = stripeMetadata?.[STRIPE_METADATA_KEY.BOUND_SERVER_ID];

  if (isEmpty(boundServerId)) {
    return !isDefined(normalizedServerId);
  }

  return normalizedServerId === boundServerId;
}
