import { type WorkflowActionType } from 'twenty-shared/workflow';
import { isDefined } from 'twenty-shared/utils';

import { APPLICATION_RUN_UNAVAILABLE_STEP_TYPES } from 'src/modules/workflow/workflow-executor/constants/application-run-unavailable-step-types.constant';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

export const assertStepTypeAvailableToRun = ({
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
    `${stepType} steps cannot run in a workflow run started by an application`,
    WorkflowStepExecutorExceptionCode.FORBIDDEN,
  );
};
