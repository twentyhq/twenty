import { StepStatus, type WorkflowRunStepInfos } from 'twenty-shared/workflow';

import { getEffectiveParentStatus } from 'src/modules/workflow/workflow-executor/utils/get-effective-parent-status.util';
import { stepFailedAndContinued } from 'src/modules/workflow/workflow-executor/utils/step-failed-and-continued.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const shouldExecuteChildStep = ({
  parentSteps,
  childStepId,
  stepInfos,
}: {
  parentSteps: WorkflowAction[];
  childStepId: string;
  stepInfos: WorkflowRunStepInfos;
}) => {
  if (parentSteps.length === 0) {
    return true;
  }

  const parentOutcomes = parentSteps.map((parentStep) => ({
    status: getEffectiveParentStatus({ parentStep, childStepId, stepInfos }),
    failedAndContinued: stepFailedAndContinued({ step: parentStep, stepInfos }),
  }));

  const hasSuccessfulOrContinuedParentStep = parentOutcomes.some(
    ({ status, failedAndContinued }) =>
      status === StepStatus.SUCCESS || failedAndContinued,
  );

  const areAllParentsCompleted = parentOutcomes.every(
    ({ status, failedAndContinued }) =>
      status === StepStatus.SUCCESS ||
      status === StepStatus.STOPPED ||
      status === StepStatus.SKIPPED ||
      failedAndContinued,
  );

  return hasSuccessfulOrContinuedParentStep && areAllParentsCompleted;
};
