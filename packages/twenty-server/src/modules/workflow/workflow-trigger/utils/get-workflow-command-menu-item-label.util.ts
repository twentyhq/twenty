import { isNonEmptyString } from '@sniptt/guards';

export const DEFAULT_WORKFLOW_COMMAND_MENU_ITEM_LABEL = 'Untitled Workflow';

export const getWorkflowCommandMenuItemLabel = (workflow: {
  name: string | null;
}): string =>
  isNonEmptyString(workflow.name)
    ? workflow.name
    : DEFAULT_WORKFLOW_COMMAND_MENU_ITEM_LABEL;
