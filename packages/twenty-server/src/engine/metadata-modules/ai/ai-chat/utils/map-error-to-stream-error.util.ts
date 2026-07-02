import { AiException } from 'src/engine/metadata-modules/ai/ai.exception';

export const STREAM_EXECUTION_FAILED_CODE = 'STREAM_EXECUTION_FAILED';

export type StreamErrorPayload = {
  code: string;
  message: string;
};

export const mapErrorToStreamError = (error: unknown): StreamErrorPayload => {
  if (error instanceof AiException) {
    return { code: error.code, message: error.message };
  }

  return {
    code: STREAM_EXECUTION_FAILED_CODE,
    message: error instanceof Error ? error.message : 'Stream execution failed',
  };
};
