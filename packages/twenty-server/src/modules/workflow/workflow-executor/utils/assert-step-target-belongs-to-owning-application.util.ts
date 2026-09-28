import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

export const assertStepTargetBelongsToOwningApplication = ({
  owningApplication,
  targetApplicationId,
  targetLabel,
}: {
  owningApplication: Pick<FlatApplication, 'id' | 'name'> | null;
  targetApplicationId: string | null;
  targetLabel: string;
}): void => {
  if (
    !isDefined(owningApplication) ||
    owningApplication.id === targetApplicationId
  ) {
    return;
  }

  throw new WorkflowStepExecutorException(
    `${targetLabel} does not belong to application "${owningApplication.name}", so its workflows cannot run it`,
    WorkflowStepExecutorExceptionCode.FORBIDDEN,
  );
};
