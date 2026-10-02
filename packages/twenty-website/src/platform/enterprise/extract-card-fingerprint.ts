import type Stripe from 'stripe';

import { isSearchableMetadataValue } from './is-searchable-metadata-value';

export function extractCardFingerprint(
  paymentMethod: string | Stripe.PaymentMethod | null | undefined,
): string | undefined {
  if (typeof paymentMethod !== 'object' || paymentMethod === null) {
    return undefined;
  }

  const fingerprint = paymentMethod.card?.fingerprint;

  return isSearchableMetadataValue(fingerprint) ? fingerprint : undefined;
}
