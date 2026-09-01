import { isDefined } from 'twenty-shared/utils';

import { type CoreDispatchIds } from 'src/engine/core-modules/workflow/types/workflow-automated-trigger-maps.type';

export type WorkflowTriggerDispatchMode =
  | {
      mode: 'CORE';
      coreWorkflowVersionId: string;
      workspaceWorkflowVersionId: string;
    }
  | { mode: 'LEGACY' }
  | { mode: 'INCOMPLETE' };

export const resolveWorkflowTriggerDispatchMode = (
  dispatchIds: CoreDispatchIds,
): WorkflowTriggerDispatchMode => {
  const { coreWorkflowVersionId, workspaceWorkflowVersionId } = dispatchIds;

  if (
    isDefined(coreWorkflowVersionId) &&
    isDefined(workspaceWorkflowVersionId)
  ) {
    return { mode: 'CORE', coreWorkflowVersionId, workspaceWorkflowVersionId };
  }

  if (
    isDefined(coreWorkflowVersionId) ||
    isDefined(workspaceWorkflowVersionId)
  ) {
    return { mode: 'INCOMPLETE' };
  }

  return { mode: 'LEGACY' };
};
