export const LOGIC_FUNCTION_HTTP_RESPONSE_MARKER = '__twentyHttpResponse';

export type LogicFunctionHttpResponse = {
  __twentyHttpResponse: true;
  body: unknown;
  status?: number;
  headers?: Record<string, string>;
};

const isValidHttpStatusCode = (value: unknown): value is number =>
  typeof value === 'number' &&
  Number.isInteger(value) &&
  value >= 100 &&
  value <= 599;

const isStringRecord = (value: unknown): value is Record<string, string> =>
  typeof value === 'object' &&
  value !== null &&
  !Array.isArray(value) &&
  Object.values(value).every((entry) => typeof entry === 'string');

export const isLogicFunctionHttpResponse = (
  value: unknown,
): value is LogicFunctionHttpResponse => {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    candidate[LOGIC_FUNCTION_HTTP_RESPONSE_MARKER] === true &&
    (candidate.status === undefined ||
      isValidHttpStatusCode(candidate.status)) &&
    (candidate.headers === undefined || isStringRecord(candidate.headers))
  );
};
