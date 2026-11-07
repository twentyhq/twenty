import { isDefined } from '@/utils';
import { WorkflowActionType } from '@/workflow/types/WorkflowActionType';
import { isIfElseStepInput } from '@/workflow/validation/guards/isIfElseStepInput';
import { isIteratorStepInput } from '@/workflow/validation/guards/isIteratorStepInput';
import { type ValidatableWorkflowStep } from '@/workflow/validation/types/WorkflowValidation';
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
  if (step.type === WorkflowActionType.IF_ELSE) {
    const branches = isIfElseStepInput(step)
      ? (step.settings.input.branches ?? [])
      : [];

    return [
      ...new Set(branches.flatMap((branch) => branch?.nextStepIds ?? [])),
    ];
  }

  const outgoingStepIds = new Set<string>(step.nextStepIds ?? []);

  if (isIteratorStepInput(step)) {
    for (const nextStepId of step.settings.input.initialLoopStepIds ?? []) {
      outgoingStepIds.add(nextStepId);
    }
  }

  return [...outgoingStepIds];
};
