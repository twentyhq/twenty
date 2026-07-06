import { AiException } from 'src/engine/metadata-modules/ai/ai.exception';
import { extractErrorMessage } from 'src/engine/metadata-modules/ai/utils/extract-error-message.util';

export const STREAM_EXECUTION_FAILED_CODE = 'STREAM_EXECUTION_FAILED';

const STREAM_ERROR_MESSAGE_MAX_LENGTH = 2000;

export type StreamErrorPayload = {
  code: string;
  message: string;
};

const truncateMessage = (message: string): string =>
  message.length > STREAM_ERROR_MESSAGE_MAX_LENGTH
    ? `${message.slice(0, STREAM_ERROR_MESSAGE_MAX_LENGTH)}…`
    : message;

export const mapErrorToStreamError = (error: unknown): StreamErrorPayload => {
  if (error instanceof AiException) {
    return { code: error.code, message: truncateMessage(error.message) };
  }

  return {
    code: STREAM_EXECUTION_FAILED_CODE,
    message: truncateMessage(
      extractErrorMessage(error, 'Stream execution failed'),
    ),
  };
};
