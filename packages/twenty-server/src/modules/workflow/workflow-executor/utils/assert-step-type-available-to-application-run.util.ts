import { APPLICATION_WORKFLOW_UNAVAILABLE_STEP_TYPES } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { type WorkflowActionType } from 'twenty-shared/workflow';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

export const assertStepTypeAvailableToApplicationRun = ({
  stepType,
  runApplicationId,
}: {
  stepType: WorkflowActionType;
  runApplicationId?: string;
}): void => {
  if (
    !isDefined(runApplicationId) ||
    !APPLICATION_WORKFLOW_UNAVAILABLE_STEP_TYPES.includes(stepType)
  ) {
    return;
  }

  throw new WorkflowStepExecutorException(
    `Applications cannot use ${stepType} steps`,
    WorkflowStepExecutorExceptionCode.FORBIDDEN,
  );
};
