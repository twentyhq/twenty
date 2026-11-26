import { type ToolTriggerApprovalSettings } from '@/application/toolTriggerApprovalSettingsType';

export const TOOL_TRIGGER_APPROVAL_LABEL_CONTEXTS = {
  approveLabel: 'logicFunction.toolTriggerSettings.approval.approveLabel',
  rejectLabel: 'logicFunction.toolTriggerSettings.approval.rejectLabel',
} as const satisfies Record<keyof ToolTriggerApprovalSettings, string>;
