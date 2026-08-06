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
}: AwsRequestHandlerOptions = {}) => {
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
    throwOnRequestTimeout: true,
    httpsAgent: { maxSockets },
  };
};
