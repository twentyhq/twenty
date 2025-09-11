import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

import {
  WorkflowVersionStepException,
  WorkflowVersionStepExceptionCode,
} from 'src/modules/workflow/common/exceptions/workflow-version-step.exception';
import { type WorkflowStepCreationOptions } from 'src/modules/workflow/workflow-builder/workflow-version-step/types/WorkflowStepCreationOptions';
import { type WorkflowIteratorActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/iterator/types/workflow-iterator-action-settings.type';
import {
  WorkflowActionType,
  type WorkflowAction,
} from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';
import { type WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

export const insertStep = ({
  existingSteps,
  existingTrigger,
  insertedStep,
  parentStepId,
  nextStepId,
  options,
}: {
  existingSteps: WorkflowAction[];
  existingTrigger: WorkflowTrigger | null;
  insertedStep: WorkflowAction;
  parentStepId?: string;
  nextStepId?: string;
  options?: WorkflowStepCreationOptions;
}): {
  updatedSteps: WorkflowAction[];
  updatedInsertedStep: WorkflowAction;
  updatedTrigger: WorkflowTrigger | null;
} => {
  let { updatedExistingSteps, updatedTrigger } = isDefined(parentStepId)
    ? updateParentStep({
        trigger: existingTrigger,
        steps: existingSteps,
        parentStepId,
        insertedStepId: insertedStep.id,
        nextStepId,
      })
    : {
        updatedExistingSteps: existingSteps,
        updatedTrigger: existingTrigger,
      };

  if (isDefined(options)) {
    updatedExistingSteps = updateStepsWithOptions({
      insertedStepId: insertedStep.id,
      steps: updatedExistingSteps,
      options,
    });
  }

  const updatedInsertedStep = {
    ...insertedStep,
    nextStepIds: nextStepId ? [nextStepId] : undefined,
  };

  return {
    updatedSteps: [...updatedExistingSteps, updatedInsertedStep],
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
}: {
  steps: WorkflowAction[];
  trigger: WorkflowTrigger | null;
  parentStepId: string;
  insertedStepId: string;
  nextStepId?: string;
}) => {
  let updatedTrigger = trigger;

  let updatedExistingSteps = steps;

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
    updatedExistingSteps = steps.map((step) => {
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
    updatedExistingSteps,
    updatedTrigger,
  };
};

const updateStepsWithOptions = ({
  insertedStepId,
  steps,
  options,
}: {
  insertedStepId: string;
  steps: WorkflowAction[];
  options: WorkflowStepCreationOptions;
}): WorkflowAction[] => {
  switch (options.type) {
    case WorkflowActionType.ITERATOR:
      if (!options.settings.shouldInsertToLoop) {
        return steps;
      }

      return steps.map((step) => {
        if (step.id === options.settings.iteratorStepId) {
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
                  ...(step.settings.input.initialLoopStepIds || []),
                  insertedStepId,
                ],
              },
            } satisfies WorkflowIteratorActionSettings,
          };
        }

        return step;
      });
    default:
      return steps;
  }
};
