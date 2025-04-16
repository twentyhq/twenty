import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const removeStep = (
  existingSteps: WorkflowAction[],
  stepToDelete: WorkflowAction,
): WorkflowAction[] => {
  return existingSteps
    .filter((step) => step.id !== stepToDelete.id)
    .map((step) => {
      if (step.nextStepIds?.includes(stepToDelete.id)) {
        return {
          ...step,
          nextStepIds: [
            ...step.nextStepIds.filter((id) => id !== stepToDelete.id),
            // We automatically link parent and child steps together
            ...(stepToDelete.nextStepIds || []),
          ],
        };
      }

      return step;
    });
};
