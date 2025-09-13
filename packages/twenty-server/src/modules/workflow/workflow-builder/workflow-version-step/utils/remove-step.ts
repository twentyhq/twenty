import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

const computeUpdatedNextStepIds = ({
  existingNextStepIds,
  stepIdToRemove,
  stepToDeleteChildrenIds,
}: {
  existingNextStepIds: string[];
  stepIdToRemove: string;
  stepToDeleteChildrenIds?: string[];
}): string[] => {
  const filteredNextStepIds = isDefined(existingNextStepIds)
    ? existingNextStepIds.filter((id) => id !== stepIdToRemove)
    : [];

  return [
    ...new Set([
      ...filteredNextStepIds,
      // We automatically link parent and child steps together
      ...(stepToDeleteChildrenIds || []),
    ]),
  ];
};

const removeOneStep = ({
  existingTrigger,
  existingSteps,
  stepIdToDelete,
  stepToDeleteChildrenIds,
}: {
  existingTrigger: WorkflowTrigger | null;
  existingSteps: WorkflowAction[] | null;
  stepIdToDelete: string;
  stepToDeleteChildrenIds?: string[];
}): {
  updatedSteps: WorkflowAction[];
  updatedTrigger: WorkflowTrigger | null;
  removedStepIds: string[];
} => {
  const updatedSteps =
    existingSteps
      ?.filter((step) => step.id !== stepIdToDelete)
      .map((step) => {
        if (step.nextStepIds?.includes(stepIdToDelete)) {
          return {
            ...step,
            nextStepIds: computeUpdatedNextStepIds({
              existingNextStepIds: step.nextStepIds,
              stepIdToRemove: stepIdToDelete,
              stepToDeleteChildrenIds: stepToDeleteChildrenIds,
            }),
          };
        }

        if (
          step.type === WorkflowActionType.ITERATOR &&
          isDefined(step.settings.input.initialLoopStepIds) &&
          step.settings.input.initialLoopStepIds.includes(stepIdToDelete)
        ) {
          return {
            ...step,
            settings: {
              ...step.settings,
              input: {
                ...step.settings.input,
                initialLoopStepIds: computeUpdatedNextStepIds({
                  existingNextStepIds: step.settings.input.initialLoopStepIds,
                  stepIdToRemove: stepIdToDelete,
                  stepToDeleteChildrenIds: stepToDeleteChildrenIds,
                }),
              },
            },
          };
        }

        return step;
      }) ?? [];

  let updatedTrigger = existingTrigger;

  if (isDefined(existingTrigger)) {
    if (existingTrigger.nextStepIds?.includes(stepIdToDelete)) {
      updatedTrigger = {
        ...existingTrigger,
        nextStepIds: computeUpdatedNextStepIds({
          existingNextStepIds: existingTrigger.nextStepIds,
          stepIdToRemove: stepIdToDelete,
          stepToDeleteChildrenIds,
        }),
      };
    }
  }

  return {
    updatedSteps,
    updatedTrigger,
    removedStepIds: [stepIdToDelete],
  };
};

const removeRegularStep = ({
  existingTrigger,
  existingSteps,
  stepIdToDelete,
  stepToDeleteChildrenIds,
}: {
  existingTrigger: WorkflowTrigger | null;
  existingSteps: WorkflowAction[] | null;
  stepIdToDelete: string;
  stepToDeleteChildrenIds?: string[];
}): {
  updatedSteps: WorkflowAction[];
  updatedTrigger: WorkflowTrigger | null;
  removedStepIds: string[];
} => {
  let { updatedSteps, updatedTrigger, removedStepIds } = removeOneStep({
    existingTrigger,
    existingSteps,
    stepIdToDelete,
    stepToDeleteChildrenIds,
  });

  for (const stepId of stepToDeleteChildrenIds ?? []) {
    const step = existingSteps?.find((step) => step.id === stepId);

    if (step?.type === WorkflowActionType.FILTER) {
      const {
        updatedSteps: stepsAfterRemovingChildFilter,
        updatedTrigger: triggerAfterRemovingChildFilter,
        removedStepIds: removedStepIdsAfterRemovingChildFilter,
      } = removeOneStep({
        existingTrigger: updatedTrigger,
        existingSteps: updatedSteps,
        stepIdToDelete: stepId,
        stepToDeleteChildrenIds: step.nextStepIds,
      });

      updatedSteps = stepsAfterRemovingChildFilter;
      updatedTrigger = triggerAfterRemovingChildFilter;
      removedStepIds = [
        ...removedStepIds,
        ...removedStepIdsAfterRemovingChildFilter,
      ];
    }
  }

  for (const step of updatedSteps) {
    if (
      step?.type === WorkflowActionType.FILTER &&
      (!isDefined(step?.nextStepIds) || step.nextStepIds?.length === 0)
    ) {
      const {
        updatedSteps: stepsAfterRemovingFilterWithoutChildren,
        updatedTrigger: triggerAfterRemovingFilterWithoutChildren,
        removedStepIds: removedStepIdsAfterRemovingFilterWithoutChildren,
      } = removeOneStep({
        existingTrigger: updatedTrigger,
        existingSteps: updatedSteps,
        stepIdToDelete: step.id,
        stepToDeleteChildrenIds: step.nextStepIds,
      });

      updatedSteps = stepsAfterRemovingFilterWithoutChildren;
      updatedTrigger = triggerAfterRemovingFilterWithoutChildren;
      removedStepIds = [
        ...removedStepIds,
        ...removedStepIdsAfterRemovingFilterWithoutChildren,
      ];
    }
  }

  return {
    updatedSteps,
    updatedTrigger,
    removedStepIds,
  };
};

const removeTrigger = ({
  existingSteps,
  triggerChildrenIds,
}: {
  existingSteps: WorkflowAction[] | null;
  triggerChildrenIds?: string[];
}) => {
  const stepIdsToRemove =
    triggerChildrenIds?.filter((id) => {
      const step = existingSteps?.find((step) => step.id === id);

      return step?.type === WorkflowActionType.FILTER;
    }) ?? [];

  const updatedSteps =
    existingSteps?.filter((step) => !stepIdsToRemove.includes(step.id)) ?? [];

  return {
    updatedSteps,
    updatedTrigger: null,
    removedStepIds: [TRIGGER_STEP_ID, ...stepIdsToRemove],
  };
};

export const removeStep = ({
  existingTrigger,
  existingSteps,
  stepIdToDelete,
  stepToDeleteChildrenIds,
}: {
  existingTrigger: WorkflowTrigger | null;
  existingSteps: WorkflowAction[] | null;
  stepIdToDelete: string;
  stepToDeleteChildrenIds?: string[];
}) => {
  if (stepIdToDelete === TRIGGER_STEP_ID) {
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
