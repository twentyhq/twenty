'use client';

import { useCallback, useEffect, useReducer } from 'react';

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
