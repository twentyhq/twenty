import { isDefined } from 'twenty-shared/utils';

import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const computeUpdatedNextStepIds = ({
  existingNextStepIds,
  stepIdToDelete,
  stepToDeleteChildrenIds,
}: {
  existingNextStepIds: string[];
  stepIdToDelete: string;
  stepToDeleteChildrenIds?: string[];
}): string[] => {
  const filteredNextStepIds = isDefined(existingNextStepIds)
    ? existingNextStepIds.filter((id) => id !== stepIdToDelete)
    : [];

  return [
    ...new Set([
      ...filteredNextStepIds,
      // We automatically link parent and child steps together
      ...(stepToDeleteChildrenIds || []),
    ]),
  ];
};

export const removeStep = ({
  existingTrigger,
  existingSteps,
  stepIdToDelete,
  stepToDeleteChildrenIds,
}: {
  existingTrigger: WorkflowTrigger | null;
  existingSteps: WorkflowAction[];
  stepIdToDelete: string;
  stepToDeleteChildrenIds?: string[];
}): { steps: WorkflowAction[]; trigger: WorkflowTrigger | null } => {
  const updatedSteps = existingSteps
    .filter((step) => step.id !== stepIdToDelete)
    .map((step) => {
      if (step.nextStepIds?.includes(stepIdToDelete)) {
        return {
          ...step,
          nextStepIds: computeUpdatedNextStepIds({
            existingNextStepIds: step.nextStepIds,
            stepIdToDelete,
            stepToDeleteChildrenIds,
          }),
        };
      }

      return step;
    });

  let updatedTrigger = existingTrigger;

  if (isDefined(existingTrigger)) {
    if (existingTrigger.nextStepIds?.includes(stepIdToDelete)) {
      updatedTrigger = {
        ...existingTrigger,
        nextStepIds: computeUpdatedNextStepIds({
          existingNextStepIds: existingTrigger.nextStepIds,
          stepIdToDelete,
          stepToDeleteChildrenIds,
        }),
      };
    }
  }

  return { trigger: updatedTrigger, steps: updatedSteps };
};
