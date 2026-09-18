export const TRIAL_ELIGIBILITY_OUTCOME = {
  NOT_TRIALING: 'not-trialing',
  CARD_UNKNOWN: 'card-unknown',
  ALREADY_ENFORCED: 'already-enforced',
  TRIAL_KEPT: 'trial-kept',
  TRIAL_ENDED: 'trial-ended',
} as const;

export type TrialEligibilityOutcome =
  (typeof TRIAL_ELIGIBILITY_OUTCOME)[keyof typeof TRIAL_ELIGIBILITY_OUTCOME];
