import { isObject } from '@sniptt/guards';

import { WorkflowActionType } from '@/workflow/types/WorkflowActionType';
import {
  type IfElseStepInput,
  type ValidatableWorkflowStep,
} from '@/workflow/validation/types/workflow-validation.type';

export const isIfElseStepInput = (
  step: ValidatableWorkflowStep,
): step is ValidatableWorkflowStep & {
  settings: { input: Partial<IfElseStepInput> };
} => {
  const input = step.settings?.input;

  return (
    step.type === WorkflowActionType.IF_ELSE &&
    isObject(input) &&
    'branches' in input &&
    Array.isArray(input.branches)
  );
};
