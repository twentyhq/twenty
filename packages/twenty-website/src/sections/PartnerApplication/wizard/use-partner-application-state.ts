import { useReducer, useCallback } from 'react';

import {
  emailFieldSchema,
  httpUrlFieldSchema,
  type PartnerApplicationRequest,
} from '@/sections/PartnerApplication/partner-application-field-schemas';
import {
  PARTNER_APPLICATION_STEP_IDS,
  PARTNER_APPLICATION_STEP_REQUIRED_FIELDS,
  type PartnerApplicationStepId,
  type PartnerCountryValue,
  type PartnerLanguageValue,
  type PartnerScopeValue,
  type PartnerTypeOfTeam,
} from './partner-fields.data';

export type CountryFieldValue = PartnerCountryValue | '';

export type PartnerApplicationState = {
  stepIndex: number;

  // Identity
  name: string;
  email: string;
  company: string;
  website: string;

  // Profile
  linkedin: string;
  city: string;
  country: CountryFieldValue;
  languages: PartnerLanguageValue[];

  // Expertise & experience
  typeOfTeam: PartnerTypeOfTeam | '';
  partnerScope: PartnerScopeValue[];
  skills: string[];
  applicationNotes: string;

  // Commercials
  hourlyRate: string;
  projectBudgetMin: string;
  calendarLink: string;

  // Meta
  fieldErrors: Partial<Record<string, string>>;
  submitError: string | null;
  isSubmitting: boolean;
  isSubmitted: boolean;
};

export const INITIAL_PARTNER_APPLICATION_STATE: PartnerApplicationState = {
  stepIndex: 0,
  name: '',
  email: '',
  company: '',
  website: '',
  linkedin: '',
  city: '',
  country: '',
  languages: [],
  typeOfTeam: '',
  partnerScope: [],
  skills: [],
  applicationNotes: '',
  hourlyRate: '',
  projectBudgetMin: '',
  calendarLink: '',
  fieldErrors: {},
  submitError: null,
  isSubmitting: false,
  isSubmitted: false,
};

export type ScalarFieldName =
  | 'name'
  | 'email'
  | 'company'
  | 'website'
  | 'linkedin'
  | 'city'
  | 'country'
  | 'typeOfTeam'
  | 'applicationNotes'
  | 'hourlyRate'
  | 'projectBudgetMin'
  | 'calendarLink';

export type PartnerApplicationAction =
  | { type: 'SET_FIELD'; field: ScalarFieldName; value: string }
  | { type: 'TOGGLE_SCOPE'; value: PartnerScopeValue }
  | { type: 'TOGGLE_LANGUAGE'; value: PartnerLanguageValue }
  | { type: 'SET_SKILLS'; value: string[] }
  | { type: 'GO_NEXT' }
  | { type: 'GO_BACK' }
  | { type: 'SET_SUBMITTING'; value: boolean }
  | { type: 'SET_SUBMIT_ERROR'; value: string | null }
  | { type: 'SET_SUBMITTED' }
  | { type: 'RESET' };

