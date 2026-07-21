// Keys used to persist the enterprise binding state on the Stripe subscription
// metadata (Stripe is the stateless store for twenty-website).
export const STRIPE_METADATA_KEY = {
  BOUND_SERVER_ID: 'boundServerId',
  BOUND_SERVER_LAST_SEEN_AT: 'boundServerLastSeenAt',
  DEV_SERVER_ID: 'devServerId',
  DEV_SERVER_LAST_SEEN_AT: 'devServerLastSeenAt',
  RELEASE_TIMESTAMPS: 'releaseTimestamps',
} as const;
