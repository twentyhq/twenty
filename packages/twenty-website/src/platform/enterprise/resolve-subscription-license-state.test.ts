import { resolveSubscriptionLicenseState } from './resolve-subscription-license-state';

const SECONDS_PER_DAY = 24 * 60 * 60;

const NOW = new Date('2026-08-15T00:00:00.000Z');
const NOW_SECONDS = Math.floor(NOW.getTime() / 1000);

const resolve = (
  status: string,
  nextPaymentAttempt: number | null = NOW_SECONDS + SECONDS_PER_DAY,
) => resolveSubscriptionLicenseState({ status, nextPaymentAttempt });

describe('resolveSubscriptionLicenseState', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it.each(['active', 'trialing'])('licenses a %s subscription', (status) => {
    expect(resolve(status)).toEqual({
      outcome: 'licensed',
      graceExpiresAt: null,
    });
  });

  it.each(['canceled', 'unpaid', 'incomplete', 'incomplete_expired', 'paused'])(
    'rejects a %s subscription',
    (status) => {
      expect(resolve(status)).toEqual({
        outcome: 'rejected',
        graceExpiresAt: null,
      });
    },
  );

  it('grants grace while Stripe still has a retry scheduled', () => {
    const nextAttempt = NOW_SECONDS + 2 * SECONDS_PER_DAY;

    expect(resolve('past_due', nextAttempt)).toEqual({
      outcome: 'grace',
      graceExpiresAt: nextAttempt + SECONDS_PER_DAY,
    });
  });

  it('refuses grace once Stripe has stopped retrying', () => {
    expect(resolve('past_due', null)).toEqual({
      outcome: 'rejected',
      graceExpiresAt: null,
    });
  });

  it('keeps the license through a retry that has just fired', () => {
    expect(resolve('past_due', NOW_SECONDS - 60).outcome).toBe('grace');
  });

  it('refuses grace when the scheduled retry has gone stale', () => {
    expect(resolve('past_due', NOW_SECONDS - 2 * SECONDS_PER_DAY)).toEqual({
      outcome: 'rejected',
      graceExpiresAt: null,
    });
  });

  it('follows the dunning schedule forward instead of the billing period', () => {
    const firstRetry = NOW_SECONDS + SECONDS_PER_DAY;
    const rescheduled = NOW_SECONDS + 5 * SECONDS_PER_DAY;

    expect(resolve('past_due', firstRetry).graceExpiresAt).toBe(
      firstRetry + SECONDS_PER_DAY,
    );
    expect(resolve('past_due', rescheduled).graceExpiresAt).toBe(
      rescheduled + SECONDS_PER_DAY,
    );
  });
});
