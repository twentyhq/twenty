import { type WorkflowValidationIssue } from 'twenty-shared/workflow';

export const buildMissingOutputSchemaIssue = ({
  id,
  name,
}: {
  id: string;
  name?: string;
}): WorkflowValidationIssue => {
  return {
    severity: 'error',
    code: 'CODE_STEP_MISSING_OUTPUT_SCHEMA',
    message: `Step "${name ?? id}" has no output schema. Declare an expected output schema.`,
    stepId: id,
  };
};
