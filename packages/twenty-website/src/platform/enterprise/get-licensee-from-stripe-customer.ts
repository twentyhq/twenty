import type Stripe from 'stripe';

type StripeCustomerField =
  | string
  | Stripe.Customer
  | Stripe.DeletedCustomer
  | null;

export function getLicenseeFromStripeCustomer(
  customer: StripeCustomerField,
): string {
  if (customer && typeof customer !== 'string' && !customer.deleted) {
    return customer.name ?? customer.email ?? 'Unknown';
  }

  return 'Unknown';
}
