import { isDefined } from 'twenty-shared/utils';
import { StepStatus, type WorkflowRunStepInfo } from 'twenty-shared/workflow';

export const buildStepInfosReset = ({
  stepIds,
  stepInfos,
}: {
  stepIds: string[];
  stepInfos: Record<string, WorkflowRunStepInfo>;
}): Record<string, WorkflowRunStepInfo> => {
  return stepIds.reduce(
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
