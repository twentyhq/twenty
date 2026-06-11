import { isDefined } from '@/utils';
import { WORKFLOW_VALIDATION_STEP_TYPES } from '@/workflow/validation/constants/workflow-validation-step-types';
import {
  type IfElseStepInput,
  type IteratorStepInput,
  type ValidatableWorkflowStep,
} from '@/workflow/validation/types/workflow-validation.type';
import { isObject } from '@sniptt/guards';

export const getStepInput = (
  step: ValidatableWorkflowStep,
): Record<string, unknown> | undefined => {
  const input = step.settings?.input;

  if (isDefined(input) && isObject(input)) {
    return input as Record<string, unknown>;
  }

  return undefined;
};

export const getStepOutgoingStepIds = (
  step: ValidatableWorkflowStep,
): string[] => {
  const outgoingStepIds = new Set<string>(step.nextStepIds ?? []);

  const input = getStepInput(step);

  if (!isDefined(input)) {
    return [...outgoingStepIds];
  }

  if (step.type === WORKFLOW_VALIDATION_STEP_TYPES.IF_ELSE) {
    const branches = (input as Partial<IfElseStepInput>).branches ?? [];

    for (const branch of branches) {
      for (const nextStepId of branch?.nextStepIds ?? []) {
        outgoingStepIds.add(nextStepId);
      }
    }
  }

  if (step.type === WORKFLOW_VALIDATION_STEP_TYPES.ITERATOR) {
    const initialLoopStepIds =
      (input as Partial<IteratorStepInput>).initialLoopStepIds ?? [];

    for (const nextStepId of initialLoopStepIds) {
      outgoingStepIds.add(nextStepId);
    }
  }

  return [...outgoingStepIds];
};
