import { type StreamErrorPayload } from 'src/engine/metadata-modules/ai/ai-history/utils/map-error-to-stream-error.util';

export type AgentChatThreadLastStreamError = StreamErrorPayload & {
  failedAt: string;
};
