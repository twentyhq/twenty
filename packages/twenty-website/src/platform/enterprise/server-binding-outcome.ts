export const SERVER_BINDING_OUTCOME = {
  ALLOWED: 'allowed',
  REJECTED: 'rejected',
} as const;

export type ServerBindingOutcome =
  (typeof SERVER_BINDING_OUTCOME)[keyof typeof SERVER_BINDING_OUTCOME];
