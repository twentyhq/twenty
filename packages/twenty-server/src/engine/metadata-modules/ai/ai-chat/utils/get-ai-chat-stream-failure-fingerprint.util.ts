import { AISDKError, APICallError, RetryError, StreamProviderError } from 'ai';
import { isDefined } from 'twenty-shared/utils';

export const getAiChatStreamFailureFingerprint = ({
  error,
  modelId,
}: {
  error: unknown;
  modelId: string;
}): string[] | undefined => {
  const failure = RetryError.isInstance(error) ? error.lastError : error;

  if (failure instanceof Error && !AISDKError.isInstance(failure)) {
    return undefined;
  }

  const [provider] = modelId.split('/');
  const statusCode =
    APICallError.isInstance(failure) || StreamProviderError.isInstance(failure)
      ? failure.statusCode
      : undefined;

  return [
    'ai-chat-stream-failure',
    provider,
    failure instanceof Error ? failure.name : typeof failure,
    isDefined(statusCode) ? String(statusCode) : 'no-status',
  ];
};
