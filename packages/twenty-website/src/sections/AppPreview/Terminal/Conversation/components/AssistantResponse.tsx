'use client';

import { styled } from '@linaria/react';
import { useMemo } from 'react';

import { ASSISTANT_RESPONSE_STREAMING_STAGES } from '../utils/assistant-response-streaming-stages';
import { buildAssistantResponseSegments } from './AssistantResponseSegments';
import { AssistantResponseParagraph } from './AssistantResponseParagraph';
import { ChangesSummaryCard } from './ChangesSummaryCard';
import { ThinkingIndicator } from './ThinkingIndicator';
import { useAssistantResponseStage } from '../hooks/use-assistant-response-stage';

const ResponseRoot = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
`;

const CardWrap = styled.div<{ $instant: boolean }>`
  animation: ${({ $instant }) =>
    $instant
      ? 'none'
      : 'chatCardRise 420ms cubic-bezier(0.22, 1, 0.36, 1) both'};

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

type AssistantResponseProps = {
  instantComplete?: boolean;
  onUndo?: () => void;
  onObjectCreated?: (id: string) => void;
  onChatFinished?: () => void;
};

export const AssistantResponse = ({
  instantComplete = false,
  onUndo,
  onObjectCreated,
  onChatFinished,
}: AssistantResponseProps) => {
  const { createStageCompletionHandler, hasReachedStage, stage } =
    useAssistantResponseStage({
      instantComplete,
      onChatFinished,
    });
  const objectCreationHandler = instantComplete ? undefined : onObjectCreated;

  const segmentsByStage = useMemo(
    () => buildAssistantResponseSegments(objectCreationHandler),
    [objectCreationHandler],
  );

  return (
    <ResponseRoot>
      {stage === 'thinking' && <ThinkingIndicator />}

      {ASSISTANT_RESPONSE_STREAMING_STAGES.map((responseStage) =>
        hasReachedStage(responseStage) ? (
          <AssistantResponseParagraph
            key={responseStage}
            activeStage={stage}
            instant={instantComplete}
            onStageComplete={createStageCompletionHandler}
            segments={segmentsByStage[responseStage]}
            stage={responseStage}
          />
        ) : null,
      )}

      {hasReachedStage('card') && (
        <CardWrap $instant={instantComplete}>
          <ChangesSummaryCard onUndo={onUndo} />
        </CardWrap>
      )}
    </ResponseRoot>
  );
};
