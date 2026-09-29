import { AISDKError, APICallError, RetryError } from 'ai';
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

  return [
    'ai-chat-stream-failure',
    provider,
    failure instanceof Error ? failure.name : typeof failure,
    APICallError.isInstance(failure) && isDefined(failure.statusCode)
      ? String(failure.statusCode)
      : 'no-status',
  ];
};
