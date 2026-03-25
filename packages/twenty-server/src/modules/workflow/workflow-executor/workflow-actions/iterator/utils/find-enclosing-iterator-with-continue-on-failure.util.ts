import { isWorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/guards/is-workflow-iterator-action.guard';
import { getAllStepIdsInLoop } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/utils/get-all-step-ids-in-loop.util';
import {
  type WorkflowAction,
  type WorkflowIteratorAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const findEnclosingIteratorWithContinueOnFailure = ({
  failedStepId,
  steps,
}: {
  failedStepId: string;
  steps: WorkflowAction[];
}): WorkflowIteratorAction | undefined => {
  const iteratorSteps = steps.filter(isWorkflowIteratorAction);

  const candidates = iteratorSteps
    .filter(
      (iterator) =>
        iterator.settings.input.initialLoopStepIds &&
        iterator.settings.input.initialLoopStepIds.length > 0,
    )
    .map((iterator) => ({
      iterator,
      loopStepIds: getAllStepIdsInLoop({
        iteratorStepId: iterator.id,
        initialLoopStepIds: iterator.settings.input.initialLoopStepIds!,
        steps,
      }),
    }))
    .filter(({ loopStepIds }) => loopStepIds.includes(failedStepId))
    .sort((a, b) => a.loopStepIds.length - b.loopStepIds.length);

  return candidates.find(
    ({ iterator }) =>
      iterator.settings.input.shouldContinueOnIterationFailure === true,
  )?.iterator;
};
