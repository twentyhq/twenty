import { isDefined } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import {
  WorkflowVersionEdgeException,
  WorkflowVersionEdgeExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-edge.exception';
import { getIfElseBranchConnectionHint } from 'src/modules/workflow/workflow-builder/utils/get-if-else-branch-connection-hint.util';
import { type WorkflowStepConnectionOptions } from 'src/modules/workflow/workflow-builder/workflow-version-step/types/workflow-step-connection-options.type';
import { isWorkflowIfElseAction } from 'src/modules/workflow/workflow-executor/workflow-actions/if-else/guards/is-workflow-if-else-action.guard';
import { isWorkflowIteratorAction } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/guards/is-workflow-iterator-action.guard';
import {
  type WorkflowAction,
  type WorkflowIfElseAction,
  type WorkflowIteratorAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

type UpdatedSourceStepResult = {
  updatedSourceStep: WorkflowAction;
  shouldPersist: boolean;
};

type UpdateTargetStepIds = (stepIds: string[]) => string[];

const addTarget =
  (target: string): UpdateTargetStepIds =>
  (stepIds) =>
    stepIds.includes(target) ? stepIds : [...stepIds, target];

const removeTarget =
  (target: string): UpdateTargetStepIds =>
  (stepIds) =>
    stepIds.filter((stepId) => stepId !== target);

const toResult = ({
  sourceStep,
  updatedSourceStep,
  previousStepIds,
  updatedStepIds,
}: {
  sourceStep: WorkflowAction;
  updatedSourceStep: WorkflowAction;
  previousStepIds: string[];
  updatedStepIds: string[];
}): UpdatedSourceStepResult =>
  previousStepIds.length === updatedStepIds.length
    ? { updatedSourceStep: sourceStep, shouldPersist: false }
    : { updatedSourceStep, shouldPersist: true };

const updateIfElseBranchStepIds = ({
  sourceStep,
  sourceConnectionOptions,
  updateStepIds,
}: {
  sourceStep: WorkflowIfElseAction;
  sourceConnectionOptions?: WorkflowStepConnectionOptions;
  updateStepIds: UpdateTargetStepIds;
}): UpdatedSourceStepResult => {
  if (
    sourceConnectionOptions?.connectedStepType !== WorkflowActionType.IF_ELSE
  ) {
    throw new WorkflowVersionEdgeException(
      getIfElseBranchConnectionHint(sourceStep),
      WorkflowVersionEdgeExceptionCode.INVALID_REQUEST,
    );
  }

  const { branchId } = sourceConnectionOptions.settings;
  const branch = sourceStep.settings.input.branches.find(
    (branch) => branch.id === branchId,
  );

  if (!isDefined(branch)) {
    throw new WorkflowVersionEdgeException(
      `Branch '${branchId}' not found. ${getIfElseBranchConnectionHint(sourceStep)}`,
      WorkflowVersionEdgeExceptionCode.NOT_FOUND,
    );
  }

  const updatedStepIds = updateStepIds(branch.nextStepIds);

  return toResult({
    sourceStep,
    previousStepIds: branch.nextStepIds,
    updatedStepIds,
    updatedSourceStep: {
      ...sourceStep,
      settings: {
        ...sourceStep.settings,
        input: {
          ...sourceStep.settings.input,
          branches: sourceStep.settings.input.branches.map((branch) =>
            branch.id === branchId
              ? { ...branch, nextStepIds: updatedStepIds }
              : branch,
          ),
        },
      },
    },
  });
};

const updateIteratorLoopStepIds = ({
  sourceStep,
  updateStepIds,
}: {
  sourceStep: WorkflowIteratorAction;
  updateStepIds: UpdateTargetStepIds;
}): UpdatedSourceStepResult => {
  const initialLoopStepIds = sourceStep.settings.input.initialLoopStepIds ?? [];
  const updatedStepIds = updateStepIds(initialLoopStepIds);

  return toResult({
    sourceStep,
    previousStepIds: initialLoopStepIds,
    updatedStepIds,
    updatedSourceStep: {
      ...sourceStep,
      settings: {
        ...sourceStep.settings,
        input: {
          ...sourceStep.settings.input,
          initialLoopStepIds: updatedStepIds,
        },
      },
    },
  });
};

const updateSourceStepTargets = ({
  sourceStep,
  sourceConnectionOptions,
  updateStepIds,
}: {
  sourceStep: WorkflowAction;
  sourceConnectionOptions?: WorkflowStepConnectionOptions;
  updateStepIds: UpdateTargetStepIds;
}): UpdatedSourceStepResult => {
  // A run only follows an If/Else's branches, so its edges always belong to one
  if (isWorkflowIfElseAction(sourceStep)) {
    return updateIfElseBranchStepIds({
      sourceStep,
      sourceConnectionOptions,
      updateStepIds,
    });
  }

  switch (sourceConnectionOptions?.connectedStepType) {
    case WorkflowActionType.IF_ELSE:
      throw new WorkflowVersionEdgeException(
        `Source step '${sourceStep.id}' is not an If/Else step`,
        WorkflowVersionEdgeExceptionCode.INVALID_REQUEST,
      );
    case WorkflowActionType.ITERATOR:
      if (!isWorkflowIteratorAction(sourceStep)) {
        throw new WorkflowVersionEdgeException(
          `Source step '${sourceStep.id}' is not an iterator`,
          WorkflowVersionEdgeExceptionCode.INVALID_REQUEST,
        );
      }

      if (sourceConnectionOptions.settings.isConnectedToLoop) {
        return updateIteratorLoopStepIds({ sourceStep, updateStepIds });
      }
      break;
  }

  const nextStepIds = sourceStep.nextStepIds ?? [];
  const updatedStepIds = updateStepIds(nextStepIds);

  return toResult({
    sourceStep,
    previousStepIds: nextStepIds,
    updatedStepIds,
    updatedSourceStep: { ...sourceStep, nextStepIds: updatedStepIds },
  });
};

export const buildSourceStepWithAddedEdge = ({
  sourceStep,
  target,
  sourceConnectionOptions,
}: {
  sourceStep: WorkflowAction;
  target: string;
  sourceConnectionOptions?: WorkflowStepConnectionOptions;
}): UpdatedSourceStepResult =>
  updateSourceStepTargets({
    sourceStep,
    sourceConnectionOptions,
    updateStepIds: addTarget(target),
  });

export const buildSourceStepWithRemovedEdge = ({
  sourceStep,
  target,
  sourceConnectionOptions,
}: {
  sourceStep: WorkflowAction;
  target: string;
  sourceConnectionOptions?: WorkflowStepConnectionOptions;
}): UpdatedSourceStepResult =>
  updateSourceStepTargets({
    sourceStep,
    sourceConnectionOptions,
    updateStepIds: removeTarget(target),
  });
