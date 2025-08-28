import { isWorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/guards/is-workflow-iterator-action.guard';
import { type WorkflowIteratorActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/types/workflow-iterator-action-settings.type';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const getAllStepIdsInLoop = ({
  iteratorStepId,
  initialLoopStepIds,
  steps,
}: {
  iteratorStepId: string;
  initialLoopStepIds: string[];
  steps: WorkflowAction[];
}): string[] => {
  const allStepIdsInLoop = new Set<string>();
  const visitedStepIds = new Set<string>();

  const traverseSteps = (stepIds: string[]): void => {
    for (const stepId of stepIds) {
      if (visitedStepIds.has(stepId)) {
        continue;
      }

      visitedStepIds.add(stepId);
      allStepIdsInLoop.add(stepId);

      const step = steps.find((s) => s.id === stepId);

      if (!step || !step.nextStepIds) {
        continue;
      }

      if (
        step.type === WorkflowActionType.ITERATOR &&
        isWorkflowIteratorAction(step)
      ) {
        const nestedIteratorInput = step?.settings
          ?.input as WorkflowIteratorActionInput;

        if (
          nestedIteratorInput.initialLoopStepIds &&
          Array.isArray(nestedIteratorInput.initialLoopStepIds)
        ) {
          const nestedLoopStepIds = getAllStepIdsInLoop({
            iteratorStepId: stepId,
            initialLoopStepIds: nestedIteratorInput.initialLoopStepIds,
            steps,
          });

          nestedLoopStepIds.forEach((nestedStepId) => {
            allStepIdsInLoop.add(nestedStepId);
          });
        }
      }

      const connectsBackToIterator = step.nextStepIds.includes(iteratorStepId);

      if (connectsBackToIterator) {
        // We've found the end of the loop, stop traversing
        continue;
      }

      traverseSteps(step.nextStepIds);
    }
  };

  traverseSteps(initialLoopStepIds);

  return Array.from(allStepIdsInLoop);
};
