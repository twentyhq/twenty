export function getEnterprisePriceId(
  billingInterval: 'monthly' | 'yearly' = 'monthly',
): string {
  const envKey =
    billingInterval === 'yearly'
      ? 'STRIPE_ENTERPRISE_YEARLY_PRICE_ID'
      : 'STRIPE_ENTERPRISE_MONTHLY_PRICE_ID';

  const priceId = process.env[envKey];

  if (!priceId) {
    throw new Error(`${envKey} is not configured`);
  }

  return priceId;
}
