import { isDefined } from '@/utils';
import { WorkflowRunStepsInfos } from '@/workflow/types/WorkflowRunStateStepsInfos';

export const getWorkflowRunContext = (stepInfos: WorkflowRunStepsInfos) => {
  return Object.fromEntries(
    Object.entries(stepInfos)
      .filter(([, value]) => isDefined(value?.['result']))
      .map(([key, value]) => [key, value?.['result']]),
  );
};
