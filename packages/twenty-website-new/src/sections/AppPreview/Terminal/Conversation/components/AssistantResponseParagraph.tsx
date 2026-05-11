import { styled } from '@linaria/react';

import { TERMINAL_TOKENS } from '../../utils/terminal-tokens';
import {
  type AssistantResponseStage,
  type AssistantResponseStreamingStage,
} from '../utils/assistant-response-stage';
import { CHAT_TIMINGS } from '../utils/animation-timing';
import { StreamingText } from './StreamingText';
import type { StreamingSegment } from '../types/streaming-text-types';

const Paragraph = styled.p`
  color: ${TERMINAL_TOKENS.text.prompt};
  font-family: ${TERMINAL_TOKENS.font.ui};
  font-size: 13px;
  line-height: 20px;
  margin: 0;
`;

type AssistantResponseParagraphProps = {
  activeStage: AssistantResponseStage;
  instant: boolean;
  onStageComplete: (stage: AssistantResponseStreamingStage) => () => void;
  segments: StreamingSegment[];
  stage: AssistantResponseStreamingStage;
};

export const AssistantResponseParagraph = ({
  activeStage,
  instant,
  onStageComplete,
  segments,
  stage,
}: AssistantResponseParagraphProps) => (
  <Paragraph>
    <StreamingText
      charDurationMs={CHAT_TIMINGS.textStreamCharMs}
      instant={instant}
      onComplete={activeStage === stage ? onStageComplete(stage) : undefined}
      segments={segments}
    />
  </Paragraph>
);
