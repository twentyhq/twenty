export const CREDIT_UNAVAILABLE_REASONS = [
  'workspace-suspended',
  'no-subscription',
  'no-credits',
] as const;

export type CreditUnavailableReason =
  (typeof CREDIT_UNAVAILABLE_REASONS)[number];

// What an application is told about its workspace's ability to spend. Mirrors
// the gate the platform already applies to AI, workflows and email, so an app
// can make the same decision up front instead of discovering the refusal
// through a downstream call it did not write. Carries no balance: an app learns
// whether it may spend, not how much the workspace has or what it pays.
export type CreditAvailability =
  | { hasAvailableCredits: true }
  | { hasAvailableCredits: false; reason: CreditUnavailableReason };
