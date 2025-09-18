import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { type WorkflowStepConnectionOptions } from 'src/modules/workflow/workflow-builder/workflow-version-step/types/WorkflowStepCreationOptions';
import { type WorkflowIteratorActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/types/workflow-iterator-action-settings.type';
import {
  type WorkflowAction,
  WorkflowActionType,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export const insertStep = ({
  existingSteps,
  existingTrigger,
  insertedStep,
  nextStepId,
  parentStepId,
  parentStepConnectionOptions,
}: {
  existingSteps: WorkflowAction[];
  existingTrigger: WorkflowTrigger | null;
  insertedStep: WorkflowAction;
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

  const updatedInsertedStep = {
    ...insertedStep,
    nextStepIds: nextStepId ? [nextStepId] : undefined,
  };

  return {
    updatedSteps: [...updatedSteps, updatedInsertedStep],
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
                      (id) => id !== nextStepId,
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
