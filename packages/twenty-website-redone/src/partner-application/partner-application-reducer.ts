import {
  PARTNER_APPLICATION_STEP_IDS,
  type PartnerApplicationStepId,
} from './data/partner-application-step-ids';
import { emailFieldSchema } from './email-field-schema';
import { httpUrlFieldSchema } from './http-url-field-schema';
import {
  INITIAL_PARTNER_APPLICATION_STATE,
  type PartnerApplicationAction,
  type PartnerApplicationState,
} from './partner-application-state';

// Per-step required fields; GO_NEXT is gated on these being filled in.
const STEP_REQUIRED_FIELDS: Record<
  PartnerApplicationStepId,
  readonly (keyof PartnerApplicationState)[]
> = {
  identity: ['name', 'email', 'company'],
  profile: ['country', 'typeOfTeam'],
  expertise: ['partnerScope'],
  commercials: [],
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
  field: 'email' | 'website' | 'linkedin' | 'calendarLink';
  schema: typeof emailFieldSchema | typeof httpUrlFieldSchema;
  errorCode: 'invalid_email' | 'invalid_url';
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
      field: 'calendarLink',
      schema: httpUrlFieldSchema,
      errorCode: 'invalid_url',
    },
  ],
};

function validateStep(
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

function dropError(
  errors: Partial<Record<string, string>>,
  field: string,
): Partial<Record<string, string>> {
  if (errors[field] === undefined) return errors;
  const { [field]: _dropped, ...rest } = errors;
  return rest;
}

export function partnerApplicationReducer(
  state: PartnerApplicationState,
  action: PartnerApplicationAction,
): PartnerApplicationState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
        fieldErrors: dropError(state.fieldErrors, action.field),
      };
    case 'TOGGLE_SCOPE': {
      const next = state.partnerScope.includes(action.value)
        ? state.partnerScope.filter((value) => value !== action.value)
        : [...state.partnerScope, action.value];
      return {
        ...state,
        partnerScope: next,
        fieldErrors: dropError(state.fieldErrors, 'partnerScope'),
      };
    }
    case 'TOGGLE_LANGUAGE': {
      const next = state.languages.includes(action.value)
        ? state.languages.filter((value) => value !== action.value)
        : [...state.languages, action.value];
      return { ...state, languages: next };
    }
    case 'SET_SKILLS':
      return { ...state, skills: action.value };
    case 'GO_NEXT': {
      const errors = validateStep(state);
      if (Object.keys(errors).length > 0) {
        return { ...state, fieldErrors: errors };
      }
      const lastIndex = PARTNER_APPLICATION_STEP_IDS.length - 1;
      return {
        ...state,
        stepIndex: Math.min(state.stepIndex + 1, lastIndex),
        fieldErrors: {},
      };
    }
    case 'GO_BACK':
      return {
        ...state,
        stepIndex: Math.max(state.stepIndex - 1, 0),
        fieldErrors: {},
      };
    case 'SET_SUBMITTING':
      return { ...state, isSubmitting: action.value };
    case 'SET_SUBMIT_ERROR':
      return { ...state, submitError: action.value };
    case 'SET_SUBMITTED':
      return {
        ...state,
        isSubmitted: true,
        isSubmitting: false,
        submitError: null,
      };
    case 'RESET':
      return INITIAL_PARTNER_APPLICATION_STATE;
    default:
      return state;
  }
}
