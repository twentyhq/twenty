/**
 * Shared HTTP settings for AWS SDK v3 clients.
 *
 * The SDK ships with `requestTimeout` defaulting to 0, which means "no timeout"
 * (see `DEFAULT_REQUEST_TIMEOUT` in @smithy/node-http-handler). A request that
 * never completes therefore holds its socket forever. Once that happens to
 * `maxSockets` requests, the client's connection pool is permanently exhausted
 * and every subsequent call on that process queues indefinitely instead of
 * failing — which is indistinguishable from a hang to the caller.
 *
 * Two settings matter here and both are easy to get wrong:
 *
 * - `throwOnRequestTimeout` must be true. On its own `requestTimeout` only logs
 *   a warning and leaves the request running, so the socket is never returned
 *   to the pool. Only the throwing variant destroys the request.
 *
 * - `connectionTimeout` bounds the time spent *waiting for a socket*, not just
 *   the TCP handshake: its timer starts when the request is created and is
 *   cleared when a socket is assigned. A request queued behind a saturated pool
 *   is therefore killed by this timeout, so it must be generous enough to
 *   absorb a legitimate burst of concurrent calls.
 */

export const AWS_DEFAULT_CONNECTION_TIMEOUT_MS = 10_000;
export const AWS_DEFAULT_REQUEST_TIMEOUT_MS = 30_000;
export const AWS_DEFAULT_MAX_SOCKETS = 100;

type AwsRequestHandlerOptions = {
  /**
   * Upper bound for a single request. Must exceed the longest legitimate
   * response time for the calls made through this client — a synchronous
   * Lambda invocation, for instance, can run for as long as the function's
   * own timeout allows.
   */
  requestTimeoutMs?: number;
  /**
   * Upper bound for acquiring a socket and connecting. Raise it for clients
   * whose callers burst above `maxSockets`, since queued requests are killed
   * by this timeout rather than by `requestTimeout`.
   */
  connectionTimeoutMs?: number;
  maxSockets?: number;
};

export const buildAwsRequestHandlerOptions = ({
  requestTimeoutMs = AWS_DEFAULT_REQUEST_TIMEOUT_MS,
  connectionTimeoutMs = AWS_DEFAULT_CONNECTION_TIMEOUT_MS,
  maxSockets = AWS_DEFAULT_MAX_SOCKETS,
}: AwsRequestHandlerOptions = {}) => {
  // A non-positive timeout is how the SDK spells "wait forever", so accepting
  // one here would quietly reintroduce the failure this helper exists to
  // prevent. Fail loudly at construction instead.
  if (requestTimeoutMs <= 0) {
    throw new Error(
      `buildAwsRequestHandlerOptions: requestTimeoutMs must be greater than 0, received ${requestTimeoutMs}.`,
    );
  }

  if (connectionTimeoutMs <= 0) {
    throw new Error(
      `buildAwsRequestHandlerOptions: connectionTimeoutMs must be greater than 0, received ${connectionTimeoutMs}.`,
    );
  }

  return {
    connectionTimeout: connectionTimeoutMs,
    requestTimeout: requestTimeoutMs,
    // Without this, a breached requestTimeout is only logged and the socket
    // stays checked out — the exact failure this helper exists to prevent.
    throwOnRequestTimeout: true,
    httpsAgent: { maxSockets },
  };
};
