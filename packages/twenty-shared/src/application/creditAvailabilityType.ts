export const CREDIT_UNAVAILABLE_REASONS = [
  'workspace-suspended',
  'no-subscription',
  'no-credits',
] as const;

export type CreditUnavailableReason =
  (typeof CREDIT_UNAVAILABLE_REASONS)[number];

// Mirrors the platform's AI, workflow and email spend gate; deliberately carries no balance.
export type CreditAvailability =
  | { hasAvailableCredits: true }
  | { hasAvailableCredits: false; reason: CreditUnavailableReason };
