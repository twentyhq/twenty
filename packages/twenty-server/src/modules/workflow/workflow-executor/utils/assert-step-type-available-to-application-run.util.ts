import { APPLICATION_WORKFLOW_UNAVAILABLE_STEP_TYPES } from 'twenty-shared/application';
import { type WorkflowActionType } from 'twenty-shared/workflow';

import { type ApplicationReach } from 'src/engine/core-modules/application/types/application-reach.type';
import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

export const assertStepTypeAvailableToApplicationRun = ({
  stepType,
  runApplicationReach,
}: {
  stepType: WorkflowActionType;
  runApplicationReach: ApplicationReach;
}): void => {
  if (
    runApplicationReach !== 'confined' ||
    !APPLICATION_WORKFLOW_UNAVAILABLE_STEP_TYPES.includes(stepType)
  ) {
    return;
  }

  throw new WorkflowStepExecutorException(
    `Applications cannot use ${stepType} steps`,
    WorkflowStepExecutorExceptionCode.FORBIDDEN,
  );
};
