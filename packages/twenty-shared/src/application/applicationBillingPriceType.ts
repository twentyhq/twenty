import { type APPLICATION_BILLING_PRICE_CURRENCIES } from '@/application/constants/ApplicationBillingPriceCurrencies';
import { type APPLICATION_BILLING_PRICE_PERIODS } from '@/application/constants/ApplicationBillingPricePeriods';
import { type APPLICATION_BILLING_PRICE_TYPES } from '@/application/constants/ApplicationBillingPriceTypes';
import { type APPLICATION_BILLING_PRICE_UNITS } from '@/application/constants/ApplicationBillingPriceUnits';

export type ApplicationBillingPrice = {
  universalIdentifier: string;
  label: string;
  description?: string;
  type: (typeof APPLICATION_BILLING_PRICE_TYPES)[number];
  billingPeriod: (typeof APPLICATION_BILLING_PRICE_PERIODS)[number];
  amountCents: number;
  currency?: (typeof APPLICATION_BILLING_PRICE_CURRENCIES)[number];
  per?: (typeof APPLICATION_BILLING_PRICE_UNITS)[number];
};
