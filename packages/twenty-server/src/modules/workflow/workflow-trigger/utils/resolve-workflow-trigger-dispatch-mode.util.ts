import { isDefined } from 'twenty-shared/utils';

export type QueuedWorkflowTriggerDispatchIds = Partial<
  Record<'coreWorkflowVersionId' | 'workspaceWorkflowVersionId', string | null>
>;

export type WorkflowTriggerDispatchMode =
  | {
      mode: 'CORE';
      coreWorkflowVersionId: string;
      workspaceWorkflowVersionId: string;
    }
  | { mode: 'LEGACY' }
  | { mode: 'INCOMPLETE' };

export const resolveWorkflowTriggerDispatchMode = ({
  coreWorkflowVersionId,
  workspaceWorkflowVersionId,
}: QueuedWorkflowTriggerDispatchIds): WorkflowTriggerDispatchMode => {
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