function isEmpty(value: unknown): boolean {
  if (value === '' || value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

// Per-step format checks reuse the shared field schemas so the client rejects
// exactly what the server route schema rejects. The empty/required gate above
// owns "is it filled in"; these only run on non-empty values.
type FieldFormatCheck = {
  field: 'email' | 'website' | 'linkedin' | 'calendarLink';
  schema: typeof emailFieldSchema | typeof httpUrlFieldSchema;
  errorCode: 'invalid_email' | 'invalid_url';
};

const STEP_FORMAT_CHECKS: Partial<
  Record<PartnerApplicationStepId, ReadonlyArray<FieldFormatCheck>>
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
  const required = PARTNER_APPLICATION_STEP_REQUIRED_FIELDS[stepId];
  const errors: Partial<Record<string, string>> = {};

  for (const field of required) {
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
  const { [field]: _ignored, ...rest } = errors;
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
        ? state.partnerScope.filter((v) => v !== action.value)
        : [...state.partnerScope, action.value];
      return {
        ...state,
        partnerScope: next,
        fieldErrors: dropError(state.fieldErrors, 'partnerScope'),
      };
    }
    case 'TOGGLE_LANGUAGE': {
      const next = state.languages.includes(action.value)
        ? state.languages.filter((v) => v !== action.value)
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

export function usePartnerApplicationState() {
  const [state, dispatch] = useReducer(
    partnerApplicationReducer,
    INITIAL_PARTNER_APPLICATION_STATE,
  );

  const setField = useCallback(
    (field: ScalarFieldName, value: string) =>
      dispatch({ type: 'SET_FIELD', field, value }),
    [],
  );
  const toggleScope = useCallback(
    (value: PartnerScopeValue) => dispatch({ type: 'TOGGLE_SCOPE', value }),
    [],
  );
  const toggleLanguage = useCallback(
    (value: PartnerLanguageValue) =>
      dispatch({ type: 'TOGGLE_LANGUAGE', value }),
    [],
  );
  const setSkills = useCallback(
    (value: string[]) => dispatch({ type: 'SET_SKILLS', value }),
    [],
  );
  const goNext = useCallback(() => dispatch({ type: 'GO_NEXT' }), []);
  const goBack = useCallback(() => dispatch({ type: 'GO_BACK' }), []);
  const setSubmitting = useCallback(
    (value: boolean) => dispatch({ type: 'SET_SUBMITTING', value }),
    [],
  );
  const setSubmitError = useCallback(
    (value: string | null) => dispatch({ type: 'SET_SUBMIT_ERROR', value }),
    [],
  );
  const setSubmitted = useCallback(
    () => dispatch({ type: 'SET_SUBMITTED' }),
    [],
  );
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    state,
    setField,
    toggleScope,
    toggleLanguage,
    setSkills,
    goNext,
    goBack,
    setSubmitting,
    setSubmitError,
    setSubmitted,
    reset,
  };
}

export type PartnerApplicationController = ReturnType<
  typeof usePartnerApplicationState
>;

export function getCurrentStepId(
  state: PartnerApplicationState,
): PartnerApplicationStepId {
  return PARTNER_APPLICATION_STEP_IDS[state.stepIndex];
}

// Maps the form state to the POST body. Trims strings, omits empty optional
// fields, and parses the numeric commercials. Shape must match what the route
// schema (`partnerApplicationRequestSchema`) accepts.
export function buildPartnerApplicationRequestBody(
  state: PartnerApplicationState,
): PartnerApplicationRequest {
  const body: PartnerApplicationRequest = {
    name: state.name.trim(),
    email: state.email.trim(),
    company: state.company.trim(),
  };

  if (state.website.trim()) body.website = state.website.trim();
  if (state.linkedin.trim()) body.linkedin = state.linkedin.trim();
  if (state.city.trim()) body.city = state.city.trim();
  if (state.country !== '') body.country = state.country;
  if (state.languages.length > 0) body.languages = state.languages;
  if (state.typeOfTeam !== '') body.typeOfTeam = state.typeOfTeam;
  if (state.partnerScope.length > 0) body.partnerScope = state.partnerScope;
  if (state.skills.length > 0) body.skills = state.skills;
  if (state.applicationNotes.trim())
    body.applicationNotes = state.applicationNotes.trim();

  const hourlyRate = parseFloat(state.hourlyRate);
  if (Number.isFinite(hourlyRate) && hourlyRate >= 0)
    body.hourlyRate = hourlyRate;

  const projectBudgetMin = parseFloat(state.projectBudgetMin);
  if (Number.isFinite(projectBudgetMin) && projectBudgetMin >= 0)
    body.projectBudgetMin = projectBudgetMin;

  if (state.calendarLink.trim()) body.calendarLink = state.calendarLink.trim();

  return body;
}
