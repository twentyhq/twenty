// alternatives must be other tools of the same application; a confirmLabel asks again before running one
export type ToolTriggerApprovalSettings = {
  approveLabel?: string;
  rejectLabel?: string;
  alternatives?: {
    logicFunctionUniversalIdentifier: string;
    label: string;
    confirmLabel?: string;
  }[];
};
