export const SETU_AI_ACTION_KINDS = [
  'send_email',
  'update_record_fields',
] as const;

export type SetuAiActionKind = (typeof SETU_AI_ACTION_KINDS)[number];
