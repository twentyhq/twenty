import {
  AWS_DEFAULT_CONNECTION_TIMEOUT_MS,
  AWS_DEFAULT_MAX_SOCKETS,
  AWS_DEFAULT_REQUEST_TIMEOUT_MS,
  buildAwsRequestHandlerOptions,
} from 'src/utils/aws-request-handler.util';

describe('buildAwsRequestHandlerOptions', () => {
  it('always sets a non-zero request timeout', () => {
    expect(buildAwsRequestHandlerOptions().requestTimeout).toBeGreaterThan(0);
  });

  it('always throws on request timeout rather than only warning', () => {
    expect(buildAwsRequestHandlerOptions().throwOnRequestTimeout).toBe(true);
  });

  it('always sets a non-zero connection timeout', () => {
    expect(buildAwsRequestHandlerOptions().connectionTimeout).toBeGreaterThan(
      0,
    );
  });

  it('applies the defaults when called with no arguments', () => {
    expect(buildAwsRequestHandlerOptions()).toEqual({
      connectionTimeout: AWS_DEFAULT_CONNECTION_TIMEOUT_MS,
      requestTimeout: AWS_DEFAULT_REQUEST_TIMEOUT_MS,
      throwOnRequestTimeout: true,
      httpsAgent: { maxSockets: AWS_DEFAULT_MAX_SOCKETS },
    });
  });

  it('allows callers with long-running requests to raise the timeouts', () => {
    const options = buildAwsRequestHandlerOptions({
      requestTimeoutMs: 960_000,
      connectionTimeoutMs: 60_000,
    });

    expect(options.requestTimeout).toBe(960_000);
    expect(options.connectionTimeout).toBe(60_000);
  });

  it.each([0, -1])(
    'rejects a non-positive requestTimeoutMs (%p)',
    (requestTimeoutMs) => {
      expect(() => buildAwsRequestHandlerOptions({ requestTimeoutMs })).toThrow(
        /requestTimeoutMs must be greater than 0/,
      );
    },
  );

  it.each([0, -1])(
    'rejects a non-positive connectionTimeoutMs (%p)',
    (connectionTimeoutMs) => {
      expect(() =>
        buildAwsRequestHandlerOptions({ connectionTimeoutMs }),
      ).toThrow(/connectionTimeoutMs must be greater than 0/);
    },
  );

  it('allows the socket pool size to be raised above the SDK default', () => {
    expect(
      buildAwsRequestHandlerOptions({ maxSockets: 500 }).httpsAgent.maxSockets,
    ).toBe(500);
  });
});
