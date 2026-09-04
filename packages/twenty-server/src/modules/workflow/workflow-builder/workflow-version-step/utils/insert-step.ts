import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID, WorkflowActionType } from 'twenty-shared/workflow';

import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { type WorkflowStepConnectionOptions } from 'src/modules/workflow/workflow-builder/workflow-version-step/types/WorkflowStepConnectionOptions';
import { type WorkflowIteratorActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/types/workflow-iterator-action-settings.type';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export const insertStep = ({
  existingSteps,
  existingTrigger,
  insertedStep,
  additionalCreatedSteps = [],
  nextStepId,
  parentStepId,
  parentStepConnectionOptions,
}: {
  existingSteps: WorkflowAction[];
  existingTrigger: WorkflowTrigger | null;
  insertedStep: WorkflowAction;
  additionalCreatedSteps?: WorkflowAction[];
  nextStepId?: string;
  parentStepId?: string;
  parentStepConnectionOptions?: WorkflowStepConnectionOptions;
}): {
  updatedSteps: WorkflowAction[];
  updatedInsertedStep: WorkflowAction;
  updatedTrigger: WorkflowTrigger | null;
} => {
  let { updatedSteps, updatedTrigger } = isDefined(parentStepId)
    ? updateParentStep({
        trigger: existingTrigger,
        steps: existingSteps,
        parentStepId,
        insertedStepId: insertedStep.id,
        nextStepId,
        parentStepConnectionOptions,
      })
    : {
        updatedSteps: existingSteps,
        updatedTrigger: existingTrigger,
      };

  const isInsertedStepIfElse = insertedStep.type === WorkflowActionType.IF_ELSE;
  const nextStepIds = isDefined(nextStepId) ? [nextStepId] : undefined;
  const updatedInsertedStep = {
    ...insertedStep,
    nextStepIds: isInsertedStepIfElse ? undefined : nextStepIds,
  };
  const branchStepIds = isInsertedStepIfElse
    ? insertedStep.settings.input.branches.flatMap(
        (branch) => branch.nextStepIds,
      )
    : [];
  const updatedAdditionalSteps = additionalCreatedSteps.map((step) =>
    isDefined(nextStepId) && branchStepIds.includes(step.id)
      ? { ...step, nextStepIds }
      : step,
  );

  return {
    updatedSteps: [
      ...updatedSteps,
      updatedInsertedStep,
      ...updatedAdditionalSteps,
    ],
    updatedTrigger,
    updatedInsertedStep,
  };
};

const updateParentStep = ({
  steps,
  trigger,
  parentStepId,
  insertedStepId,
  nextStepId,
  parentStepConnectionOptions,
}: {
  steps: WorkflowAction[];
  trigger: WorkflowTrigger | null;
  parentStepId: string;
  insertedStepId: string;
  nextStepId?: string;
  parentStepConnectionOptions?: WorkflowStepConnectionOptions;
}): {
  updatedSteps: WorkflowAction[];
  updatedTrigger: WorkflowTrigger | null;
} => {
  if (isDefined(parentStepConnectionOptions)) {
    return updateStepsWithOptions({
      steps,
      parentStepId,
      insertedStepId,
      parentStepConnectionOptions,
      trigger,
      nextStepId,
    });
  } else {
    return updateParentStepNextStepIds({
      steps,
      trigger,
      parentStepId,
      insertedStepId,
      nextStepId,
    });
  }
};

