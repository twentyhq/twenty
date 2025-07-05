import { t } from '@lingui/core/macro';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const getPreviousStepOutput = (
  steps: WorkflowAction[],
  currentStepId: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  context: Record<string, any>,
) => {
  const previousSteps = steps.filter((step) =>
    step?.nextStepIds?.includes(currentStepId),
  );

  if (previousSteps.length === 0) {
    throw new WorkflowStepExecutorException(
      'Filter action must have a previous step',
      WorkflowStepExecutorExceptionCode.FAILED_TO_EXECUTE_STEP,
      {
        userFriendlyMessage: t`Filter action must have a previous step`,
      },
    );
  }

  if (previousSteps.length > 1) {
    throw new WorkflowStepExecutorException(
      'Filter action must have only one previous step',
      WorkflowStepExecutorExceptionCode.FAILED_TO_EXECUTE_STEP,
      {
        userFriendlyMessage: t`Filter action must have only one previous step`,
      },
    );
  }

  const previousStep = previousSteps[0];
  const previousStepOutput = context[previousStep.id];

  if (!previousStepOutput) {
    throw new WorkflowStepExecutorException(
      'Previous step output not found',
      WorkflowStepExecutorExceptionCode.FAILED_TO_EXECUTE_STEP,
    );
  }

  return previousStepOutput;
};
