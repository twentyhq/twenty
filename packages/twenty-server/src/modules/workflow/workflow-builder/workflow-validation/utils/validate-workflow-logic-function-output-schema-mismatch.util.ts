import { isObject } from '@sniptt/guards';
import {
  getOutputSchemaFromValue,
  getOutputSchemaMismatchIssues,
} from 'twenty-shared/logic-function';
import { isDefined } from 'twenty-shared/utils';
import {
  type BaseOutputSchemaV2,
  type WorkflowValidationIssue,
} from 'twenty-shared/workflow';

import { type WorkflowLogicFunctionAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

export const validateWorkflowLogicFunctionOutputSchemaMismatch = ({
  step,
  declaredOutputSchema,
}: {
  step: WorkflowLogicFunctionAction;
  declaredOutputSchema: BaseOutputSchemaV2 | undefined;
}): WorkflowValidationIssue[] => {
  const expectedOutputSchema = step.settings?.expectedOutputSchema;

  if (
    !isDefined(declaredOutputSchema) ||
    !isObject(expectedOutputSchema) ||
    Object.keys(expectedOutputSchema).length === 0
  ) {
    return [];
  }

  const mismatchIssues = getOutputSchemaMismatchIssues(
    declaredOutputSchema,
    getOutputSchemaFromValue(expectedOutputSchema),
  );

  return mismatchIssues.map((mismatchIssue) => ({
    severity: 'warning',
    code: 'LOGIC_FUNCTION_OUTPUT_SCHEMA_MISMATCH',
    message: `Step "${step.name ?? step.id}" expected output schema does not match the function's declared output schema: ${mismatchIssue}`,
    stepId: step.id,
  }));
};
