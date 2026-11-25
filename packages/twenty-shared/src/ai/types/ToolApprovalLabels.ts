// Wording a tool gives its approval card in place of Approve and Reject. A label
// with a confirm label asks again before running, so its front component can
// collect what the alternative needs.
export type ToolApprovalLabels = {
  approve?: string;
  reject?: string;
  alternatives?: Record<string, { label: string; confirmLabel?: string }>;
};
