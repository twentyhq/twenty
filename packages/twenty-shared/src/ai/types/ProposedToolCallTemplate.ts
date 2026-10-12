import { type PROPOSED_TOOL_CALL_TEMPLATES } from '@/ai/constants/proposed-tool-call-templates.const';

export type ProposedToolCallTemplate =
  (typeof PROPOSED_TOOL_CALL_TEMPLATES)[number];
