import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const findStepOrThrow = ({
  stepId,
  steps,
}: {
  stepId: string;
  steps: WorkflowAction[];
}) => {
  const step = steps.find((step) => step.id === stepId);

  if (!step) {
    throw new WorkflowStepExecutorException(
      'Step not found',
      WorkflowStepExecutorExceptionCode.STEP_NOT_FOUND,
    );
  }

  return step;
};
