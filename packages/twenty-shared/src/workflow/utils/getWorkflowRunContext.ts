import { isDefined } from '../../utils';
import { type WorkflowRunStepInfos } from '../types/WorkflowRunStateStepInfos';

export const getWorkflowRunContext = (
  stepInfos: WorkflowRunStepInfos,
): Record<string, unknown> => {
  return Object.fromEntries(
    Object.entries(stepInfos)
      .filter(([, value]) => isDefined(value?.result))
      .map(([key, value]) => [key, value?.result]),
  );
};
