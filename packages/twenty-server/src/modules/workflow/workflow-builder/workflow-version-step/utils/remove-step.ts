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
    return {
      updatedSteps: existingSteps,
      updatedTrigger: null,
      removedStepIds: [TRIGGER_STEP_ID],
    };
  }

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
