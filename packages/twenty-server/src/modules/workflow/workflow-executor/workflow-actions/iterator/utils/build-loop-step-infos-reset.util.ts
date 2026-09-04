import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfo } from 'twenty-shared/workflow';

import { getAllStepIdsInLoop } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/get-all-step-ids-in-loop.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const buildLoopStepInfosReset = ({
  iteratorStepId,
  initialLoopStepIds,
  steps,
  stepInfos,
}: {
  iteratorStepId: string;
  initialLoopStepIds: string[];
  steps: WorkflowAction[];
  stepInfos: Record<string, WorkflowRunStepInfo>;
}): Record<string, WorkflowRunStepInfo> => {
  const stepIdsToReset = getAllStepIdsInLoop({
    iteratorStepId,
    initialLoopStepIds,
    steps,
  });

  return stepIdsToReset.reduce(
    (acc, stepId) => {
      const stepInfo = stepInfos[stepId];

      if (!isDefined(stepInfo)) {
        return acc;
      }

      acc[stepId] = {
        status: StepStatus.NOT_STARTED,
        result: undefined,
        error: undefined,
        history: [
          ...(stepInfo.history ?? []),
          {
            result: stepInfo.result,
            error: stepInfo.error,
            status: stepInfo.status,
          },
        ],
      };

      return acc;
    },
    {} as Record<string, WorkflowRunStepInfo>,
  );
};
