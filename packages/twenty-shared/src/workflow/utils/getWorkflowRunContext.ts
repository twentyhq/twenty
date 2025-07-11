import { isDefined } from '@/utils';
import { WorkflowRunStepInfos } from '@/workflow/types/WorkflowRunStateStepsInfos';

export const getWorkflowRunContext = (stepInfos: WorkflowRunStepInfos) => {
  return Object.fromEntries(
    Object.entries(stepInfos)
      .filter(([, value]) => isDefined(value?.['result']))
      .map(([key, value]) => [key, value?.['result']]),
  );
};
