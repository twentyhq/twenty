'use client';

import { useCallback, useReducer } from 'react';

import { type PartnerLanguageValue } from './data/partner-language-options';
import { type PartnerScopeValue } from './data/partner-scope-options';
import { type PartnerTwentyExperienceValue } from './data/partner-twenty-experience-options';
import { partnerApplicationReducer } from './partner-application-reducer';
import {
  INITIAL_PARTNER_APPLICATION_STATE,
  type ScalarFieldName,
} from './partner-application-state';

// Wraps the pure reducer with memoized action creators. The wizard consumes
// the returned controller; the reducer stays separately testable.
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
  const toggleExperience = useCallback(
    (value: PartnerTwentyExperienceValue) =>
      dispatch({ type: 'TOGGLE_EXPERIENCE', value }),
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
    toggleExperience,
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
