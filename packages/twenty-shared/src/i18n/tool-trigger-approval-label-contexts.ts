import { type ToolTriggerApprovalSettings } from '@/application/toolTriggerApprovalSettingsType';

// The CLI extraction and the server lookup hash the label with this context, so both must read it from here.
export const TOOL_TRIGGER_APPROVAL_LABEL_CONTEXTS = {
  approveLabel: 'logicFunction.toolTriggerSettings.approval.approveLabel',
  rejectLabel: 'logicFunction.toolTriggerSettings.approval.rejectLabel',
} as const satisfies Record<keyof ToolTriggerApprovalSettings, string>;
