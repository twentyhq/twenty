import { type AiSdkPackage } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

// Distinctive name so Sentry groups zero-output captures separately from the
// raw provider errors reported by the message-queue explorer.
export class AiChatZeroOutputError extends Error {
  cause?: unknown;

  constructor(message: string, options?: { cause?: unknown }) {
    super(message);
    this.name = 'AiChatZeroOutputError';
    this.cause = options?.cause;
  }
}

export type AiChatZeroOutputErrorContext = {
  modelId: string;
  sdkPackage: AiSdkPackage;
  workspaceId: string;
  threadId?: string;
  streamId?: string;
  turnId?: string;
  messageCount: number;
  conversationSizeTokens: number;
  elapsedMs: number;
  underlyingError?: unknown;
};

const describeUnderlyingError = (underlyingError: unknown): string => {
  if (!isDefined(underlyingError)) {
    return 'none-recorded';
  }

  if (underlyingError instanceof Error) {
    return `${underlyingError.name}: ${underlyingError.message}`;
  }

  return String(underlyingError);
};

export const buildAiChatZeroOutputError = ({
  modelId,
  sdkPackage,
  workspaceId,
  threadId,
  streamId,
  turnId,
  messageCount,
  conversationSizeTokens,
  elapsedMs,
  underlyingError,
}: AiChatZeroOutputErrorContext): AiChatZeroOutputError => {
  const messageParts = [
    `model=${modelId}`,
    `provider=${sdkPackage}`,
    `workspace=${workspaceId}`,
    isDefined(threadId) ? `thread=${threadId}` : undefined,
    isDefined(streamId) ? `stream=${streamId}` : undefined,
    isDefined(turnId) ? `turn=${turnId}` : undefined,
    `messages=${messageCount}`,
    `conversationSizeTokens=${conversationSizeTokens}`,
    `elapsedMs=${Math.round(elapsedMs)}`,
    `underlying=${describeUnderlyingError(underlyingError)}`,
  ].filter(isDefined);

  return new AiChatZeroOutputError(
    `AI chat stream produced no output - ${messageParts.join(' ')}`,
    isDefined(underlyingError) ? { cause: underlyingError } : undefined,
  );
};
