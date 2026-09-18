// Keys used to persist the enterprise binding state on the Stripe subscription
// metadata (Stripe is the stateless store for twenty-website).
export const STRIPE_METADATA_KEY = {
  BOUND_SERVER_ID: 'boundServerId',
  BOUND_SERVER_LAST_SEEN_AT: 'boundServerLastSeenAt',
  DEV_SERVER_ID: 'devServerId',
  DEV_SERVER_LAST_SEEN_AT: 'devServerLastSeenAt',
  RELEASE_TIMESTAMPS: 'releaseTimestamps',
  // Stamped once when a trial is granted and never cleared. BOUND_SERVER_ID is
  // wiped on release, so it cannot answer "has this server had a trial before".
  TRIAL_SERVER_ID: 'trialServerId',
  // Card fingerprint of the payment method that consumed a trial. Stripe
  // derives it, so unlike TRIAL_SERVER_ID the buyer cannot choose it.
  TRIAL_CARD_FINGERPRINT: 'trialCardFingerprint',
  // Set when this card already had a trial elsewhere. Nothing acts on it: it
  // exists so a human can search Stripe for repeats and decide.
  PRIOR_TRIAL_SUBSCRIPTION_ID: 'priorTrialSubscriptionId',
} as const;
