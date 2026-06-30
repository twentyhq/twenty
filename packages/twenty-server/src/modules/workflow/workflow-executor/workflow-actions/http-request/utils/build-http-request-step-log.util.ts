import { type WorkflowRunStepLog } from 'twenty-shared/workflow';

import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';
import { type WorkflowHttpRequestActionInput } from 'src/modules/workflow/workflow-executor/workflow-actions/http-request/types/workflow-http-request-action-input.type';
import { truncateStringToUtf8ByteBudget } from 'src/utils/truncate-string-to-utf8-byte-budget.util';

const MAX_BODY_BYTES = 32_000;
const REDACTION_SENTINEL = '[redacted]';

const SENSITIVE_HEADER_NAMES = new Set([
  'authorization',
  'proxy-authorization',
  'cookie',
  'set-cookie',
  'x-api-key',
  'x-auth-token',
  'x-csrf-token',
  'x-amz-security-token',
  'x-goog-api-key',
  'api-key',
]);

const SENSITIVE_URL_PARAM_NAMES = new Set([
  'api_key',
  'apikey',
  'api-key',
  'token',
  'access_token',
  'refresh_token',
  'id_token',
  'auth',
  'auth_token',
  'authentication',
  'secret',
  'client_secret',
  'private_key',
  'key',
  'sig',
  'signature',
  'password',
  'passwd',
  'pwd',
]);

const SENSITIVE_BODY_KEY_REGEX =
  /^(password|passwd|pwd|.*_?token|.*_?secret|authorization|api[_-]?key|private[_-]?key|client[_-]?secret|x-?api-?key|x-?auth-?token|access[_-]?key)$/i;

const isSensitiveHeader = (name: string): boolean =>
  SENSITIVE_HEADER_NAMES.has(name.toLowerCase());

const isSensitiveUrlParam = (name: string): boolean =>
  SENSITIVE_URL_PARAM_NAMES.has(name.toLowerCase());

const isSensitiveBodyKey = (name: string): boolean =>
  SENSITIVE_BODY_KEY_REGEX.test(name);

const redactHeaders = (
  headers: Record<string, unknown> | undefined,
): Record<string, string> => {
  if (!headers) {
    return {};
  }

  const redacted: Record<string, string> = {};

  for (const [name, value] of Object.entries(headers)) {
    if (isSensitiveHeader(name)) {
      redacted[name] = REDACTION_SENTINEL;
      continue;
    }

    redacted[name] =
      typeof value === 'string' ? value : (JSON.stringify(value) ?? '');
  }

  return redacted;
};

const URL_QUERY_PARAM_REGEX = /([?&])([^=&#]+)=([^&#]*)/g;

const safeDecodeUriComponent = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const redactUrlQueryStringFallback = (rawUrl: string): string =>
  rawUrl.replace(URL_QUERY_PARAM_REGEX, (match, prefix, name) => {
    if (isSensitiveUrlParam(safeDecodeUriComponent(name))) {
      return `${prefix}${name}=${REDACTION_SENTINEL}`;
    }

    return match;
  });

const redactUrl = (rawUrl: string): string => {
  let parsed: URL;

  try {
    parsed = new URL(rawUrl);
  } catch {
    return redactUrlQueryStringFallback(rawUrl);
  }

  let didRedact = false;

  for (const paramName of [...parsed.searchParams.keys()]) {
    if (isSensitiveUrlParam(paramName)) {
      parsed.searchParams.set(paramName, REDACTION_SENTINEL);
      didRedact = true;
    }
  }

  return didRedact ? parsed.toString() : rawUrl;
};

const redactSensitiveBodyKeysDeep = (value: unknown): unknown => {
  if (Array.isArray(value)) {
    return value.map(redactSensitiveBodyKeysDeep);
  }

  if (value !== null && typeof value === 'object') {
    const redacted: Record<string, unknown> = {};

    for (const [key, nested] of Object.entries(value)) {
      if (isSensitiveBodyKey(key)) {
        redacted[key] = REDACTION_SENTINEL;
        continue;
      }

      redacted[key] = redactSensitiveBodyKeysDeep(nested);
    }

    return redacted;
  }

  return value;
};

const redactJsonBodyString = (body: string): string => {
  if (body.length === 0) {
    return body;
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(body);
  } catch {
    return body;
  }

  if (parsed === null || typeof parsed !== 'object') {
    return body;
  }

  const redactedTree = redactSensitiveBodyKeysDeep(parsed);

  try {
    return JSON.stringify(redactedTree);
  } catch {
    return body;
  }
};

const redactErrorValue = (error: unknown): string | undefined => {
  if (error === undefined || error === null) {
    return undefined;
  }

  if (typeof error === 'string') {
    return redactJsonBodyString(error);
  }

  try {
    return JSON.stringify(redactSensitiveBodyKeysDeep(error));
  } catch {
    return String(error);
  }
};

const stringifyBody = (body: unknown): string | undefined => {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (typeof body === 'string') {
    return body;
  }

  if (typeof body === 'object') {
    try {
      const redactedTree = redactSensitiveBodyKeysDeep(body);

      return JSON.stringify(redactedTree);
    } catch {
      return String(body);
    }
  }

  return String(body);
};

type SerializedBody = {
  body: string | undefined;
  bodyBytes: number | undefined;
  bodyTruncated: boolean;
};

const serializeBody = (body: unknown): SerializedBody => {
  const serialized = stringifyBody(body);

  if (serialized === undefined) {
    return { body: undefined, bodyBytes: undefined, bodyTruncated: false };
  }

  const redacted =
    typeof body === 'string' ? redactJsonBodyString(serialized) : serialized;

  const { value, originalBytes, truncated } = truncateStringToUtf8ByteBudget(
    redacted,
    MAX_BODY_BYTES,
  );

  return { body: value, bodyBytes: originalBytes, bodyTruncated: truncated };
};

export const buildHttpRequestStepLog = ({
  input,
  output,
  durationMs,
}: {
  input: WorkflowHttpRequestActionInput;
  output: ToolOutput;
  durationMs: number;
}): WorkflowRunStepLog => {
  const requestBody = serializeBody(input.body);
  const responseBody = serializeBody(output.result);

  const hasResponseMetadata =
    typeof output.status === 'number' ||
    (output.headers !== undefined && Object.keys(output.headers).length > 0) ||
    responseBody.body !== undefined;

  const response = hasResponseMetadata
    ? {
        status: output.status ?? 0,
        statusText: output.statusText,
        headers: redactHeaders(output.headers),
        body: responseBody.body,
        bodyBytes: responseBody.bodyBytes,
        bodyTruncated: responseBody.bodyTruncated,
      }
    : undefined;

  return {
    details: {
      type: 'HTTP_REQUEST',
      request: {
        method: input.method,
        url: redactUrl(input.url),
        headers: redactHeaders(input.headers),
        body: requestBody.body,
        bodyBytes: requestBody.bodyBytes,
        bodyTruncated: requestBody.bodyTruncated,
      },
      response,
      error: redactErrorValue(output.error),
      durationMs,
    },
    entries: [],
    sizeBytes: 0,
  };
};
