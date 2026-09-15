import { isString } from '@sniptt/guards';

import { type WorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const getIteratorInitialLoopStepIds = (
  step: WorkflowIteratorAction,
): string[] => {
  const initialLoopStepIds = step.settings.input.initialLoopStepIds;

  if (isString(initialLoopStepIds)) {
    try {
      const parsed: unknown = JSON.parse(initialLoopStepIds);

      if (Array.isArray(parsed) && parsed.every(isString)) {
        return parsed;
      }
    } catch {
      return [];
    }

    return [];
  }

  return initialLoopStepIds ?? [];
};
