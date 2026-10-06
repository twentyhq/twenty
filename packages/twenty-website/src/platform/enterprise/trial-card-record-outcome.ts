export const TRIAL_CARD_RECORD_OUTCOME = {
  NOT_TRIALING: 'not-trialing',
  CARD_UNKNOWN: 'card-unknown',
  ALREADY_RECORDED: 'already-recorded',
  FIRST_TRIAL_FOR_CARD: 'first-trial-for-card',
  REPEAT_FLAGGED: 'repeat-flagged',
} as const;

export type TrialCardRecordOutcome =
  (typeof TRIAL_CARD_RECORD_OUTCOME)[keyof typeof TRIAL_CARD_RECORD_OUTCOME];
