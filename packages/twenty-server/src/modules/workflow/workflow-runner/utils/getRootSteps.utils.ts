import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import {
  WorkflowRunException,
  WorkflowRunExceptionCode,
} from 'src/modules/workflow/workflow-runner/exceptions/workflow-run.exception';

export const getRootSteps = (steps: WorkflowAction[]): WorkflowAction[] => {
  const childIds = new Set<string>();

  for (const step of steps) {
    step.nextStepIds?.forEach((id) => childIds.add(id));
  }

  const rootSteps = steps.filter((step) => !childIds.has(step.id));

  if (rootSteps.length === 0) {
    throw new WorkflowRunException(
      'No root step found',
      WorkflowRunExceptionCode.WORKFLOW_ROOT_STEP_NOT_FOUND,
    );
  }

  return rootSteps;
};
