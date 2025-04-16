import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const removeStep = ({
  existingSteps,
  stepIdToDelete,
  stepToDeleteChildrenIds,
}: {
  existingSteps: WorkflowAction[];
  stepIdToDelete: string;
  stepToDeleteChildrenIds?: string[];
}): WorkflowAction[] => {
  return existingSteps
    .filter((step) => step.id !== stepIdToDelete)
    .map((step) => {
      if (step.nextStepIds?.includes(stepIdToDelete)) {
        return {
          ...step,
          nextStepIds: [
            ...new Set([
              ...step.nextStepIds.filter((id) => id !== stepIdToDelete),
              // We automatically link parent and child steps together
              ...(stepToDeleteChildrenIds || []),
            ]),
          ],
        };
      }

      return step;
    });
};
