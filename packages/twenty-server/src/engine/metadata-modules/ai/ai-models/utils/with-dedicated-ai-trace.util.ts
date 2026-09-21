import * as Sentry from '@sentry/node';

// Sentry only runs tracesSampler on root spans, so ai.* spans reach the 100%
// sampling rule only when they start their own trace instead of inheriting an
// HTTP or GraphQL trace that head sampling already dropped.
export const withDedicatedAiTrace = <TResult>(
  callback: () => TResult,
): TResult => Sentry.startNewTrace(callback);
