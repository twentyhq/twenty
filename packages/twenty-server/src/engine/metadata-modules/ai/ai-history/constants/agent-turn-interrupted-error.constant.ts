import { AiExceptionCode } from 'src/engine/metadata-modules/ai/ai.exception';
import { type StreamErrorPayload } from 'src/engine/metadata-modules/ai/ai-history/utils/map-error-to-stream-error.util';

export const AGENT_TURN_INTERRUPTED_ERROR: StreamErrorPayload = {
  code: AiExceptionCode.STREAM_INTERRUPTED,
  message: 'The response was interrupted before it could finish.',
};
