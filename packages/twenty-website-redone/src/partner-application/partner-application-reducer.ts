import { PARTNER_APPLICATION_STEP_IDS } from './data/partner-application-step-ids';
import {
  INITIAL_PARTNER_APPLICATION_STATE,
  type PartnerApplicationAction,
  type PartnerApplicationState,
} from './partner-application-state';
import { validatePartnerApplicationStep } from './validate-partner-application-step';

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
      const errors = validatePartnerApplicationStep(state);
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
