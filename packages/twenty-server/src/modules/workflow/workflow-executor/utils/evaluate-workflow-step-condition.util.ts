import { createValidationRuleEvaluator } from 'twenty-shared/utils';

import {
  WorkflowStepExecutorException,
  WorkflowStepExecutorExceptionCode,
} from 'src/modules/workflow/workflow-executor/exceptions/workflow-step-executor.exception';

// Fails the step, as a legacy step filter that cannot be evaluated does
export const evaluateWorkflowStepCondition = ({
  condition,
  context,
}: {
  condition: string;
  context: Record<string, unknown>;
}): boolean => {
  const result = createValidationRuleEvaluator({
    expression: condition,
    fields: [],
    allowsVariables: true,
  })({
    record: {},
    now: new Date().toISOString(),
    variableContext: context,
  });

  if (result.status === 'errored') {
    throw new WorkflowStepExecutorException(
      `The condition "${condition}" could not be evaluated: ${result.errorMessage}`,
      WorkflowStepExecutorExceptionCode.INVALID_STEP_INPUT,
    );
  }

  return result.status === 'passed';
};
