import { type WorkflowValidationIssueCode } from '@/workflow/validation/types/WorkflowValidation';

export const MALFORMED_WORKFLOW_VALIDATION_ISSUE_CODES: ReadonlySet<WorkflowValidationIssueCode> =
  new Set([
    'INVALID_TRIGGER_PARAMS',
    'INVALID_STEP_PARAMS',
    'INVALID_RICH_TEXT_FIELD',
    'OBJECT_NOT_FOUND',
    'DUPLICATE_STEP_ID',
    'DANGLING_REFERENCE',
  ]);
