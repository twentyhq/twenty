export type PartnerApplicationStepId =
  | 'identity'
  | 'profile'
  | 'expertise'
  | 'experience'
  | 'commercials';

// Order is the wizard's step order: the reducer indexes into this by stepIndex.
export const PARTNER_APPLICATION_STEP_IDS: readonly PartnerApplicationStepId[] =
  ['identity', 'profile', 'expertise', 'experience', 'commercials'];
