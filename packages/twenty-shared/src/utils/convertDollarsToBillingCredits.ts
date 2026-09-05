import { DOLLAR_TO_CREDIT_MULTIPLIER } from '../constants/DollarToCreditMultiplier';

export const convertDollarsToBillingCredits = (dollars: number): number =>
  dollars * DOLLAR_TO_CREDIT_MULTIPLIER;
