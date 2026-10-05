// Every pausing tool keeps its status in result.status, from the pending call to how it closed.
export const PAUSING_TOOL_CALL_STATUSES = [
  'pending',
  'running',
  'answered',
  'approved',
  'rejected',
  'failed',
  'conflict',
  'skipped',
] as const;

export type PausingToolCallStatus = (typeof PAUSING_TOOL_CALL_STATUSES)[number];
