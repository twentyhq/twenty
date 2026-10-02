import { isNonEmptyArray } from 'twenty-shared/utils';

import { isWorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/guards/is-workflow-iterator-action.guard';
import { type WorkflowIteratorResult } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/types/workflow-iterator-result.type';
import { getAllStepIdsInLoop } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/get-all-step-ids-in-loop.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

// Identifies one execution of a step within a run: a retry keeps the key,
// while each iteration of an enclosing iterator gets its own.
export const buildStepExecutionKey = ({
  stepId,
  steps,
  context,
}: {
  stepId: string;
  steps: WorkflowAction[];
  context: Record<string, unknown>;
}): string => {
  const iterationKeys = steps
    .filter(isWorkflowIteratorAction)
    .filter((iterator) => {
      const { initialLoopStepIds } = iterator.settings.input;

      return (
        isNonEmptyArray(initialLoopStepIds) &&
        getAllStepIdsInLoop({
          iteratorStepId: iterator.id,
          initialLoopStepIds,
          steps,
        }).includes(stepId)
      );
    })
    .map((iterator) => {
      const iteration = context[iterator.id] as
        | WorkflowIteratorResult
        | undefined;

      return `${iterator.id}=${iteration?.currentItemIndex ?? 0}`;
    })
    .sort();

  return [stepId, ...iterationKeys].join(':');
};
