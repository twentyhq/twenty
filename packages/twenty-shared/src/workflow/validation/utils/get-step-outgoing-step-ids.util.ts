import { isDefined } from '@/utils';
import { WorkflowActionType } from '@/workflow/types/WorkflowActionType';
import { isIfElseStepInput } from '@/workflow/validation/guards/isIfElseStepInput';
import { type ValidatableWorkflowStep } from '@/workflow/validation/types/workflow-validation.type';
import { isObject, isString } from '@sniptt/guards';

export const getStepInput = (
  step: ValidatableWorkflowStep,
): Record<string, unknown> | undefined => {
  const input = step.settings?.input;

  if (isDefined(input) && isObject(input)) {
    return input as Record<string, unknown>;
  }

  return undefined;
};

// initialLoopStepIds can be stored either as a string array or as its
// JSON-serialized form, depending on how the version was authored.
const parseLoopStepIds = (value: unknown): string[] => {
  if (isString(value)) {
    try {
      const parsed: unknown = JSON.parse(value);

      if (Array.isArray(parsed) && parsed.every(isString)) {
        return parsed;
      }
    } catch {
      return [];
    }

    return [];
  }

  if (Array.isArray(value) && value.every(isString)) {
    return value;
  }

  return [];
};

export const getStepOutgoingStepIds = (
  step: ValidatableWorkflowStep,
): string[] => {
  const outgoingStepIds = new Set<string>(step.nextStepIds ?? []);

  if (isIfElseStepInput(step)) {
    for (const branch of step.settings.input.branches ?? []) {
      for (const nextStepId of branch?.nextStepIds ?? []) {
        outgoingStepIds.add(nextStepId);
      }
    }
  }

  if (step.type === WorkflowActionType.ITERATOR) {
    for (const nextStepId of parseLoopStepIds(
      getStepInput(step)?.initialLoopStepIds,
    )) {
      outgoingStepIds.add(nextStepId);
    }
  }

  return [...outgoingStepIds];
};
