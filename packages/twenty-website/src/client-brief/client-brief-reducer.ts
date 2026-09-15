import { CLIENT_BRIEF_STEP_IDS } from './data/client-brief-step-ids';
import {
  INITIAL_CLIENT_BRIEF_STATE,
  type ClientBriefAction,
  type ClientBriefState,
} from './client-brief-state';
import { validateClientBriefStep } from './validate-client-brief-step';

function dropError(
  errors: Partial<Record<string, string>>,
  field: string,
): Partial<Record<string, string>> {
  if (errors[field] === undefined) return errors;
  const { [field]: _dropped, ...rest } = errors;
  return rest;
}

export function clientBriefReducer(
  state: ClientBriefState,
  action: ClientBriefAction,
): ClientBriefState {
  switch (action.type) {
    case 'SET_FIELD':
      return {
        ...state,
        [action.field]: action.value,
        fieldErrors: dropError(state.fieldErrors, action.field),
      };
    case 'SET_FIELD_ERRORS':
      return { ...state, fieldErrors: action.errors };
    case 'GO_NEXT': {
      const errors = validateClientBriefStep(state);
      if (Object.keys(errors).length > 0) {
        return { ...state, fieldErrors: errors };
      }
      const lastIndex = CLIENT_BRIEF_STEP_IDS.length - 1;
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
    case 'SKIP_CONTEXT': {
      const contextIndex = CLIENT_BRIEF_STEP_IDS.indexOf('context');
      if (state.stepIndex !== contextIndex) return state;
      return {
        ...state,
        stepIndex: contextIndex + 1,
        fieldErrors: {},
      };
    }
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
      return INITIAL_CLIENT_BRIEF_STATE;
    default:
      return state;
  }
}
