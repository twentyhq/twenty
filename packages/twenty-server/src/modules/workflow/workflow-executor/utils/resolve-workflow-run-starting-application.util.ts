import { isDefined } from 'twenty-shared/utils';

import { type FlatApplicationCacheMaps } from 'src/engine/core-modules/application/types/flat-application-cache-maps.type';
import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { type WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

export const resolveWorkflowRunStartingApplication = ({
  workflowRun,
  flatApplicationMaps,
  workspaceOwnedApplicationIds,
}: {
  workflowRun: Pick<WorkflowRunWorkspaceEntity, 'createdBy'>;
  flatApplicationMaps: FlatApplicationCacheMaps;
  workspaceOwnedApplicationIds: string[];
}): FlatApplication | null => {
  const startingApplicationId = workflowRun.createdBy.context?.applicationId;

  if (
    !isDefined(startingApplicationId) ||
    workspaceOwnedApplicationIds.includes(startingApplicationId)
  ) {
    return null;
  }

  const startingApplication = flatApplicationMaps.byId[startingApplicationId];

  if (
    !isDefined(startingApplication) ||
    isDefined(startingApplication.deletedAt)
  ) {
    throw new WorkflowStepExecutorException(
      'The application that started this run is no longer installed',
      WorkflowStepExecutorExceptionCode.FORBIDDEN,
    );
  }

  return startingApplication;
};
