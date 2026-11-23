import { isApplicationBillingPrice } from '@/application/isApplicationBillingPrice';

const price = {
  universalIdentifier: 'b7e41d08-2a93-4f5c-8d16-0c9e3b5a7f21',
  label: 'Per member',
  type: 'RECURRING',
  billingPeriod: 'MONTHLY',
  amountCents: 1000,
};

describe('isApplicationBillingPrice', () => {
  it('should accept a price with only the required fields', () => {
    expect(isApplicationBillingPrice(price)).toBe(true);
  });

  it('should accept a price with every optional field', () => {
    expect(
      isApplicationBillingPrice({
        ...price,
        description: 'Monthly price per workspace member',
        currency: 'USD',
        per: 'WORKSPACE_MEMBER',
      }),
    ).toBe(true);
  });

  it.each([
    ['a non object', 'price'],
    ['an array', [price]],
    ['a non uuid universalIdentifier', { ...price, universalIdentifier: 'a' }],
    ['an empty label', { ...price, label: '' }],
    ['an empty description', { ...price, description: '' }],
    ['an unknown type', { ...price, type: 'ONE_TIME' }],
    ['an unknown billingPeriod', { ...price, billingPeriod: 'YEARLY' }],
    ['a negative amountCents', { ...price, amountCents: -1 }],
    ['an unknown currency', { ...price, currency: 'EUR' }],
    ['an unknown unit', { ...price, per: 'CONNECTION' }],
  ])('should reject %s', (_, value) => {
    expect(isApplicationBillingPrice(value)).toBe(false);
  });
});
