import * as Sentry from '@sentry/node';
import { isDefined } from 'twenty-shared/utils';

export type RequestTraceContext = {
  traceId: string;
  spanId: string;
  // Says whether the trace was kept: the ids are stamped on every request, but
  // an unsampled one has no trace to open on the Sentry side.
  sampled: boolean;
};

export const computeRequestTraceContext = ():
  | RequestTraceContext
  | undefined => {
  const span = Sentry.getActiveSpan();

  if (!isDefined(span)) {
    return undefined;
  }

  const { traceId, spanId, traceFlags } = span.spanContext();

  return { traceId, spanId, sampled: (traceFlags & 1) === 1 };
};
