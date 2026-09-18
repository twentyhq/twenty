import type Stripe from 'stripe';

import { isSearchableMetadataValue } from './is-searchable-metadata-value';

// Stripe issues one fingerprint per card number, stable across customers and
// emails, which is what makes it usable as a trial identity. Non-card payment
// methods have no equivalent, so they simply cannot be matched.
export function extractCardFingerprint(
  paymentMethod: string | Stripe.PaymentMethod | null | undefined,
): string | undefined {
  if (typeof paymentMethod !== 'object' || paymentMethod === null) {
    return undefined;
  }

  const fingerprint = paymentMethod.card?.fingerprint;

  return isSearchableMetadataValue(fingerprint) ? fingerprint : undefined;
}
