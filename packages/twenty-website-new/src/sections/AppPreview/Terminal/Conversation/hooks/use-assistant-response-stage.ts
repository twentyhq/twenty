import { useCallback, useEffect, useRef, useState } from 'react';

import { useTimeoutRegistry } from '@/lib/react';

import { CHAT_TIMINGS } from '../utils/animation-timing';
import {
  ASSISTANT_RESPONSE_STAGE_DELAYS,
  getAssistantResponseStageTransition,
  hasAssistantResponseStageReached,
  type AssistantResponseStage,
} from '../utils/assistant-response-stage';

type UseAssistantResponseStageOptions = {
  instantComplete: boolean;
  onChatFinished?: () => void;
};

export const useAssistantResponseStage = ({
  instantComplete,
  onChatFinished,
}: UseAssistantResponseStageOptions) => {
  const timeoutRegistry = useTimeoutRegistry();
  const [stage, setStage] = useState<AssistantResponseStage>(
    instantComplete ? 'done' : 'thinking',
  );
  const hasNotifiedChatFinishedRef = useRef(false);

  useEffect(() => {
    if (instantComplete) {
      return undefined;
    }

    return timeoutRegistry.schedule(
      () => setStage('rocket'),
      CHAT_TIMINGS.thinkingMs,
    );
  }, [instantComplete, timeoutRegistry]);

  useEffect(() => {
    if (!instantComplete) {
      return;
    }

    setStage('done');
  }, [instantComplete]);

  useEffect(() => {
    if (
      (stage !== 'card' && stage !== 'done') ||
      hasNotifiedChatFinishedRef.current
    ) {
      return undefined;
    }

    hasNotifiedChatFinishedRef.current = true;

    return timeoutRegistry.schedule(
      () => {
        onChatFinished?.();
      },
      stage === 'done' ? 0 : ASSISTANT_RESPONSE_STAGE_DELAYS.afterCardRevealMs,
    );
  }, [onChatFinished, stage, timeoutRegistry]);

  const createStageCompletionHandler = useCallback(
    (completedStage: AssistantResponseStage) => () => {
      const transition = getAssistantResponseStageTransition(completedStage);

      if (transition === null) {
        return;
      }

      timeoutRegistry.schedule(() => {
        setStage(transition.nextStage);
      }, transition.delayMs);
    },
    [timeoutRegistry],
  );

  const hasReachedStage = useCallback(
    (targetStage: AssistantResponseStage) =>
      hasAssistantResponseStageReached({
        currentStage: stage,
        targetStage,
      }),
    [stage],
  );

  return {
    createStageCompletionHandler,
    hasReachedStage,
    stage,
  };
};
