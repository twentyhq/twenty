import { FieldActorSource } from 'twenty-shared/types';

import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

// Whoever started a run is who it waits on unless someone reassigns its Ask;
// a run started by a trigger has nobody to default to.
export const getRunInitiatorWorkspaceMemberId = (
  workflowRun: Pick<WorkflowRunWorkspaceEntity, 'createdBy'>,
): string | null =>
  workflowRun.createdBy?.source === FieldActorSource.MANUAL
    ? (workflowRun.createdBy.workspaceMemberId ?? null)
    : null;
