import type Stripe from 'stripe';

type StripeCustomerField =
  | string
  | Stripe.Customer
  | Stripe.DeletedCustomer
  | null;

// Derives the licensee label embedded in the enterprise key from a Stripe
// customer. Falls back to 'Unknown' when the customer is unexpanded (a string
// id), deleted, or has no name/email.
export const getLicenseeFromStripeCustomer = (
  customer: StripeCustomerField,
): string => {
  if (customer && typeof customer !== 'string' && !customer.deleted) {
    return customer.name ?? customer.email ?? 'Unknown';
  }

  return 'Unknown';
};
