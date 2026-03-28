import { isDefined } from '@/utils';
import { type WorkflowRunStepInfos } from '@/workflow/types/WorkflowRunStateStepInfos';

export const getWorkflowRunContext = (
  stepInfos: WorkflowRunStepInfos,
): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(stepInfos)
      .filter(([, value]) => isDefined(value?.['result']))
      .map(([key, value]) => {
        const result = value?.['result'];

        if (typeof result === 'object' && result !== null) {
          return [key, { ...result, result }];
        }

        return [key, result];
      }),
  );
};
