import { isDefined } from 'twenty-shared/utils';
import {
  StepStatus,
  type WorkflowRunStepInfo,
  type WorkflowRunStepInfos,
} from 'twenty-shared/workflow';

import { isWorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/guards/is-workflow-iterator-action.guard';
import { type WorkflowIteratorResult } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/types/workflow-iterator-result.type';
import { getAllStepIdsInLoop } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/get-all-step-ids-in-loop.util';
import { getIteratorInitialLoopStepIds } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/get-iterator-initial-loop-step-ids.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

type BuildRetryStepInfosResult = {
  stepInfosToUpdate: Record<string, WorkflowRunStepInfo>;
  stepIdsToRetry: string[];
};

// Pure, side-effect-free computation of the step info changes needed to retry a
// failed workflow run from its failing step(s). Only steps in StepStatus.FAILED
// are touched; FAILED_SAFELY / SKIPPED / SUCCESS / STOPPED are left intact so
// their results stay available as context for the retried steps.
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
      const iteratorResult = stepInfo.result as
        | WorkflowIteratorResult
        | undefined;

      const failedMidLoop =
        isDefined(iteratorResult) &&
        iteratorResult.hasProcessedAllItems === false;

      if (failedMidLoop) {
        // The iterator was only marked FAILED as collateral when the run ended
        // mid-iteration (a step inside its loop failed). Its cursor is intact,
        // so restore it to RUNNING and let the reset loop body drive it forward.
        stepInfosToUpdate[step.id] = {
          ...stepInfo,
          status: StepStatus.RUNNING,
          error: undefined,
        };

        continue;
      }

      // The iterator action itself failed (e.g. invalid items input); its cursor
      // is not reusable, so restart the whole loop from scratch.
      const loopStepIds = getAllStepIdsInLoop({
        iteratorStepId: step.id,
        initialLoopStepIds: getIteratorInitialLoopStepIds(step),
        steps,
      });

      for (const loopStepId of loopStepIds) {
        stepInfosToUpdate[loopStepId] = { status: StepStatus.NOT_STARTED };
      }

      stepInfosToUpdate[step.id] = { status: StepStatus.NOT_STARTED };
      stepIdsToRetry.push(step.id);

      continue;
    }

    stepInfosToUpdate[step.id] = { status: StepStatus.NOT_STARTED };
    stepIdsToRetry.push(step.id);
  }

  return { stepInfosToUpdate, stepIdsToRetry };
};
