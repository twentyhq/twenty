// How the approval card reviews a proposed call to this tool. Alternatives are
// other tools of the same application the person may run instead; a confirm
// label asks again before running one.
export type ToolTriggerApprovalSettings = {
  approveLabel?: string;
  rejectLabel?: string;
  alternatives?: {
    logicFunctionUniversalIdentifier: string;
    label: string;
    confirmLabel?: string;
  }[];
};
