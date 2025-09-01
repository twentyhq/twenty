import { isString } from 'class-validator';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { WorkflowRunStatus } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { isWorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/guards/is-workflow-iterator-action.guard';
import { getAllStepIdsInLoop } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/get-all-step-ids-in-loop.util';
import {
  type WorkflowAction,
  type WorkflowIteratorAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const stepHasBeenStarted = (
  stepId: string,
  stepInfos: WorkflowRunStepInfos,
) => {
  return (
    isDefined(stepInfos[stepId]?.status) &&
    stepInfos[stepId].status !== StepStatus.NOT_STARTED
  );
};

const canExecuteIteratorStep = (
  step: WorkflowIteratorAction,
  steps: WorkflowAction[],
  stepInfos: WorkflowRunStepInfos,
) => {
  const stepsTargetingIterator = steps.filter(
    (parentStep) =>
      isDefined(parentStep) && parentStep.nextStepIds?.includes(step.id),
  );

  // TODO: remove once the UI is implemented
  const parsedInitialLoopStepIds = isString(
    step.settings.input.initialLoopStepIds,
  )
    ? JSON.parse(step.settings.input.initialLoopStepIds)
    : step.settings.input.initialLoopStepIds;

  const stepIdsInLoop = getAllStepIdsInLoop({
    iteratorStepId: step.id,
    initialLoopStepIds: parsedInitialLoopStepIds,
    steps,
  });

  const parentSteps = stepsTargetingIterator.filter((step) =>
    stepIdsInLoop.includes(step.id),
  );

  return parentSteps.every(
    (step) => stepInfos[step.id]?.status === StepStatus.SUCCESS,
  );
};

export const canExecuteStep = ({
  stepId,
  steps,
  stepInfos,
  workflowRunStatus,
}: {
  steps: WorkflowAction[];
  stepInfos: WorkflowRunStepInfos;
  stepId: string;
  workflowRunStatus: WorkflowRunStatus;
}) => {
  if (workflowRunStatus !== WorkflowRunStatus.RUNNING) {
    return false;
  }

  const step = steps.find((step) => step.id === stepId);

  if (!step) {
    return false;
  }

  if (isWorkflowIteratorAction(step)) {
    return canExecuteIteratorStep(step, steps, stepInfos);
  }

  if (stepHasBeenStarted(stepId, stepInfos)) {
    return false;
  }

  const parentSteps = steps.filter(
    (parentStep) =>
      isDefined(parentStep) && parentStep.nextStepIds?.includes(stepId),
  );

  return parentSteps.every(
    (parentStep) => stepInfos[parentStep.id]?.status === StepStatus.SUCCESS,
  );
};
