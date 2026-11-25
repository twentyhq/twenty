// alternatives must be other tools of the same application
export type ToolTriggerApprovalSettings = {
  approveLabel?: string;
  rejectLabel?: string;
  alternatives?: {
    logicFunctionUniversalIdentifier: string;
    label: string;
  }[];
};
