import * as Sentry from '@sentry/node';
import { isDefined } from 'twenty-shared/utils';

export type RequestTraceContext = {
  traceId: string;
  spanId: string;
  // Says whether the trace was kept: the ids are stamped on every request, but
  // an unsampled one has no trace to open on the Sentry side.
  sampled: boolean;
};

const INVALID_TRACE_ID = '0'.repeat(32);
const INVALID_SPAN_ID = '0'.repeat(16);

export const computeRequestTraceContext = ():
  | RequestTraceContext
  | undefined => {
  const span = Sentry.getActiveSpan();

  if (!isDefined(span)) {
    return undefined;
  }

  const { traceId, spanId, traceFlags } = span.spanContext();

  // A non recording span carries the all zero context, which would link nowhere
  // and pollute every query filtering on a trace id.
  if (traceId === INVALID_TRACE_ID || spanId === INVALID_SPAN_ID) {
    return undefined;
  }

  return { traceId, spanId, sampled: (traceFlags & 1) === 1 };
};
