import { isNonEmptyString } from '@sniptt/guards';

import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

export const DEFAULT_WORKFLOW_COMMAND_MENU_ITEM_LABEL = 'Untitled Workflow';

export const getWorkflowCommandMenuItemLabel = (
  workflow: Pick<WorkflowWorkspaceEntity, 'name'>,
): string =>
  isNonEmptyString(workflow.name)
    ? workflow.name
    : DEFAULT_WORKFLOW_COMMAND_MENU_ITEM_LABEL;
