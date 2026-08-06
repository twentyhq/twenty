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
 * Giving every client an explicit request timeout turns that failure mode into
 * an ordinary error the caller can catch and retry.
 */

export const AWS_CONNECTION_TIMEOUT_MS = 5_000;
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
  maxSockets?: number;
};

export const buildAwsRequestHandlerOptions = ({
  requestTimeoutMs = AWS_DEFAULT_REQUEST_TIMEOUT_MS,
  maxSockets = AWS_DEFAULT_MAX_SOCKETS,
}: AwsRequestHandlerOptions = {}) => ({
  connectionTimeout: AWS_CONNECTION_TIMEOUT_MS,
  requestTimeout: requestTimeoutMs,
  httpsAgent: { maxSockets },
});
