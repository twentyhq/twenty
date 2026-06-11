'use client';

import { styled } from '@linaria/react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { EASING } from '@/tokens';
import { APP_PREVIEW_STAGE } from '@/tokens/app-preview/app-preview-stage';
import { APP_PREVIEW_TONES } from '@/tokens/app-preview/app-preview-tones';

import { buildAssistantResponseSegments } from './assistant-response-segments';
import {
  assistantResponseStage,
  type AssistantResponseStage,
  type AssistantResponseStreamingStage,
} from './assistant-response-stage';
import { ChangesSummaryCard } from './changes-summary-card';
import { CONVERSATION_CORE } from './conversation-core';
import { StreamingText, type StreamingSegment } from './streaming-text';
import { ThinkingIndicator } from './thinking-indicator';
import { useTimeoutRegistry } from '../stage/use-timeout-registry';

const terminal = APP_PREVIEW_TONES.terminal;

const ResponseRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
`;

const Paragraph = styled.p`
  color: ${terminal.text.prompt};
  font-family: ${APP_PREVIEW_STAGE.terminalFont.ui};
  font-size: 13px;
  line-height: 20px;
  margin: 0;
`;

const CardWrap = styled.div<{ $instant: boolean }>`
  animation: ${({ $instant }) =>
    $instant ? 'none' : `chatCardRise 420ms ${EASING.standard} both`};

  @keyframes chatCardRise {
    from {
      opacity: 0;
      transform: translateY(6px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

export function AssistantResponse({
  instantComplete = false,
  onUndo,
  onObjectCreated,
  onChatFinished,
}: {
  instantComplete?: boolean;
  onUndo?: () => void;
  onObjectCreated?: (id: string) => void;
  onChatFinished?: () => void;
}) {
  const timeoutRegistry = useTimeoutRegistry();
  const [stage, setStage] = useState<AssistantResponseStage>(
    instantComplete ? 'done' : 'thinking',
  );
  const hasNotifiedChatFinishedRef = useRef(false);
  const onObjectCreatedRef = useRef(onObjectCreated);
  onObjectCreatedRef.current = onObjectCreated;

  useEffect(() => {
    if (instantComplete) {
      setStage('done');
      return undefined;
    }
    return timeoutRegistry.schedule(
      () => setStage('rocket'),
      CONVERSATION_CORE.timings.thinkingMs,
    );
  }, [instantComplete, timeoutRegistry]);

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
      stage === 'done' ? 0 : assistantResponseStage.delays.afterCardRevealMs,
    );
  }, [onChatFinished, stage, timeoutRegistry]);

  const createStageCompletionHandler = useCallback(
    (completedStage: AssistantResponseStreamingStage) => () => {
      const transition = assistantResponseStage.getTransition(completedStage);
      if (transition === null) {
        return;
      }
      timeoutRegistry.schedule(() => {
        setStage(transition.nextStage);
      }, transition.delayMs);
    },
    [timeoutRegistry],
  );

  const objectCreationHandler = useCallback(
    (id: string) => {
      if (instantComplete) {
        return;
      }
      onObjectCreatedRef.current?.(id);
    },
    [instantComplete],
  );

  const segmentsByStage = useMemo<
    Record<AssistantResponseStreamingStage, StreamingSegment[]>
  >(
    () =>
      buildAssistantResponseSegments(
        instantComplete ? undefined : objectCreationHandler,
      ),
    [instantComplete, objectCreationHandler],
  );

  const hasReachedStage = (targetStage: AssistantResponseStage) =>
    assistantResponseStage.hasReached({ currentStage: stage, targetStage });

  return (
    <ResponseRoot>
      {stage === 'thinking' && <ThinkingIndicator />}
      {assistantResponseStage.streamingStages.map((responseStage) =>
        hasReachedStage(responseStage) ? (
          <Paragraph key={responseStage}>
            <StreamingText
              charDurationMs={CONVERSATION_CORE.timings.textStreamCharMs}
              instant={instantComplete}
              onComplete={
                stage === responseStage
                  ? createStageCompletionHandler(responseStage)
                  : undefined
              }
              segments={segmentsByStage[responseStage]}
            />
          </Paragraph>
        ) : null,
      )}
      {hasReachedStage('card') && (
        <CardWrap $instant={instantComplete}>
          <ChangesSummaryCard onUndo={onUndo} />
        </CardWrap>
      )}
    </ResponseRoot>
  );
}
