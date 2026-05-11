import { useCallback, useEffect, useReducer } from 'react';
import {
  getTerminalPromptEasterEggMessage,
  INITIAL_TERMINAL_PROMPT_EASTER_EGG_STATE,
  terminalPromptEasterEggReducer,
} from '../utils/terminal-prompt-easter-egg-state';
import { TRAFFIC_LIGHTS_ESCAPE_EVENT } from '../../TerminalTrafficLights/utils/terminal-traffic-light-constants';

type UseTerminalPromptEasterEggOptions = {
  enabled: boolean;
};

export const useTerminalPromptEasterEgg = ({
  enabled,
}: UseTerminalPromptEasterEggOptions) => {
  const [state, dispatch] = useReducer(
    terminalPromptEasterEggReducer,
    INITIAL_TERMINAL_PROMPT_EASTER_EGG_STATE,
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
    easterEggMessage: enabled ? getTerminalPromptEasterEggMessage(state) : null,
    handleAnimationEnd,
    handleClick,
    isWiggling: state.isWiggling,
  };
};
