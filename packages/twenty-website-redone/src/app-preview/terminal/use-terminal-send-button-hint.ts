'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { createAnimationFrameLoop } from '@/platform/motion';

import { useTimeoutRegistry } from '../stage/use-timeout-registry';
import {
  getTerminalSendButtonHintPosition,
  type TerminalSendButtonHintPosition,
} from './terminal-send-button-hint-position';

const HINT_READY_DELAY_MS = 400;
// The hint earns its entrance: the terminal must be on screen and
// untouched for this long. Anyone already interacting never sees it.
const HINT_IDLE_DELAY_MS = 8000;
const HINT_SHOWN_SESSION_KEY = 'twenty-terminal-finger-hint-shown';
const TERMINAL_SHELL_SELECTOR = '[data-terminal-shell="true"]';

const readHintAlreadyShown = (): boolean => {
  try {
    return sessionStorage.getItem(HINT_SHOWN_SESSION_KEY) === 'true';
  } catch {
    return true;
  }
};

const markHintShown = () => {
  try {
    sessionStorage.setItem(HINT_SHOWN_SESSION_KEY, 'true');
  } catch {
    // Private mode: the in-memory dismissal still holds for this mount.
  }
};

export const useTerminalSendButtonHint = ({
  disabled,
  isReset,
}: {
  disabled?: boolean;
  isReset: boolean;
}) => {
  const [hintDismissed, setHintDismissed] = useState(false);
  const [hintArmed, setHintArmed] = useState(false);
  const [hintPosition, setHintPosition] =
    useState<TerminalSendButtonHintPosition | null>(null);
  const [hintReady, setHintReady] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRegistry = useTimeoutRegistry();
  const dismissHint = useCallback(() => setHintDismissed(true), []);
  const isEligible = !hintDismissed && !isReset && disabled !== true;
  const showHint = isEligible && hintArmed;

  // Arming: once per session, after the terminal is on screen and idle.
  useEffect(() => {
    if (!isEligible || hintArmed) {
      return undefined;
    }

    if (readHintAlreadyShown()) {
      setHintDismissed(true);
      return undefined;
    }

    const shell = buttonRef.current?.closest(TERMINAL_SHELL_SELECTOR);

    if (!shell) {
      return undefined;
    }

    let cancelIdleTimer: (() => void) | null = null;

    const observer = new IntersectionObserver(
      (entries) => {
        const isOnScreen = entries.some((entry) => entry.isIntersecting);

        if (isOnScreen && cancelIdleTimer === null) {
          cancelIdleTimer = timeoutRegistry.schedule(() => {
            markHintShown();
            setHintArmed(true);
          }, HINT_IDLE_DELAY_MS);
          return;
        }
        if (!isOnScreen && cancelIdleTimer !== null) {
          cancelIdleTimer();
          cancelIdleTimer = null;
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(shell);

    const handleTerminalTouch = (event: PointerEvent) => {
      if (!(event.target instanceof Node) || !shell.contains(event.target)) {
        return;
      }

      // They found the terminal on their own — no hint, ever.
      markHintShown();
      setHintDismissed(true);
    };

    window.addEventListener('pointerdown', handleTerminalTouch, true);

    return () => {
      observer.disconnect();
      cancelIdleTimer?.();
      window.removeEventListener('pointerdown', handleTerminalTouch, true);
    };
  }, [hintArmed, isEligible, timeoutRegistry]);

  // Positioning + dismissal while visible (ported old machinery).
  useLayoutEffect(() => {
    if (!showHint) {
      setHintPosition(null);
      setHintReady(false);

      return;
    }

    let lastLeft = Number.NaN;
    let lastTop = Number.NaN;
    const cancelReadyTimer = timeoutRegistry.schedule(
      () => setHintReady(true),
      HINT_READY_DELAY_MS,
    );

    const positionLoop = createAnimationFrameLoop({
      onFrame: () => {
        if (document.hidden) {
          return false;
        }

        const button = buttonRef.current;

        if (button !== null) {
          const rect = button.getBoundingClientRect();

          if (rect.width > 0) {
            const nextPosition = getTerminalSendButtonHintPosition({
              bottom: rect.bottom,
              right: rect.right,
            });

            if (
              nextPosition.left !== lastLeft ||
              nextPosition.top !== lastTop
            ) {
              lastLeft = nextPosition.left;
              lastTop = nextPosition.top;
              setHintPosition(nextPosition);
            }
          }
        }

        return true;
      },
    });

    const startPositionLoop = () => {
      if (!document.hidden) {
        positionLoop.start();
      }
    };

    const handleVisibility = () => {
      if (document.hidden) {
        positionLoop.stop();

        return;
      }

      startPositionLoop();
    };

    const handleTerminalInteraction = (event: PointerEvent) => {
      const button = buttonRef.current;
      const terminalShell = button?.closest(TERMINAL_SHELL_SELECTOR);

      if (terminalShell === null || terminalShell === undefined) {
        return;
      }

      if (!(event.target instanceof Node)) {
        return;
      }

      if (terminalShell.contains(event.target)) {
        setHintDismissed(true);
      }
    };

    startPositionLoop();
    document.addEventListener('visibilitychange', handleVisibility);
    window.addEventListener('pointerdown', handleTerminalInteraction, true);

    return () => {
      positionLoop.stop();
      cancelReadyTimer();
      document.removeEventListener('visibilitychange', handleVisibility);
      window.removeEventListener(
        'pointerdown',
        handleTerminalInteraction,
        true,
      );
    };
  }, [showHint, timeoutRegistry]);

  return {
    buttonRef,
    dismissHint,
    hintPosition,
    hintReady,
    showHint,
  };
};
