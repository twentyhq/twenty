import * as Sentry from '@sentry/node';
import { isDefined } from 'twenty-shared/utils';

export type RequestTraceContext = {
  traceId: string;
  spanId: string;
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

  if (traceId === INVALID_TRACE_ID || spanId === INVALID_SPAN_ID) {
    return undefined;
  }

  return { traceId, spanId, sampled: (traceFlags & 1) === 1 };
};
