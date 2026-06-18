import { type workflowIfElseActionSettingsSchema } from '@/workflow/schemas/if-else-action-settings-schema';
import { type workflowIteratorActionSettingsSchema } from '@/workflow/schemas/iterator-action-settings-schema';
import { type z } from 'zod';

export type IfElseStepInput = z.infer<
  typeof workflowIfElseActionSettingsSchema
>['input'];
export type IteratorStepInput = z.infer<
  typeof workflowIteratorActionSettingsSchema
>['input'];

export type WorkflowValidationSeverity = 'error' | 'warning';

export type WorkflowValidationIssueCode =
  | 'MISSING_TRIGGER'
  | 'MISSING_TRIGGER_TYPE'
  | 'NO_STEPS'
  | 'TRIGGER_HAS_NO_NEXT_STEP'
  | 'DUPLICATE_STEP_ID'
  | 'DANGLING_REFERENCE'
  | 'UNREACHABLE_STEP'
  | 'INVALID_TRIGGER_PARAMS'
  | 'INVALID_STEP_PARAMS'
  | 'IF_ELSE_INSUFFICIENT_BRANCHES'
  | 'IF_ELSE_BRANCH_HAS_NO_NEXT_STEP'
  | 'ITERATOR_MISSING_LOOP_BODY'
  | 'ITERATOR_ITEMS_NOT_ARRAY'
  | 'VARIABLE_INVALID_PATH'
  | 'VARIABLE_UNKNOWN_STEP'
  | 'VARIABLE_NOT_UPSTREAM'
  | 'VARIABLE_MISSING_OUTPUT_SCHEMA'
  | 'VARIABLE_PATH_NOT_FOUND'
  | 'CODE_STEP_MISSING_OUTPUT_SCHEMA'
  | 'STEP_HAS_NO_VARIABLE_REFERENCE'
  | 'LOGIC_FUNCTION_OUTPUT_SCHEMA_MISMATCH'
  | 'AI_AGENT_MISSING_AGENT'
  | 'AI_AGENT_MISSING_OUTPUT_VARIABLE';

export type WorkflowValidationIssue = {
  severity: WorkflowValidationSeverity;
  code: WorkflowValidationIssueCode;
  message: string;
  stepId?: string;
  path?: string;
  hint?: string;
  suggestions?: string[];
  availablePaths?: string[];
};

export type WorkflowValidationResult = {
  valid: boolean;
  errors: WorkflowValidationIssue[];
  warnings: WorkflowValidationIssue[];
};

export type ValidatableWorkflowStep = {
  id: string;
  name?: string;
  type: string;
  valid?: boolean;
  nextStepIds?: string[] | null;
  settings?: {
    input?: unknown;
    outputSchema?: unknown;
  } | null;
};

export type ValidatableWorkflowTrigger = {
  type?: string;
  name?: string;
  settings?: {
    input?: unknown;
    outputSchema?: unknown;
  } | null;
  nextStepIds?: string[] | null;
};

export type ValidatableWorkflow = {
  trigger: ValidatableWorkflowTrigger | null | undefined;
  steps: ValidatableWorkflowStep[] | null | undefined;
};
