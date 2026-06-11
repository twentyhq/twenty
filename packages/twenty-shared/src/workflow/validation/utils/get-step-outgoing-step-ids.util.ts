import { isDefined } from '@/utils';
import { isIfElseStepInput } from '@/workflow/validation/guards/isIfElseStepInput';
import { isIteratorStepInput } from '@/workflow/validation/guards/isIteratorStepInput';
import { type ValidatableWorkflowStep } from '@/workflow/validation/types/workflow-validation.type';
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

  if (isIfElseStepInput(input)) {
    for (const branch of input.branches ?? []) {
      for (const nextStepId of branch?.nextStepIds ?? []) {
        outgoingStepIds.add(nextStepId);
      }
    }
  }

  if (isIteratorStepInput(input)) {
    for (const nextStepId of input.initialLoopStepIds ?? []) {
      outgoingStepIds.add(nextStepId);
    }
  }

  return [...outgoingStepIds];
};
