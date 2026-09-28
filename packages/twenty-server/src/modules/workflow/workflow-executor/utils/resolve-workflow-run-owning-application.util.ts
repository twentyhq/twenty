import { isDefined } from 'twenty-shared/utils';

import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { type FlatWorkflowMaps } from 'src/engine/metadata-modules/flat-workflow/types/flat-workflow-maps.type';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

export const resolveWorkflowRunOwningApplication = ({
  workflowRun,
  flatWorkflowMaps,
  flatApplicationMaps,
  workspaceOwnedApplicationIds,
}: {
  workflowRun: Pick<
    WorkflowRunWorkspaceEntity,
    'coreWorkflowId' | 'workflowId'
  >;
  flatWorkflowMaps: FlatWorkflowMaps;
  flatApplicationMaps: FlatApplicationCacheMaps;
  workspaceOwnedApplicationIds: string[];
}): FlatApplication | null => {
  if (!isDefined(workflowRun.coreWorkflowId)) {
    return null;
  }

  const coreWorkflow = findFlatEntityByIdInFlatEntityMaps({
    flatEntityId: workflowRun.coreWorkflowId,
    flatEntityMaps: flatWorkflowMaps,
  });

  if (!isDefined(coreWorkflow)) {
    if (isDefined(workflowRun.workflowId)) {
      return null;
    }

    throw new WorkflowStepExecutorException(
      'The workflow of this run no longer exists, so the permissions to run its steps cannot be determined',
      WorkflowStepExecutorExceptionCode.FORBIDDEN,
    );
  }

  if (workspaceOwnedApplicationIds.includes(coreWorkflow.applicationId)) {
    return null;
  }

  const owningApplication =
    flatApplicationMaps.byId[coreWorkflow.applicationId];

  if (!isDefined(owningApplication) || isDefined(owningApplication.deletedAt)) {
    throw new WorkflowStepExecutorException(
      'The application that owns this workflow is no longer installed',
      WorkflowStepExecutorExceptionCode.FORBIDDEN,
    );
  }

  return owningApplication;
};
