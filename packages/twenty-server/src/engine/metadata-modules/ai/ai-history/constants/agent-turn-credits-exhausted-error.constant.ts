import { type StreamErrorPayload } from 'src/engine/metadata-modules/ai/ai-chat/utils/map-error-to-stream-error.util';

export const AGENT_TURN_CREDITS_EXHAUSTED_ERROR: StreamErrorPayload = {
  code: 'CREDITS_EXHAUSTED',
  message: 'The workspace ran out of credits.',
};
