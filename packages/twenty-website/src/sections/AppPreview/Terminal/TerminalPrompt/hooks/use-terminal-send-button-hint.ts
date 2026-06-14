import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { createAnimationFrameLoop } from '@/lib/animation';
import { useTimeoutRegistry } from '@/lib/react';
import { getTerminalSendButtonHintPosition } from '../utils/terminal-send-button-hint-position';
import type { TerminalSendButtonHintPosition } from '../types/terminal-send-button-hint-position-types';

const HINT_READY_DELAY = 400;
const TERMINAL_SHELL_SELECTOR = '[data-terminal-shell="true"]';

type UseTerminalSendButtonHintOptions = {
  disabled?: boolean;
  isReset: boolean;
};

export const useTerminalSendButtonHint = ({
  disabled,
  isReset,
}: UseTerminalSendButtonHintOptions) => {
  const [hintDismissed, setHintDismissed] = useState(false);
  const [hintPosition, setHintPosition] =
    useState<TerminalSendButtonHintPosition | null>(null);
  const [hintReady, setHintReady] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timeoutRegistry = useTimeoutRegistry();
  const dismissHint = useCallback(() => setHintDismissed(true), []);
  const showHint = !hintDismissed && !isReset && disabled !== true;

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
      HINT_READY_DELAY,
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
