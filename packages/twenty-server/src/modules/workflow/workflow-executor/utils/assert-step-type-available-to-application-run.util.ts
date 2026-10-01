import { type WorkflowActionType } from 'twenty-shared/workflow';
import { isDefined } from 'twenty-shared/utils';

import { APPLICATION_RUN_UNAVAILABLE_STEP_TYPES } from 'src/modules/workflow/workflow-executor/constants/application-run-unavailable-step-types.constant';
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
    !APPLICATION_RUN_UNAVAILABLE_STEP_TYPES.includes(stepType)
  ) {
    return;
  }

  throw new WorkflowStepExecutorException(
    `Applications cannot use ${stepType} steps`,
    WorkflowStepExecutorExceptionCode.FORBIDDEN,
  );
};
