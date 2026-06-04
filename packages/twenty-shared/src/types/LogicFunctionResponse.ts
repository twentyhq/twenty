export const LOGIC_FUNCTION_HTTP_RESPONSE_MARKER = '__twentyHttpResponse';

export type LogicFunctionHttpResponse = {
  __twentyHttpResponse: true;
  body: unknown;
  status?: number;
  headers?: Record<string, string>;
};

export const isLogicFunctionHttpResponse = (
  value: unknown,
): value is LogicFunctionHttpResponse =>
  typeof value === 'object' &&
  value !== null &&
  (value as Record<string, unknown>)[LOGIC_FUNCTION_HTTP_RESPONSE_MARKER] ===
    true;
