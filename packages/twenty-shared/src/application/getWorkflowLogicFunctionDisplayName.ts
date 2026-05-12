import { type WorkflowActionTriggerSettings } from './workflowActionTriggerSettingsType';

export const getWorkflowLogicFunctionDisplayName = ({
  name,
  workflowActionTriggerSettings,
}: {
  name: string;
  workflowActionTriggerSettings:
    | WorkflowActionTriggerSettings
    | null
    | undefined;
}): string => {
  const label = workflowActionTriggerSettings?.label?.trim();

  if (label !== undefined && label.length > 0) {
    return label;
  }

  return name;
};
