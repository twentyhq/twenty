import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import { canCallerReachApplication } from 'src/engine/core-modules/application/utils/can-caller-reach-application.util';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

export const assertRunApplicationCanTriggerStepTarget = ({
  application,
  workspaceCustomApplicationId,
  targetApplicationId,
  targetLabel,
}: {
  application: Pick<
    FlatApplication,
    'id' | 'name' | 'universalIdentifier' | 'sourceType'
  >;
  workspaceCustomApplicationId: string | undefined;
  targetApplicationId: string;
  targetLabel: string;
}): void => {
  if (
    canCallerReachApplication({
      callingApplication: application,
      applicationId: targetApplicationId,
      access: 'trigger',
      workspaceCustomApplicationId,
    })
  ) {
    return;
  }

  throw new WorkflowStepExecutorException(
    `${targetLabel} belongs to another application than "${application.name}", so this run cannot use it`,
    WorkflowStepExecutorExceptionCode.FORBIDDEN,
  );
};
