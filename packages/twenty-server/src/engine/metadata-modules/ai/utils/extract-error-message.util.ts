import { isNonEmptyString, isObject } from '@sniptt/guards';

// Provider SDKs (e.g. @ai-sdk/openai) emit stream error parts whose payload is
// the raw API error object — `{ message, type, code }` or nested under an
// `error` key — not an Error instance. Naive String() turns those into
// "[object Object]" and hides the real cause (e.g. an invalid API key).
const SERIALIZED_ERROR_MAX_LENGTH = 2000;

const extractMessageFromErrorObject = (
  errorObject: Record<string, unknown>,
): string | null => {
  const nestedError = errorObject.error;

  if (isObject(nestedError)) {
    const nestedMessage = extractMessageFromErrorObject(
      nestedError as Record<string, unknown>,
    );

    if (nestedMessage !== null) {
      return nestedMessage;
    }
  }

  if (!isNonEmptyString(errorObject.message)) {
    return null;
  }

  const errorDetails = [errorObject.code, errorObject.statusCode].filter(
    (detail): detail is string | number =>
      isNonEmptyString(detail) || typeof detail === 'number',
  );

  return errorDetails.length > 0
    ? `${errorObject.message} (${errorDetails.join(', ')})`
    : errorObject.message;
};

const safeJsonStringify = (value: unknown): string | null => {
  try {
    const serialized = JSON.stringify(value);

    return isNonEmptyString(serialized) && serialized !== '{}'
      ? serialized
      : null;
  } catch {
    return null;
  }
};

export const extractErrorMessage = (
  error: unknown,
  fallbackMessage = 'Unknown error',
): string => {
  if (error instanceof Error) {
    return isNonEmptyString(error.message) ? error.message : error.name;
  }

  if (isNonEmptyString(error)) {
    return error;
  }

  if (typeof error === 'number' || typeof error === 'boolean') {
    return String(error);
  }

  if (isObject(error)) {
    const extractedMessage = extractMessageFromErrorObject(
      error as Record<string, unknown>,
    );

    if (extractedMessage !== null) {
      return extractedMessage;
    }

    const serialized = safeJsonStringify(error);

    if (serialized !== null) {
      return serialized.length > SERIALIZED_ERROR_MAX_LENGTH
        ? `${serialized.slice(0, SERIALIZED_ERROR_MAX_LENGTH)}…`
        : serialized;
    }
  }

  return fallbackMessage;
};
