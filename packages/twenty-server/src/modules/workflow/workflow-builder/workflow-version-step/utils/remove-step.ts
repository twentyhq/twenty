import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID, type StepIfElseBranch } from 'twenty-shared/workflow';

import { isWorkflowEmptyAction } from 'src/modules/workflow/workflow-executor/workflow-actions/empty/guards/is-workflow-empty-action.guard';
import { isWorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/guards/is-workflow-if-else-action.guard';
import {
  WorkflowActionType,
  type WorkflowAction,
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

export const getEmptyChildStepIdsForIfElse = ({
  branches,
  allSteps,
}: {
  branches: StepIfElseBranch[];
  allSteps: WorkflowAction[];
}): string[] => {
  const childStepIds = branches.flatMap((branch) => branch.nextStepIds);

  return childStepIds.filter((childStepId) => {
    const childStep = allSteps.find((step) => step.id === childStepId);

    return isDefined(childStep) && isWorkflowEmptyAction(childStep);
  });
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

  const stepToDelete = existingSteps?.find(
    (step) => step.id === stepIdToDelete,
  );

  let emptyChildStepIds: string[] = [];

  if (
    isDefined(stepToDelete) &&
    isWorkflowIfElseAction(stepToDelete) &&
    isDefined(existingSteps)
  ) {
    emptyChildStepIds = getEmptyChildStepIdsForIfElse({
      branches: stepToDelete.settings.input.branches,
      allSteps: existingSteps,
    });
  }

  const allRemovedStepIds = [
    stepIdToDelete,
    ...(stepToDeleteChildrenIds || []),
    ...emptyChildStepIds,
  ];

  const allStepToDeleteChildrenIds = [
    ...(stepToDeleteChildrenIds || []),
    ...emptyChildStepIds,
  ];

  const updatedSteps =
    existingSteps
      ?.filter((step) => !allRemovedStepIds.includes(step.id))
      .map((step) => {
        if (
          step.type === WorkflowActionType.IF_ELSE &&
          isWorkflowIfElseAction(step)
        ) {
          const updatedBranches = step.settings.input.branches.map(
            (branch) => ({
              ...branch,
              nextStepIds: branch.nextStepIds.filter(
                (id) => !allRemovedStepIds.includes(id),
              ),
            }),
          );

          return {
            ...step,
            settings: {
              ...step.settings,
              input: {
                ...step.settings.input,
                branches: updatedBranches,
              },
            },
          };
        }

        if (step.nextStepIds?.includes(stepIdToDelete)) {
          return {
            ...step,
            nextStepIds: computeUpdatedNextStepIds({
              existingNextStepIds: step.nextStepIds,
              stepIdToRemove: stepIdToDelete,
              stepToDeleteChildrenIds: allStepToDeleteChildrenIds,
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
                  stepToDeleteChildrenIds: allStepToDeleteChildrenIds,
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
          stepToDeleteChildrenIds: allStepToDeleteChildrenIds,
        }),
      };
    }
  }

  return {
    updatedSteps,
    updatedTrigger,
    removedStepIds: allRemovedStepIds,
  };
};
