import { type StreamErrorPayload } from 'src/engine/metadata-modules/ai/ai-chat/utils/map-error-to-stream-error.util';

export type AgentChatThreadLastStreamError = StreamErrorPayload & {
  failedAt: string;
};
