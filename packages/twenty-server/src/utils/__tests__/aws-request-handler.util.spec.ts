import {
  AWS_CONNECTION_TIMEOUT_MS,
  AWS_DEFAULT_MAX_SOCKETS,
  AWS_DEFAULT_REQUEST_TIMEOUT_MS,
  buildAwsRequestHandlerOptions,
} from 'src/utils/aws-request-handler.util';

describe('buildAwsRequestHandlerOptions', () => {
  it('always sets a non-zero request timeout', () => {
    // The SDK default is 0, which means "no timeout" and lets a stuck request
    // hold its socket forever.
    expect(buildAwsRequestHandlerOptions().requestTimeout).toBeGreaterThan(0);
  });

  it('applies the defaults when called with no arguments', () => {
    expect(buildAwsRequestHandlerOptions()).toEqual({
      connectionTimeout: AWS_CONNECTION_TIMEOUT_MS,
      requestTimeout: AWS_DEFAULT_REQUEST_TIMEOUT_MS,
      httpsAgent: { maxSockets: AWS_DEFAULT_MAX_SOCKETS },
    });
  });

  it('allows callers with long-running requests to raise the timeout', () => {
    expect(
      buildAwsRequestHandlerOptions({ requestTimeoutMs: 960_000 })
        .requestTimeout,
    ).toBe(960_000);
  });

  it('allows the socket pool size to be raised above the SDK default', () => {
    expect(
      buildAwsRequestHandlerOptions({ maxSockets: 200 }).httpsAgent.maxSockets,
    ).toBe(200);
  });
});
