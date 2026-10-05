import { type WorkflowValidationIssueCode } from '@/workflow/validation/types/WorkflowValidation';

// Allowed in a draft being edited, but block activation since a run could not proceed through them.
export const NON_ACTIVABLE_WORKFLOW_VALIDATION_ISSUE_CODES: ReadonlySet<WorkflowValidationIssueCode> =
  new Set([
    'MISSING_TRIGGER',
    'MISSING_TRIGGER_TYPE',
    'NO_STEPS',
    'TRIGGER_HAS_NO_NEXT_STEP',
    'IF_ELSE_INSUFFICIENT_BRANCHES',
    'ITERATOR_MISSING_LOOP_BODY',
    'INCOMPLETE_PICK_RECORD_CONFIG',
    'AI_AGENT_MISSING_AGENT',
    'CLASSIFY_MISSING_STATE',
    'CLASSIFY_INCOMPLETE_QUESTION',
    'VARIABLE_INVALID_PATH',
    'VARIABLE_UNKNOWN_STEP',
    'VARIABLE_NOT_UPSTREAM',
  ]);
