import { isWorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/guards/is-workflow-iterator-action.guard';
import { type WorkflowIteratorActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/types/workflow-iterator-action-settings.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const traverseSteps = ({
  iteratorStepId,
  stepIds,
  steps,
  visitedStepIds,
  allStepIdsInLoop,
}: {
  iteratorStepId: string;
  stepIds: string[];
  steps: WorkflowAction[];
  visitedStepIds: Set<string>;
  allStepIdsInLoop: Set<string>;
}) => {
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

    if (isWorkflowIteratorAction(step)) {
      const nestedIteratorInput = step.settings
        .input as WorkflowIteratorActionInput;

      if (nestedIteratorInput.initialLoopStepIds) {
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

    traverseSteps({
      iteratorStepId,
      stepIds: step.nextStepIds,
      steps,
      visitedStepIds,
      allStepIdsInLoop,
    });
  }
};

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

  traverseSteps({
    iteratorStepId,
    stepIds: initialLoopStepIds,
    steps,
    visitedStepIds,
    allStepIdsInLoop,
  });

  return Array.from(allStepIdsInLoop);
};
