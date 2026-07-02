import { APICallError, RetryError } from 'ai';

import { AiException } from 'src/engine/metadata-modules/ai/ai.exception';

const TRANSIENT_NETWORK_ERROR_PATTERN =
  /ECONNRESET|ECONNREFUSED|ETIMEDOUT|EPIPE|EAI_AGAIN|socket hang up|fetch failed|terminated|other side closed/i;

// Permanent failures (missing API key, invalid model, billing, validation)
// must surface immediately; only provider/network hiccups that a fresh
// attempt can plausibly resolve qualify as transient.
export const isTransientStreamError = (error: unknown): boolean => {
  if (error instanceof AiException) {
    return false;
  }

  if (APICallError.isInstance(error)) {
    return error.isRetryable;
  }

  if (RetryError.isInstance(error)) {
    return error.reason === 'maxRetriesExceeded';
  }

  if (error instanceof Error) {
    if (TRANSIENT_NETWORK_ERROR_PATTERN.test(error.message)) {
      return true;
    }

    const cause = (error as Error & { cause?: unknown }).cause;

    if (
      cause instanceof Error &&
      TRANSIENT_NETWORK_ERROR_PATTERN.test(cause.message)
    ) {
      return true;
    }
  }

  return false;
};
