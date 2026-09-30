import { workflowActionSchema } from '@/workflow/schemas/workflow-action-schema';
import { workflowTriggerSchema } from '@/workflow/schemas/workflow-trigger-schema';
import { isDefined } from '@/utils';
import { parseJson } from '@/utils/parseJson';
import { parseEmailDocument } from '@/utils/tiptap/parse-email-document';
import { WorkflowActionType } from '@/workflow/types/WorkflowActionType';
import {
  type ValidatableWorkflow,
  type WorkflowValidationIssue,
} from '@/workflow/validation/types/WorkflowValidation';
import { type z } from 'zod';

const formatZodPath = (path: PropertyKey[]): string =>
  path.map((segment) => String(segment)).join('.');

const formatZodIssue = (issue: z.ZodIssue): string => {
  const path = formatZodPath(issue.path);
  const base = path.length > 0 ? `${path}: ${issue.message}` : issue.message;

  if (issue.code === 'invalid_type' && path.length > 0) {
    return `${base}. Ensure the field "${path}" exists at the correct nesting level in the step object (not inside "input").`;
  }

  return base;
};

const formatZodIssues = (zodError: z.ZodError): string[] =>
  zodError.issues.map(formatZodIssue);

const isEmailBodyStoredAsDocument = (body: string | undefined): boolean =>
  !isDefined(body) ||
  body.trim() === '' ||
  parseEmailDocument(parseJson<unknown>(body)).success;

export const validateWorkflowStepParams = ({
  trigger,
  steps,
}: ValidatableWorkflow): WorkflowValidationIssue[] => {
  const issues: WorkflowValidationIssue[] = [];

  if (isDefined(trigger)) {
    const triggerResult = workflowTriggerSchema.safeParse(trigger);

    if (!triggerResult.success) {
      for (const message of formatZodIssues(triggerResult.error)) {
        issues.push({
          severity: 'error',
          code: 'INVALID_TRIGGER_PARAMS',
          message: `Trigger configuration is invalid - ${message}`,
        });
      }
    }
  }

  for (const step of steps ?? []) {
    const stepResult = workflowActionSchema.safeParse(step);

    if (!stepResult.success) {
      for (const message of formatZodIssues(stepResult.error)) {
        issues.push({
          severity: 'error',
          code: 'INVALID_STEP_PARAMS',
          message: `Step "${step.name ?? step.id}" configuration is invalid - ${message}`,
          stepId: step.id,
        });
      }

      continue;
    }

    const parsedStep = stepResult.data;

    if (
      (parsedStep.type === WorkflowActionType.SEND_EMAIL ||
        parsedStep.type === WorkflowActionType.DRAFT_EMAIL) &&
      !isEmailBodyStoredAsDocument(parsedStep.settings.input.body)
    ) {
      issues.push({
        severity: 'error',
        code: 'INVALID_STEP_PARAMS',
        message: `Step "${step.name ?? step.id}" configuration is invalid - settings.input.body: must be a serialized email document ({"type":"doc","content":[...]}), not HTML or plain text`,
        stepId: step.id,
      });
    }
  }

  return issues;
};
