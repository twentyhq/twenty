export const PROPOSED_TOOL_CALL_TEMPLATES = [
  'recordCreate',
  'recordUpdate',
  'recordDelete',
  'email',
  'generic',
] as const;

export type ProposedToolCallTemplate =
  (typeof PROPOSED_TOOL_CALL_TEMPLATES)[number];
