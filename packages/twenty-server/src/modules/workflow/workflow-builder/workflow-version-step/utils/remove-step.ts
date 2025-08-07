import { isDefined } from 'twenty-shared/utils';

import {
  WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const computeUpdatedNextStepIds = ({
  existingNextStepIds,
  stepIdsToRemove,
  stepToDeleteChildrenIds,
}: {
  existingNextStepIds: string[];
  stepIdsToRemove: string[];
  stepToDeleteChildrenIds?: string[];
}): string[] => {
  const filteredNextStepIds = isDefined(existingNextStepIds)
    ? existingNextStepIds.filter((id) => !stepIdsToRemove.includes(id))
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
  let stepIdsToRemoveChildrenIds = stepToDeleteChildrenIds ?? [];

  stepToDeleteChildrenIds?.forEach((id) => {
    const step = existingSteps.find((step) => step.id === id);

    if (step?.type === WorkflowActionType.FILTER) {
      stepIdsToRemove.push(step.id);
      stepIdsToRemoveChildrenIds = stepIdsToRemoveChildrenIds
        .filter((id) => id !== step.id)
        .concat(step.nextStepIds ?? []);
    }
  });

  // we need to make sure no filters will be without children
  if (
    !isDefined(stepToDeleteChildrenIds) ||
    stepToDeleteChildrenIds.length === 0
  ) {
    const stepToRemoveParentSteps = existingSteps.filter((step) =>
      step.nextStepIds?.includes(stepIdToDelete),
    );

    stepToRemoveParentSteps.forEach((step) => {
      if (step.type === WorkflowActionType.FILTER) {
        stepIdsToRemove.push(step.id);
      }
    });
  }

  const updatedSteps = existingSteps
    .filter((step) => !stepIdsToRemove.includes(step.id))
    .map((step) => {
      if (step.nextStepIds?.some((id) => stepIdsToRemove.includes(id))) {
        return {
          ...step,
          nextStepIds: computeUpdatedNextStepIds({
            existingNextStepIds: step.nextStepIds,
            stepIdsToRemove,
            stepToDeleteChildrenIds: stepIdsToRemoveChildrenIds,
          }),
        };
      }

      return step;
    });

  let updatedTrigger = existingTrigger;

  if (isDefined(existingTrigger)) {
    if (
      existingTrigger.nextStepIds?.some((id) => stepIdsToRemove.includes(id))
    ) {
      updatedTrigger = {
        ...existingTrigger,
        nextStepIds: computeUpdatedNextStepIds({
          existingNextStepIds: existingTrigger.nextStepIds,
          stepIdsToRemove,
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
