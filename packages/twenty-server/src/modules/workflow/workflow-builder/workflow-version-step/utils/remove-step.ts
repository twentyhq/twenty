import { isDefined } from 'twenty-shared/utils';

import {
  WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
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

const removeRegularStep = ({
  existingTrigger,
  existingSteps,
  stepIdToDelete,
  stepToDeleteChildrenIds,
}: {
  existingTrigger: WorkflowTrigger | null;
  existingSteps: WorkflowAction[];
  stepIdToDelete: string;
  stepToDeleteChildrenIds?: string[];
}): {
  updatedSteps: WorkflowAction[];
  updatedTrigger: WorkflowTrigger | null;
  removedStepIds: string[];
} => {
  const stepIdsToRemove = [stepIdToDelete];
  const stepIdsToRemoveChildrenIds =
    stepToDeleteChildrenIds
      ?.map((id) => {
        const step = existingSteps.find((step) => step.id === id);

        if (step?.type === WorkflowActionType.FILTER) {
          stepIdsToRemove.push(step.id);

          return step.nextStepIds;
        }

        return id;
      })
      .filter(isDefined)
      .flat() ?? [];

  const updatedSteps = existingSteps
    .filter((step) => !stepIdsToRemove.includes(step.id))
    .map((step) => {
      if (step.nextStepIds?.includes(stepIdToDelete)) {
        return {
          ...step,
          nextStepIds: computeUpdatedNextStepIds({
            existingNextStepIds: step.nextStepIds,
            stepIdToDelete,
            stepToDeleteChildrenIds: stepIdsToRemoveChildrenIds,
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
          stepToDeleteChildrenIds: stepIdsToRemoveChildrenIds,
        }),
      };
    }
  }

  return {
    updatedTrigger,
    updatedSteps,
    removedStepIds: stepIdsToRemove,
  };
};

const removeTrigger = ({
  existingSteps,
  triggerChildrenIds,
}: {
  existingSteps: WorkflowAction[];
  triggerChildrenIds?: string[];
}) => {
  const stepIdsToRemove =
    triggerChildrenIds?.filter((id) => {
      const step = existingSteps.find((step) => step.id === id);

      return step?.type === WorkflowActionType.FILTER;
    }) ?? [];

  const updatedSteps = existingSteps.filter(
    (step) => !stepIdsToRemove.includes(step.id),
  );

  return {
    updatedSteps,
    updatedTrigger: null,
    removedStepIds: ['trigger', ...stepIdsToRemove],
  };
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
}) => {
  if (stepIdToDelete === 'trigger') {
    return removeTrigger({
      existingSteps,
      triggerChildrenIds: stepToDeleteChildrenIds,
    });
  } else {
    return removeRegularStep({
      existingTrigger,
      existingSteps,
      stepIdToDelete,
      stepToDeleteChildrenIds,
    });
  }
};
