import { useReducer, useCallback } from 'react';

import {
  PARTNER_APPLICATION_STEP_IDS,
  PARTNER_APPLICATION_STEP_REQUIRED_FIELDS,
  type PartnerApplicationStepId,
  type PartnerCountryValue,
  type PartnerDeploymentValue,
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
  deploymentExpertise: PartnerDeploymentValue[];
  workspaceUrl: string;
  customerReferences: string;

  // Commercials
  hourlyRate: string;
  projectBudgetMin: string;
  calendarLink: string;

  // Meta
  fieldErrors: Partial<Record<string, string>>;
  submitError: string | null;
  isSubmitting: boolean;
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
  deploymentExpertise: [],
  workspaceUrl: '',
  customerReferences: '',
  hourlyRate: '',
  projectBudgetMin: '',
  calendarLink: '',
  fieldErrors: {},
  submitError: null,
  isSubmitting: false,
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
  | 'workspaceUrl'
  | 'customerReferences'
  | 'hourlyRate'
  | 'projectBudgetMin'
  | 'calendarLink';

export type PartnerApplicationAction =
  | { type: 'SET_FIELD'; field: ScalarFieldName; value: string }
  | { type: 'TOGGLE_SCOPE'; value: PartnerScopeValue }
  | { type: 'TOGGLE_DEPLOYMENT'; value: PartnerDeploymentValue }
  | { type: 'TOGGLE_LANGUAGE'; value: PartnerLanguageValue }
  | { type: 'SET_SKILLS'; value: string[] }
  | { type: 'GO_NEXT' }
  | { type: 'GO_BACK' }
  | { type: 'SET_SUBMITTING'; value: boolean }
  | { type: 'SET_SUBMIT_ERROR'; value: string | null }
  | { type: 'RESET' };

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const URL_PATTERN = /^https?:\/\/[^\s]+$/i;

function isEmpty(value: unknown): boolean {
  if (value === '' || value === null || value === undefined) return true;
  if (Array.isArray(value)) return value.length === 0;
  return false;
}

function validateStep(
  state: PartnerApplicationState,
): Partial<Record<string, string>> {
  const stepId = PARTNER_APPLICATION_STEP_IDS[state.stepIndex];
  const required = PARTNER_APPLICATION_STEP_REQUIRED_FIELDS[stepId];
  const errors: Partial<Record<string, string>> = {};

  for (const field of required) {
    if (isEmpty(state[field as keyof PartnerApplicationState])) {
      errors[field] = 'required';
    }
  }

  if (stepId === 'identity') {
    if (state.email && !EMAIL_PATTERN.test(state.email)) {
      errors.email = 'invalid_email';
    }
    if (state.website && !URL_PATTERN.test(state.website)) {
      errors.website = 'invalid_url';
    }
  }
  if (stepId === 'profile') {
    if (state.linkedin && !URL_PATTERN.test(state.linkedin)) {
      errors.linkedin = 'invalid_url';
    }
  }
  if (stepId === 'expertise') {
    if (state.workspaceUrl && !URL_PATTERN.test(state.workspaceUrl)) {
      errors.workspaceUrl = 'invalid_url';
    }
  }
  if (stepId === 'commercials') {
    if (state.calendarLink && !URL_PATTERN.test(state.calendarLink)) {
      errors.calendarLink = 'invalid_url';
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
    case 'TOGGLE_DEPLOYMENT': {
      const next = state.deploymentExpertise.includes(action.value)
        ? state.deploymentExpertise.filter((v) => v !== action.value)
        : [...state.deploymentExpertise, action.value];
      return {
        ...state,
        deploymentExpertise: next,
        fieldErrors: dropError(state.fieldErrors, 'deploymentExpertise'),
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
  const toggleDeployment = useCallback(
    (value: PartnerDeploymentValue) =>
      dispatch({ type: 'TOGGLE_DEPLOYMENT', value }),
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
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);

  return {
    state,
    setField,
    toggleScope,
    toggleDeployment,
    toggleLanguage,
    setSkills,
    goNext,
    goBack,
    setSubmitting,
    setSubmitError,
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
