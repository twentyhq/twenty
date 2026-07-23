import { NoOutputGeneratedError } from 'ai';

import {
  AiException,
  AiExceptionCode,
} from 'src/engine/metadata-modules/ai/ai.exception';

export type StreamUsageRejectionHandling = 'skip' | 'enrich' | 'passthrough';

// Abort reasons are arbitrary values, not necessarily Error instances.
const isAbortError = (error: unknown): boolean =>
  typeof error === 'object' &&
  error !== null &&
  'name' in error &&
  error.name === 'AbortError';

const isExpectedStreamInterruption = (error: unknown): boolean =>
  error instanceof AiException &&
  error.code === AiExceptionCode.STREAM_INTERRUPTED;

export const classifyStreamUsageRejection = (
  error: unknown,
): StreamUsageRejectionHandling => {
  if (isAbortError(error) || isExpectedStreamInterruption(error)) {
    return 'skip';
  }

  if (NoOutputGeneratedError.isInstance(error)) {
    return 'enrich';
  }

  return 'passthrough';
};
