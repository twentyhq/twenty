import { isDefined } from 'twenty-shared/utils';
import {
  IF_ELSE_BRANCH_POSITION_OFFSETS,
  TRIGGER_STEP_ID,
  type StepIfElseBranch,
} from 'twenty-shared/workflow';
import { v4 } from 'uuid';

import { isWorkflowEmptyAction } from 'src/modules/workflow/workflow-executor/workflow-actions/empty/guards/is-workflow-empty-action.guard';
import { isWorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/guards/is-workflow-if-else-action.guard';
import {
  WorkflowActionType,
  type WorkflowAction,
  type WorkflowIteratorAction,
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

const createReplacementEmptyNode = ({
  ifElseStep,
  isIfBranch,
  deletedStepPosition,
}: {
  ifElseStep: WorkflowAction;
  isIfBranch: boolean;
  deletedStepPosition?: { x: number; y: number };
}): WorkflowAction => {
  const offset = isIfBranch
    ? IF_ELSE_BRANCH_POSITION_OFFSETS.IF
    : IF_ELSE_BRANCH_POSITION_OFFSETS.ELSE;

  return {
    id: v4(),
    name: 'Add an Action',
    type: WorkflowActionType.EMPTY,
    valid: true,
    settings: {
      outputSchema: {},
      errorHandlingOptions: {
        continueOnFailure: { value: false },
        retryOnFailure: { value: false },
      },
      input: {},
    },
    position: deletedStepPosition ?? {
      x: (ifElseStep.position?.x ?? 0) + offset.x,
      y: (ifElseStep.position?.y ?? 0) + offset.y,
    },
  };
};

const updateIfElseStepOnDeletion = ({
  step,
  stepIdToDelete,
  stepToDeleteChildrenIds,
  allRemovedStepIds,
  replacementEmptyNodes,
  deletedStepPosition,
}: {
  step: WorkflowAction;
  stepIdToDelete: string;
  stepToDeleteChildrenIds?: string[];
  allRemovedStepIds: string[];
  replacementEmptyNodes: WorkflowAction[];
  deletedStepPosition?: { x: number; y: number };
}): WorkflowAction => {
  if (!isWorkflowIfElseAction(step)) {
    return step;
  }

  const totalBranches = step.settings.input.branches.length;

  const updatedBranches = step.settings.input.branches.map(
    (branch, branchIndex) => {
      let updatedNextStepIds = branch.nextStepIds;

      if (branch.nextStepIds.includes(stepIdToDelete)) {
        updatedNextStepIds = computeUpdatedNextStepIds({
          existingNextStepIds: branch.nextStepIds,
          stepIdToRemove: stepIdToDelete,
          stepToDeleteChildrenIds,
        });
      }

      const finalNextStepIds = updatedNextStepIds.filter(
        (id) => !allRemovedStepIds.includes(id),
      );

      const isIfBranch = branchIndex === 0;
      const isElseBranch =
        branchIndex === totalBranches - 1 && !isDefined(branch.filterGroupId);

      if ((isIfBranch || isElseBranch) && finalNextStepIds.length === 0) {
        const emptyNode = createReplacementEmptyNode({
          ifElseStep: step,
          isIfBranch,
          deletedStepPosition,
        });

        replacementEmptyNodes.push(emptyNode);

        return {
          ...branch,
          nextStepIds: [emptyNode.id],
        };
      }

      return {
        ...branch,
        nextStepIds: finalNextStepIds,
      };
    },
  );

  const filteredBranches = updatedBranches.filter((branch, branchIndex) => {
    const isIfBranch = branchIndex === 0;
    const isElseBranch =
      branchIndex === updatedBranches.length - 1 &&
      !isDefined(branch.filterGroupId);
    const isElseIfBranch =
      branchIndex > 0 &&
      branchIndex < updatedBranches.length - 1 &&
      isDefined(branch.filterGroupId);

    if (isIfBranch || isElseBranch) {
      return true;
    }

    if (isElseIfBranch && branch.nextStepIds.length === 0) {
      return false;
    }

    return true;
  });

  return {
    ...step,
    settings: {
      ...step.settings,
      input: {
        ...step.settings.input,
        branches: filteredBranches,
      },
    },
  };
};

const updateNextStepIdsOnDeletion = ({
  step,
  stepIdToDelete,
  stepToDeleteChildrenIds,
}: {
  step: WorkflowAction;
  stepIdToDelete: string;
  stepToDeleteChildrenIds?: string[];
}): WorkflowAction => {
  return {
    ...step,
    nextStepIds: computeUpdatedNextStepIds({
      existingNextStepIds: step.nextStepIds ?? [],
      stepIdToRemove: stepIdToDelete,
      stepToDeleteChildrenIds,
    }),
  };
};

const updateIteratorStepOnDeletion = ({
  step,
  stepIdToDelete,
  stepToDeleteChildrenIds,
}: {
  step: WorkflowIteratorAction;
  stepIdToDelete: string;
  stepToDeleteChildrenIds?: string[];
}): WorkflowAction => {
  return {
    ...step,
    settings: {
      ...step.settings,
      input: {
        ...step.settings.input,
        initialLoopStepIds: computeUpdatedNextStepIds({
          existingNextStepIds: step.settings.input.initialLoopStepIds ?? [],
          stepIdToRemove: stepIdToDelete,
          stepToDeleteChildrenIds,
        }),
      },
    },
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

  const allRemovedStepIds = [stepIdToDelete, ...emptyChildStepIds];
  const replacementEmptyNodes: WorkflowAction[] = [];

  const updatedSteps =
    existingSteps
      ?.filter((step) => !allRemovedStepIds.includes(step.id))
      .map((step) => {
        if (step.type === WorkflowActionType.IF_ELSE) {
          return updateIfElseStepOnDeletion({
            step,
            stepIdToDelete,
            stepToDeleteChildrenIds,
            allRemovedStepIds,
            replacementEmptyNodes,
            deletedStepPosition: stepToDelete?.position,
          });
        }

        if (step.nextStepIds?.includes(stepIdToDelete)) {
          return updateNextStepIdsOnDeletion({
            step,
            stepIdToDelete,
            stepToDeleteChildrenIds,
          });
        }

        if (
          step.type === WorkflowActionType.ITERATOR &&
          isDefined(step.settings.input.initialLoopStepIds) &&
          step.settings.input.initialLoopStepIds.includes(stepIdToDelete)
        ) {
          return updateIteratorStepOnDeletion({
            step,
            stepIdToDelete,
            stepToDeleteChildrenIds,
          });
        }

        return step;
      }) ?? [];

  updatedSteps.push(...replacementEmptyNodes);

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
    removedStepIds: allRemovedStepIds,
  };
};
