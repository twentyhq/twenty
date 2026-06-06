import { isString } from '@sniptt/guards';

import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';
import { type WorkflowIteratorResult } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/types/workflow-iterator-result.type';
import { type WorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

type NextStepIds = {
  nextStepIdsToExecute?: string[];
  nextStepIdsToSkip?: string[];
  nextStepIdsToFailSafely?: string[];
};

// Returns next step IDs for the Iterator's children, or undefined if the
// Iterator has processed all items (caller should fall through to nextStepIds).
export const getNextStepIdsForIterator = ({
  executedStep,
  executedStepOutput,
}: {
  executedStep: WorkflowIteratorAction;
  executedStepOutput: WorkflowActionOutput;
}): NextStepIds | undefined => {
  const initialLoopStepIds = isString(
    executedStep.settings.input.initialLoopStepIds,
  )
    ? JSON.parse(executedStep.settings.input.initialLoopStepIds)
    : (executedStep.settings.input.initialLoopStepIds ?? []);

  if (executedStepOutput.shouldSkipStepExecution) {
    return { nextStepIdsToSkip: initialLoopStepIds };
  }

  if (executedStepOutput.shouldFailSafely) {
    return { nextStepIdsToFailSafely: initialLoopStepIds };
  }

  const iteratorStepResult = executedStepOutput.result as
    | WorkflowIteratorResult
    | undefined;

  if (!iteratorStepResult?.hasProcessedAllItems) {
    return { nextStepIdsToExecute: initialLoopStepIds };
  }

  return undefined;
};