const updateParentStepNextStepIds = ({
  steps,
  trigger,
  parentStepId,
  insertedStepId,
  nextStepId,
}: {
  steps: WorkflowAction[];
  trigger: WorkflowTrigger | null;
  parentStepId: string;
  insertedStepId: string;
  nextStepId?: string;
}): {
  updatedSteps: WorkflowAction[];
  updatedTrigger: WorkflowTrigger | null;
} => {
  let updatedTrigger = trigger;

  let updatedSteps = steps;

  if (parentStepId === TRIGGER_STEP_ID) {
    if (!trigger) {
      throw new WorkflowVersionStepException(
        'Cannot insert step from undefined trigger',
        WorkflowVersionStepExceptionCode.INVALID_REQUEST,
      );
    }

    updatedTrigger = {
      ...trigger,
      nextStepIds: [
        ...new Set([
          ...(trigger.nextStepIds?.filter((id) => id !== nextStepId) || []),
          insertedStepId,
        ]),
      ],
    };
  } else {
    updatedSteps = steps.map((step) => {
      if (step.id === parentStepId) {
        return {
          ...step,
          nextStepIds: [
            ...new Set([
              ...(step.nextStepIds?.filter((id) => id !== nextStepId) || []),
              insertedStepId,
            ]),
          ],
        };
      }

      return step;
    });
  }

  return {
    updatedSteps,
    updatedTrigger,
  };
};

const updateStepsWithOptions = ({
  parentStepId,
  insertedStepId,
  steps,
  parentStepConnectionOptions,
  trigger,
  nextStepId,
}: {
  parentStepId: string;
  insertedStepId: string;
  steps: WorkflowAction[];
  parentStepConnectionOptions: WorkflowStepConnectionOptions;
  trigger: WorkflowTrigger | null;
  nextStepId?: string;
}) => {
  let updatedSteps = steps;

  switch (parentStepConnectionOptions.connectedStepType) {
    case WorkflowActionType.IF_ELSE: {
      const parentStep = steps.find((step) => step.id === parentStepId);

      if (parentStep?.type !== WorkflowActionType.IF_ELSE) {
        throw new WorkflowVersionStepException(
          `Step ${parentStepId} is not an If/Else action`,
          WorkflowVersionStepExceptionCode.INVALID_REQUEST,
        );
      }

      const branchId = parentStepConnectionOptions.settings.branchId;
      const branch = parentStep.settings.input.branches.find(
        (branch) => branch.id === branchId,
      );

      if (
        !isDefined(branch) ||
        (isDefined(nextStepId) && !branch.nextStepIds.includes(nextStepId))
      ) {
        throw new WorkflowVersionStepException(
          `Cannot insert a step on branch ${branchId}`,
          WorkflowVersionStepExceptionCode.INVALID_REQUEST,
        );
      }

      const updatedParentStep = {
        ...parentStep,
        settings: {
          ...parentStep.settings,
          input: {
            ...parentStep.settings.input,
            branches: parentStep.settings.input.branches.map((branch) =>
              branch.id === branchId
                ? {
                    ...branch,
                    nextStepIds: isDefined(nextStepId)
                      ? branch.nextStepIds.map((stepId) =>
                          stepId === nextStepId ? insertedStepId : stepId,
                        )
                      : [...branch.nextStepIds, insertedStepId],
                  }
                : branch,
            ),
          },
        },
      };

      updatedSteps = steps.map((step) =>
        step.id === parentStepId ? updatedParentStep : step,
      );

      break;
    }
    case WorkflowActionType.ITERATOR:
      if (!parentStepConnectionOptions.settings.isConnectedToLoop) {
        break;
      }

      updatedSteps = steps.map((step) => {
        if (step.id === parentStepId) {
          if (step.type !== WorkflowActionType.ITERATOR) {
            throw new WorkflowVersionStepException(
              `Step ${step.id} is not an iterator`,
              WorkflowVersionStepExceptionCode.INVALID_REQUEST,
            );
          }

          return {
            ...step,
            settings: {
              ...step.settings,
              input: {
                ...step.settings.input,
                initialLoopStepIds: [
                  ...new Set([
                    ...(step.settings.input.initialLoopStepIds?.filter(
                      (id: string) => id !== nextStepId,
                    ) || []),
                    insertedStepId,
                  ]),
                ],
              },
            } satisfies WorkflowIteratorActionSettings,
          };
        }

        return step;
      });

      break;
    default:
      break;
  }

  return {
    updatedSteps,
    updatedTrigger: trigger,
  };
};
