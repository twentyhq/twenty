import { type StreamErrorPayload } from 'src/engine/metadata-modules/ai/ai-history/utils/map-error-to-stream-error.util';

export const AGENT_TURN_USER_CREDITS_EXHAUSTED_ERROR: StreamErrorPayload = {
  code: 'USER_CREDITS_EXHAUSTED',
  message: 'The member ran out of AI credits.',
};
