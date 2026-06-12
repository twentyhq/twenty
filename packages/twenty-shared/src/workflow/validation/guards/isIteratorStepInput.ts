import { isNonEmptyArray, isObject } from '@sniptt/guards';

import { WorkflowActionType } from '@/workflow/types/WorkflowActionType';
import {
  type IteratorStepInput,
  type ValidatableWorkflowStep,
} from '@/workflow/validation/types/workflow-validation.type';

export const isIteratorStepInput = (
  step: ValidatableWorkflowStep,
): step is ValidatableWorkflowStep & {
  settings: { input: Partial<IteratorStepInput> };
} => {
  const input = step.settings?.input;

  return (
    step.type === WorkflowActionType.ITERATOR &&
    isObject(input) &&
    'initialLoopStepIds' in input &&
    isNonEmptyArray(input.initialLoopStepIds)
  );
};
