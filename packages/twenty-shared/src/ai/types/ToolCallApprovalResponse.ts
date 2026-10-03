// toolName picks one of the proposal's alternatives instead of the proposed tool
export type ToolCallApprovalResponse =
  | {
      decision: 'approve';
      toolName?: string;
      arguments?: Record<string, unknown>;
    }
  | { decision: 'reject'; feedback?: string };
