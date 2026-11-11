import { isNonEmptyString } from '@sniptt/guards';
import { compileValidationRuleExpression } from 'twenty-shared/utils';
import {
  WorkflowActionType,
  type WorkflowValidationIssue,
} from 'twenty-shared/workflow';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const getConditionIssue = ({
  step,
  condition,
  path,
}: {
  step: WorkflowAction;
  condition: string | undefined;
  path: string;
}): WorkflowValidationIssue[] => {
  if (!isNonEmptyString(condition)) {
    return [];
  }

  const compilation = compileValidationRuleExpression({
    expression: condition,
    fields: [],
    allowsVariables: true,
  });

  return compilation.isValid
    ? []
    : [
        {
          severity: 'error',
          code: 'INVALID_STEP_PARAMS',
          message: `The condition of step "${step.name}" is invalid: ${compilation.errorMessage}`,
          stepId: step.id,
          path,
        },
      ];
};

// Variable references inside a condition are checked with the rest of the step input
export const getWorkflowStepConditionIssues = (
  step: WorkflowAction,
): WorkflowValidationIssue[] => {
  if (step.type === WorkflowActionType.FILTER) {
    return getConditionIssue({
      step,
      condition: step.settings.input.condition,
      path: 'settings.input.condition',
    });
  }

  if (step.type === WorkflowActionType.IF_ELSE) {
    return step.settings.input.branches.flatMap((branch, branchIndex) =>
      getConditionIssue({
        step,
        condition: branch.condition,
        path: `settings.input.branches.${branchIndex}.condition`,
      }),
    );
  }

  return [];
};
