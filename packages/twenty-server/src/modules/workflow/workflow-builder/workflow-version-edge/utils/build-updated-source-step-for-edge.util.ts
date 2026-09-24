import { isDefined } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import {
  WorkflowVersionEdgeException,
  WorkflowVersionEdgeExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-edge.exception';
import { type WorkflowStepConnectionOptions } from 'src/modules/workflow/workflow-builder/workflow-version-step/types/workflow-step-connection-options.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

type UpdatedSourceStepResult = {
  updatedSourceStep: WorkflowAction;
  shouldPersist: boolean;
};

const buildSourceStepWithAddedNextStepId = ({
  sourceStep,
  target,
}: {
  sourceStep: WorkflowAction;
  target: string;
}): UpdatedSourceStepResult => {
  if (sourceStep.nextStepIds?.includes(target)) {
    return {
      updatedSourceStep: sourceStep,
      shouldPersist: false,
    };
  }

  return {
    updatedSourceStep: {
      ...sourceStep,
      nextStepIds: [...(sourceStep.nextStepIds ?? []), target],
    },
    shouldPersist: true,
  };
};

export const buildSourceStepWithAddedEdge = ({
  sourceStep,
  target,
  sourceConnectionOptions,
}: {
  sourceStep: WorkflowAction;
  target: string;
  sourceConnectionOptions?: WorkflowStepConnectionOptions;
}): UpdatedSourceStepResult => {
  if (!isDefined(sourceConnectionOptions)) {
    return buildSourceStepWithAddedNextStepId({ sourceStep, target });
  }

  switch (sourceConnectionOptions.connectedStepType) {
    case WorkflowActionType.ITERATOR:
      if (sourceStep.type !== WorkflowActionType.ITERATOR) {
        throw new WorkflowVersionEdgeException(
          `Source step '${sourceStep.id}' is not an iterator`,
          WorkflowVersionEdgeExceptionCode.INVALID_REQUEST,
        );
      }

      if (sourceConnectionOptions.settings.isConnectedToLoop) {
        const currentInitialLoopStepIds =
          sourceStep.settings.input.initialLoopStepIds;

        if (currentInitialLoopStepIds?.includes(target)) {
          return {
            updatedSourceStep: sourceStep,
            shouldPersist: false,
          };
        }

        return {
          updatedSourceStep: {
            ...sourceStep,
            settings: {
              ...sourceStep.settings,
              input: {
                ...sourceStep.settings.input,
                initialLoopStepIds: [
                  ...(currentInitialLoopStepIds ?? []),
                  target,
                ],
              },
            },
          },
          shouldPersist: true,
        };
      }

      return buildSourceStepWithAddedNextStepId({ sourceStep, target });

    default:
      return buildSourceStepWithAddedNextStepId({ sourceStep, target });
  }
};

const buildSourceStepWithRemovedNextStepId = ({
  sourceStep,
  target,
}: {
  sourceStep: WorkflowAction;
  target: string;
}): UpdatedSourceStepResult => ({
  updatedSourceStep: {
    ...sourceStep,
    nextStepIds: sourceStep.nextStepIds?.filter(
      (nextStepId) => nextStepId !== target,
    ),
  },
  shouldPersist: true,
});

export const buildSourceStepWithRemovedEdge = ({
  sourceStep,
  target,
  sourceConnectionOptions,
}: {
  sourceStep: WorkflowAction;
  target: string;
  sourceConnectionOptions?: WorkflowStepConnectionOptions;
}): UpdatedSourceStepResult => {
  if (!isDefined(sourceConnectionOptions)) {
    return buildSourceStepWithRemovedNextStepId({ sourceStep, target });
  }

  switch (sourceConnectionOptions.connectedStepType) {
    case WorkflowActionType.ITERATOR:
      if (sourceStep.type !== WorkflowActionType.ITERATOR) {
        throw new WorkflowVersionEdgeException(
          `Source step '${sourceStep.id}' is not an iterator`,
          WorkflowVersionEdgeExceptionCode.INVALID_REQUEST,
        );
      }

      if (sourceConnectionOptions.settings.isConnectedToLoop) {
        const currentInitialLoopStepIds =
          sourceStep.settings.input.initialLoopStepIds;

        if (!currentInitialLoopStepIds?.includes(target)) {
          return {
            updatedSourceStep: sourceStep,
            shouldPersist: false,
          };
        }

        return {
          updatedSourceStep: {
            ...sourceStep,
            settings: {
              ...sourceStep.settings,
              input: {
                ...sourceStep.settings.input,
                initialLoopStepIds: currentInitialLoopStepIds.filter(
                  (id) => id !== target,
                ),
              },
            },
          },
          shouldPersist: true,
        };
      }

      return buildSourceStepWithRemovedNextStepId({ sourceStep, target });

    default:
      return buildSourceStepWithRemovedNextStepId({ sourceStep, target });
  }
};

export const assertEdgeConnectionOptionsAreSupported = (
  sourceConnectionOptions?: WorkflowStepConnectionOptions,
): void => {
  if (
    sourceConnectionOptions?.connectedStepType === WorkflowActionType.IF_ELSE
  ) {
    throw new WorkflowVersionEdgeException(
      'If/Else connections must be updated through their branch settings',
      WorkflowVersionEdgeExceptionCode.INVALID_REQUEST,
    );
  }
};
