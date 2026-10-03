import { type PROPOSE_TOOL_CALL_TOOL_STATUSES } from '@/ai/constants/propose-tool-call-tool-statuses.const';

export type ProposeToolCallToolStatus =
  (typeof PROPOSE_TOOL_CALL_TOOL_STATUSES)[number];
