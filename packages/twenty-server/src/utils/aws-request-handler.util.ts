export const AWS_DEFAULT_CONNECTION_TIMEOUT_MS = 10_000;
export const AWS_DEFAULT_REQUEST_TIMEOUT_MS = 30_000;
export const AWS_DEFAULT_MAX_SOCKETS = 100;

type AwsRequestHandlerOptions = {
  requestTimeoutMs?: number;
  connectionTimeoutMs?: number;
  maxSockets?: number;
};

export const buildAwsRequestHandlerOptions = ({
  requestTimeoutMs = AWS_DEFAULT_REQUEST_TIMEOUT_MS,
  connectionTimeoutMs = AWS_DEFAULT_CONNECTION_TIMEOUT_MS,
  maxSockets = AWS_DEFAULT_MAX_SOCKETS,
}: AwsRequestHandlerOptions = {}) => ({
  connectionTimeout: connectionTimeoutMs,
  requestTimeout: requestTimeoutMs,
  throwOnRequestTimeout: true,
  httpsAgent: { maxSockets },
});
