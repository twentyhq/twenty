'use client';

import { useCallback, useEffect, useReducer } from 'react';

import { TRAFFIC_LIGHTS_ESCAPE_EVENT } from '../stage/traffic-lights-escape-event';
import { promptEasterEgg } from './prompt-easter-egg-state';

export const useTerminalPromptEasterEgg = ({
  enabled,
}: {
  enabled: boolean;
}) => {
  const [state, dispatch] = useReducer(
    promptEasterEgg.reduce,
    promptEasterEgg.initialState,
  );

  useEffect(() => {
    if (!enabled) {
      dispatch({ type: 'reset' });
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled || state.escapeEventCount === 0) {
      return;
    }

    window.dispatchEvent(new CustomEvent(TRAFFIC_LIGHTS_ESCAPE_EVENT));
  }, [enabled, state.escapeEventCount]);

  const handleClick = useCallback(() => {
    if (!enabled) {
      return;
    }

    dispatch({ type: 'advance' });
  }, [enabled]);

  const handleAnimationEnd = useCallback(() => {
    dispatch({ type: 'stop-wiggle' });
  }, []);

  return {
    easterEggMessage: enabled ? promptEasterEgg.getMessage(state) : null,
    handleAnimationEnd,
    handleClick,
    isWiggling: state.isWiggling,
  };
};
