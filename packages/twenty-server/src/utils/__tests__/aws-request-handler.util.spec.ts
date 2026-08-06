import {
  AWS_DEFAULT_CONNECTION_TIMEOUT_MS,
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

  it('always throws on request timeout rather than only warning', () => {
    // Without this, a breached requestTimeout is merely logged and the request
    // keeps running, so the socket is never returned to the pool — the timeout
    // would be cosmetic.
    expect(buildAwsRequestHandlerOptions().throwOnRequestTimeout).toBe(true);
  });

  it('always sets a non-zero connection timeout', () => {
    // This also bounds how long a call waits for a free socket, so leaving it
    // at the SDK default of 0 would let a saturated pool queue forever.
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

  it('allows the socket pool size to be raised above the SDK default', () => {
    expect(
      buildAwsRequestHandlerOptions({ maxSockets: 500 }).httpsAgent.maxSockets,
    ).toBe(500);
  });
});
