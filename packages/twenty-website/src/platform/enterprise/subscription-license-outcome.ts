export const SUBSCRIPTION_LICENSE_OUTCOME = {
  LICENSED: 'licensed',
  GRACE: 'grace',
  REJECTED: 'rejected',
} as const;

export type SubscriptionLicenseOutcome =
  (typeof SUBSCRIPTION_LICENSE_OUTCOME)[keyof typeof SUBSCRIPTION_LICENSE_OUTCOME];
