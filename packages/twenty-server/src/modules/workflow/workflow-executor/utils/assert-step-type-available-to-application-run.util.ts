import { APPLICATION_WORKFLOW_UNAVAILABLE_STEP_TYPES } from 'twenty-shared/application';
import { type WorkflowActionType } from 'twenty-shared/workflow';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

export const assertStepTypeAvailableToApplicationRun = ({
  stepType,
  isInstalledApplicationRun,
}: {
  stepType: WorkflowActionType;
  isInstalledApplicationRun: boolean;
}): void => {
  if (
    !isInstalledApplicationRun ||
    !APPLICATION_WORKFLOW_UNAVAILABLE_STEP_TYPES.includes(stepType)
  ) {
    return;
  }

  throw new WorkflowStepExecutorException(
    `Applications cannot use ${stepType} steps`,
    WorkflowStepExecutorExceptionCode.FORBIDDEN,
  );
};
