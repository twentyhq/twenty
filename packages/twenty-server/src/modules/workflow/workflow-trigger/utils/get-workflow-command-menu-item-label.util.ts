import { isNonEmptyString } from '@sniptt/guards';

import { type WorkflowEntity } from 'src/engine/core-modules/workflow/entities/workflow.entity';

export const DEFAULT_WORKFLOW_COMMAND_MENU_ITEM_LABEL = 'Untitled Workflow';

export const getWorkflowCommandMenuItemLabel = (
  workflow: Pick<WorkflowEntity, 'name'>,
): string =>
  isNonEmptyString(workflow.name)
    ? workflow.name
    : DEFAULT_WORKFLOW_COMMAND_MENU_ITEM_LABEL;
