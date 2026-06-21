import {
  StepStatus,
  type WorkflowRunStepInfo,
  type WorkflowRunStepInfos,
} from 'twenty-shared/workflow';

import { isWorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/guards/is-workflow-iterator-action.guard';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { buildRetryIteratorStepInfos } from 'src/modules/workflow/workflow-runner/utils/build-retry-iterator-step-infos.util';

type BuildRetryStepInfosResult = {
  stepInfosToUpdate: Record<string, WorkflowRunStepInfo>;
  stepIdsToRetry: string[];
};

export const buildRetryStepInfos = ({
  steps,
  stepInfos,
}: {
  steps: WorkflowAction[];
  stepInfos: WorkflowRunStepInfos;
}): BuildRetryStepInfosResult => {
  const stepInfosToUpdate: Record<string, WorkflowRunStepInfo> = {};
  const stepIdsToRetry: string[] = [];

  for (const step of steps) {
    const stepInfo = stepInfos[step.id];

    if (stepInfo?.status !== StepStatus.FAILED) {
      continue;
    }

    if (isWorkflowIteratorAction(step)) {
      const iteratorRetry = buildRetryIteratorStepInfos({
        iteratorStep: step,
        iteratorStepInfo: stepInfo,
        steps,
      });

      Object.assign(stepInfosToUpdate, iteratorRetry.stepInfosToUpdate);
      stepIdsToRetry.push(...iteratorRetry.stepIdsToRetry);

      continue;
    }

    stepInfosToUpdate[step.id] = { status: StepStatus.NOT_STARTED };
    stepIdsToRetry.push(step.id);
  }

  return { stepInfosToUpdate, stepIdsToRetry };
};
