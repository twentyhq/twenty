import {
  PARTNER_APPLICATION_STEP_IDS,
  type PartnerApplicationStepId,
} from './data/partner-application-step-ids';
import { emailFieldSchema } from './email-field-schema';
import { httpUrlFieldSchema } from './http-url-field-schema';
import { nonNegativeAmountFieldSchema } from './non-negative-amount-field-schema';
import { type PartnerApplicationState } from './partner-application-state';

// Per-step required fields; GO_NEXT and the final-step submit are gated on these
// being filled in.
const STEP_REQUIRED_FIELDS: Record<
  PartnerApplicationStepId,
  readonly (keyof PartnerApplicationState)[]
> = {
  identity: ['name', 'email', 'company', 'website'],
  profile: ['country', 'typeOfTeam', 'city'],
  expertise: ['partnerScope'],
  commercials: ['hourlyRate', 'projectBudgetMin'],
};

function isEmpty(value: unknown): boolean {
  if (value === '' || value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

// Per-step format checks reuse the shared field schemas so the client rejects
// exactly what the server route schema rejects. The required gate above owns
// "is it filled in"; these only run on non-empty values.
type FieldFormatCheck = {
  field:
    | 'email'
    | 'website'
    | 'linkedin'
    | 'calendarLink'
    | 'hourlyRate'
    | 'projectBudgetMin';
  schema:
    | typeof emailFieldSchema
    | typeof httpUrlFieldSchema
    | typeof nonNegativeAmountFieldSchema;
  errorCode: 'invalid_email' | 'invalid_url' | 'invalid_amount';
};

const STEP_FORMAT_CHECKS: Partial<
  Record<PartnerApplicationStepId, readonly FieldFormatCheck[]>
> = {
  identity: [
    { field: 'email', schema: emailFieldSchema, errorCode: 'invalid_email' },
    { field: 'website', schema: httpUrlFieldSchema, errorCode: 'invalid_url' },
  ],
  profile: [
    { field: 'linkedin', schema: httpUrlFieldSchema, errorCode: 'invalid_url' },
  ],
  commercials: [
    {
      field: 'hourlyRate',
      schema: nonNegativeAmountFieldSchema,
      errorCode: 'invalid_amount',
    },
    {
      field: 'projectBudgetMin',
      schema: nonNegativeAmountFieldSchema,
      errorCode: 'invalid_amount',
    },
    {
      field: 'calendarLink',
      schema: httpUrlFieldSchema,
      errorCode: 'invalid_url',
    },
  ],
};

export function validatePartnerApplicationStep(
  state: PartnerApplicationState,
): Partial<Record<string, string>> {
  const stepId = PARTNER_APPLICATION_STEP_IDS[state.stepIndex];
  const errors: Partial<Record<string, string>> = {};

  for (const field of STEP_REQUIRED_FIELDS[stepId]) {
    if (isEmpty(state[field])) {
      errors[field] = 'required';
    }
  }

  for (const check of STEP_FORMAT_CHECKS[stepId] ?? []) {
    const value = state[check.field];
    if (value && !check.schema.safeParse(value).success) {
      errors[check.field] = check.errorCode;
    }
  }

  return errors;
}
