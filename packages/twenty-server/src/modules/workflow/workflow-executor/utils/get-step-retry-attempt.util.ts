import { type WorkflowRunStepInfo } from 'twenty-shared/workflow';

export const getStepRetryAttempt = ({
  stepInfo,
}: {
  stepInfo?: WorkflowRunStepInfo;
}): number => {
  const history = stepInfo?.history ?? [];

  return history[history.length - 1]?.retryAttempt ?? 0;
};
