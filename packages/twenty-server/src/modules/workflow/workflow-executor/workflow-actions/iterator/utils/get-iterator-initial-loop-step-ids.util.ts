import { isString } from '@sniptt/guards';

import { type WorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const getIteratorInitialLoopStepIds = (
  step: WorkflowIteratorAction,
): string[] => {
  const initialLoopStepIds = step.settings.input.initialLoopStepIds;

  if (isString(initialLoopStepIds)) {
    return JSON.parse(initialLoopStepIds);
  }

  return initialLoopStepIds ?? [];
};
