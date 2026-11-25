// alternatives are keyed by tool name; a confirmLabel asks again before running that tool
export type ToolApprovalLabels = {
  approve?: string;
  reject?: string;
  alternatives?: Record<string, { label: string; confirmLabel?: string }>;
};
