import { isThrottled } from 'src/modules/connected-account/utils/is-throttled';

describe('isThrottled', () => {
  it('should not throttle when no sync stage is active', () => {
    expect(isThrottled(null, 3)).toBe(false);
  });

  it('should not throttle when there have been no failures', () => {
    expect(isThrottled(new Date().toISOString(), 0)).toBe(false);
  });

  it('should keep throttling when retryAfter is in the future even though exponential backoff has expired', () => {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const fiveMinutesFromNow = new Date(
      Date.now() + 5 * 60 * 1000,
    ).toISOString();

    expect(isThrottled(tenMinutesAgo, 1, fiveMinutesFromNow)).toBe(true);
  });

  it('should fall back to exponential backoff when retryAfter is not provided', () => {
    const justNow = new Date().toISOString();

    expect(isThrottled(justNow, 1)).toBe(true);
  });

  it('should fall back to exponential backoff when retryAfter is in the past', () => {
    const justNow = new Date().toISOString();
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    expect(isThrottled(justNow, 1, fiveMinutesAgo)).toBe(true);
  });

  it('should fall back to exponential backoff when retryAfter is explicitly null', () => {
    const justNow = new Date().toISOString();

    expect(isThrottled(justNow, 1, null)).toBe(true);
  });

  it('should fall back to exponential backoff when retryAfter is an invalid date string', () => {
    const justNow = new Date().toISOString();

    expect(isThrottled(justNow, 1, 'not-a-date')).toBe(true);
  });

  it('should use exponential backoff when both backoff is active and retryAfter is in the past', () => {
    const justNow = new Date().toISOString();
    const oneMinuteAgo = new Date(Date.now() - 60 * 1000).toISOString();

    expect(isThrottled(justNow, 1, oneMinuteAgo)).toBe(true);
  });
});
