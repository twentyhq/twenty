import { getLicenseeFromStripeCustomer } from './get-licensee-from-stripe-customer';

type CustomerArg = Parameters<typeof getLicenseeFromStripeCustomer>[0];

const customer = (fields: Record<string, unknown>): CustomerArg =>
  fields as unknown as CustomerArg;

describe('getLicenseeFromStripeCustomer', () => {
  it('should return the customer name when present', () => {
    expect(
      getLicenseeFromStripeCustomer(
        customer({ deleted: false, email: 'ops@acme.com', name: 'Acme Inc' }),
      ),
    ).toBe('Acme Inc');
  });

  it('should fall back to the email when the name is missing', () => {
    expect(
      getLicenseeFromStripeCustomer(
        customer({ deleted: false, email: 'ops@acme.com', name: null }),
      ),
    ).toBe('ops@acme.com');
  });

  it('should return Unknown when both name and email are missing', () => {
    expect(
      getLicenseeFromStripeCustomer(
        customer({ deleted: false, email: null, name: null }),
      ),
    ).toBe('Unknown');
  });

  it('should return Unknown for a deleted customer', () => {
    expect(
      getLicenseeFromStripeCustomer(
        customer({ deleted: true, name: 'Acme Inc' }),
      ),
    ).toBe('Unknown');
  });

  it('should return Unknown for an unexpanded customer id string', () => {
    expect(getLicenseeFromStripeCustomer('cus_123')).toBe('Unknown');
  });

  it('should return Unknown when there is no customer', () => {
    expect(getLicenseeFromStripeCustomer(null)).toBe('Unknown');
  });
});
