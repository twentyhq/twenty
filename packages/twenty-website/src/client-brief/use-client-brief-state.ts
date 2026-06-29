'use client';

import { useCallback, useReducer } from 'react';

import { clientBriefReducer } from './client-brief-reducer';
import {
  INITIAL_CLIENT_BRIEF_STATE,
  type ScalarFieldName,
} from './client-brief-state';

export function useClientBriefState() {
  const [state, dispatch] = useReducer(
    clientBriefReducer,
    INITIAL_CLIENT_BRIEF_STATE,
  );

  const setField = useCallback(
    (field: ScalarFieldName, value: string) =>
      dispatch({ type: 'SET_FIELD', field, value }),
    [],
  );
  const goNext = useCallback(() => dispatch({ type: 'GO_NEXT' }), []);
  const goBack = useCallback(() => dispatch({ type: 'GO_BACK' }), []);
  const skipContext = useCallback(() => dispatch({ type: 'SKIP_CONTEXT' }), []);
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
    goNext,
    goBack,
    skipContext,
    setSubmitting,
    setSubmitError,
    setSubmitted,
    reset,
  };
}

export type ClientBriefController = ReturnType<typeof useClientBriefState>;
