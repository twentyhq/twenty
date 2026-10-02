export type ToolCallApprovalResponse =
  | { decision: 'approve'; arguments?: Record<string, unknown> }
  | { decision: 'reject'; feedback?: string };
