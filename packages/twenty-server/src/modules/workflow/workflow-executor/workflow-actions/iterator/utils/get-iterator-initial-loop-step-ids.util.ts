import { isString } from '@sniptt/guards';

import { type WorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

// initialLoopStepIds is typed as string[], but at runtime it can be a JSON
// string (see iterator.workflow-action.ts), so normalize both shapes here.
export const getIteratorInitialLoopStepIds = (
  step: WorkflowIteratorAction,
): string[] => {
  const initialLoopStepIds = step.settings.input.initialLoopStepIds;

  if (isString(initialLoopStepIds)) {
    return JSON.parse(initialLoopStepIds);
  }

  return initialLoopStepIds ?? [];
};
