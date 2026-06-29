import {
  CLIENT_BRIEF_STEP_IDS,
  type ClientBriefStepId,
} from './data/client-brief-step-ids';
import { emailFieldSchema } from '@/partner-application/email-field-schema';
import { type ClientBriefState } from './client-brief-state';

const STEP_REQUIRED_FIELDS: Record<
  ClientBriefStepId,
  readonly (keyof ClientBriefState)[]
> = {
  brief: ['need'],
  context: [],
  identity: ['firstName', 'email', 'companyName'],
};

function isEmpty(value: unknown): boolean {
  if (typeof value === 'string') return value.trim() === '';
  if (Array.isArray(value)) return value.length === 0;
  return value === null || value === undefined;
}

export function validateClientBriefStep(
  state: ClientBriefState,
): Partial<Record<string, string>> {
  if (
    state.stepIndex < 0 ||
    state.stepIndex >= CLIENT_BRIEF_STEP_IDS.length
  ) {
    return { step: 'invalid_step' };
  }
  const stepId = CLIENT_BRIEF_STEP_IDS[state.stepIndex];
  const errors: Partial<Record<string, string>> = {};

  for (const field of STEP_REQUIRED_FIELDS[stepId]) {
    if (isEmpty(state[field])) {
      errors[field] = 'required';
    }
  }

  if (stepId === 'identity' && state.email.trim()) {
    if (!emailFieldSchema.safeParse(state.email).success) {
      errors.email = 'invalid_email';
    }
  }

  return errors;
}
