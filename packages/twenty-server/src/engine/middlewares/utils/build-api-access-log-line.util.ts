import { isNonEmptyString } from '@sniptt/guards';
import { type Request, type Response } from 'express';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { computeRequestActor } from 'src/engine/utils/compute-request-actor.util';
import { type RequestTraceContext } from 'src/engine/utils/compute-request-trace-context.util';

const MAX_LOGGED_RESOLVERS_LENGTH = 512;
const MAX_LOGGED_REQUEST_ID_LENGTH = 128;
const REQUEST_ID_PATTERN = /^[A-Za-z0-9_.:-]+$/;

export const buildApiAccessLogLine = ({
  request,
  response,
  durationMs,
  traceContext,
}: {
  request: Request;
  response: Response;
  durationMs: number;
  traceContext: RequestTraceContext | undefined;
}): string => {
  const [urlPath] = (request.originalUrl ?? '').split('?');
  const completed = response.writableEnded;

  return toLogfmt({
    method: request.method,
    url_path: urlPath,
    resolvers: formatResolvers(request.executedRootResolvers),
    status: completed ? response.statusCode : undefined,
    aborted: completed ? undefined : true,
    duration_ms: durationMs,
    ...formatActor(request),
    workspace_id: request.workspaceId,
    auth_provider: request.authProvider ?? undefined,
    token_type: request.tokenType,
    client_ip: request.ip,
    request_id: formatRequestId(request.headers?.['x-request-id']),
    trace_id: traceContext?.traceId,
    span_id: traceContext?.spanId,
    trace_sampled: traceContext?.sampled,
  });
};

const formatActor = (request: Request): Record<string, string | undefined> => {
  const actor = computeRequestActor(request);

  return isDefined(actor)
    ? { actor: actor.kind, actor_id: actor.id }
    : { actor: 'anonymous' };
};

const formatRequestId = (value: string | string[] | undefined) => {
  const requestId = Array.isArray(value) ? value[0] : value;

  return isNonEmptyString(requestId) &&
    requestId.length <= MAX_LOGGED_REQUEST_ID_LENGTH &&
    REQUEST_ID_PATTERN.test(requestId)
    ? requestId
    : undefined;
};

const formatResolvers = (resolvers: string[] | undefined) => {
  if (!isNonEmptyArray(resolvers)) {
    return undefined;
  }

  const joined = resolvers.join(',');

  if (joined.length <= MAX_LOGGED_RESOLVERS_LENGTH) {
    return joined;
  }

  const kept: string[] = [];
  let length = 0;

  for (const name of resolvers) {
    if (length + name.length + 1 > MAX_LOGGED_RESOLVERS_LENGTH) {
      break;
    }

    kept.push(name);
    length += name.length + 1;
  }

  return `${kept.join(',')},+${resolvers.length - kept.length}`;
};

const toLogfmt = (
  fields: Record<string, string | number | boolean | undefined>,
): string =>
  Object.entries(fields)
    .filter(([, value]) => isDefined(value))
    .map(([key, value]) => `${key}=${quote(String(value))}`)
    .join(' ');

const quote = (value: string): string =>
  isNonEmptyString(value) && !/[\s"=\\]/.test(value)
    ? value
    : `"${value.replace(/[\\"]/g, (character) => `\\${character}`)}"`;
