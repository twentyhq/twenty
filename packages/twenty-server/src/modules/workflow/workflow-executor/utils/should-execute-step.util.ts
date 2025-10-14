import { isDefined } from 'twenty-shared/utils';
import { type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { shouldExecuteChildStep } from 'src/modules/workflow/workflow-executor/utils/should-execute-child-step.util';
import { stepHasBeenStarted } from 'src/modules/workflow/workflow-executor/utils/step-has-been-started.util';
import { isWorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/guards/is-workflow-iterator-action.guard';
import { shouldExecuteIteratorStep } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/should-execute-iterator-step.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const shouldExecuteStep = ({
  step,
  steps,
  stepInfos,
  workflowRunStatus,
}: {
  step: WorkflowAction;
  steps: WorkflowAction[];
  stepInfos: WorkflowRunStepInfos;
  workflowRunStatus: WorkflowRunStatus;
}) => {
  if (workflowRunStatus !== WorkflowRunStatus.RUNNING) {
    return false;
  }

  if (isWorkflowIteratorAction(step)) {
    return shouldExecuteIteratorStep({
      step,
      steps,
      stepInfos,
    });
  }

  if (stepHasBeenStarted(step.id, stepInfos)) {
    return false;
  }

  const parentSteps = steps.filter(
    (parentStep) =>
      isDefined(parentStep) && parentStep.nextStepIds?.includes(step.id),
  );

  return shouldExecuteChildStep({
    parentSteps,
    stepInfos,
  });
};
