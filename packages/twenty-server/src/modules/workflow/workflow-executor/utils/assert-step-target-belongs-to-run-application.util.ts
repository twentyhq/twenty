import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

export const assertStepTargetBelongsToRunApplication = ({
  application,
  targetApplicationId,
  workspaceOwnedApplicationIds,
  targetLabel,
}: {
  application: Pick<FlatApplication, 'id' | 'name'>;
  targetApplicationId: string;
  workspaceOwnedApplicationIds: string[];
  targetLabel: string;
}): void => {
  if (
    targetApplicationId === application.id ||
    workspaceOwnedApplicationIds.includes(targetApplicationId)
  ) {
    return;
  }

  throw new WorkflowStepExecutorException(
    `${targetLabel} belongs to another application than "${application.name}", so this run cannot use it`,
    WorkflowStepExecutorExceptionCode.FORBIDDEN,
  );
};
