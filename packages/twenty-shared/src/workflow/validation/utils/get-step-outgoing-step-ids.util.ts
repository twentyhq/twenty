import { isDefined } from '@/utils';
import {
  IF_ELSE_STEP_TYPE,
  ITERATOR_STEP_TYPE,
} from '@/workflow/validation/constants/workflow-validation-step-types';
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

  if (step.type === IF_ELSE_STEP_TYPE) {
    const branches = (input as Partial<IfElseStepInput>).branches ?? [];

    for (const branch of branches) {
      for (const nextStepId of branch?.nextStepIds ?? []) {
        outgoingStepIds.add(nextStepId);
      }
    }
  }

  if (step.type === ITERATOR_STEP_TYPE) {
    const initialLoopStepIds =
      (input as Partial<IteratorStepInput>).initialLoopStepIds ?? [];

    for (const nextStepId of initialLoopStepIds) {
      outgoingStepIds.add(nextStepId);
    }
  }

  return [...outgoingStepIds];
};
