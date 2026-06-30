import {
  type WorkflowValidationIssue,
  type WorkflowValidationResult,
} from 'twenty-shared/workflow';

export type WorkflowValidationSummary = {
  valid: boolean;
  errorCount: number;
  warningCount: number;
  errors: Array<
    Pick<
      WorkflowValidationIssue,
      'code' | 'stepId' | 'path' | 'message' | 'suggestions'
    >
  >;
  hint?: string;
};

export const summarizeValidation = (
  result: WorkflowValidationResult,
): WorkflowValidationSummary => {
  const summary: WorkflowValidationSummary = {
    valid: result.valid,
    errorCount: result.errors.length,
    warningCount: result.warnings.length,
    errors: result.errors.map(
      ({ code, stepId, path, message, suggestions }) => ({
        code,
        stepId,
        path,
        message,
        ...(suggestions && suggestions.length > 0 ? { suggestions } : {}),
      }),
    ),
  };

  if (!result.valid || result.warnings.length > 0) {
    summary.hint =
      'Compact summary. For the full report including warnings and available variable paths, call validate_workflow.';
  }

  return summary;
};
