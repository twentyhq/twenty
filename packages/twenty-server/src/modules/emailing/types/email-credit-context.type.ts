import { type CurrentBillingSubscription } from 'src/engine/core-modules/billing/types/flat-billing-subscription.type';

export type EmailCreditContext = {
  hasCredits: boolean;
  currentBillingSubscription: CurrentBillingSubscription;
};
