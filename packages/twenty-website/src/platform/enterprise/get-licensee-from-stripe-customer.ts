import type Stripe from 'stripe';

type StripeCustomerField =
  | string
  | Pick<Stripe.Customer, 'deleted' | 'name' | 'email'>
  | Pick<Stripe.DeletedCustomer, 'deleted'>
  | null;

export function getLicenseeFromStripeCustomer(
  customer: StripeCustomerField,
): string {
  if (customer && typeof customer !== 'string' && !customer.deleted) {
    return customer.name ?? customer.email ?? 'Unknown';
  }

  return 'Unknown';
}
