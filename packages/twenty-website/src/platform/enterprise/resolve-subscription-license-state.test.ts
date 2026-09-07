import { resolveSubscriptionLicenseState } from './resolve-subscription-license-state';

const SECONDS_PER_DAY = 24 * 60 * 60;

const NOW = new Date('2026-08-15T00:00:00.000Z');
const NOW_SECONDS = Math.floor(NOW.getTime() / 1000);

const resolve = (
  status: string,
  currentPeriodStart: number | null = NOW_SECONDS - 5 * SECONDS_PER_DAY,
) =>
  resolveSubscriptionLicenseState({
    status,
    currentPeriodStart,
    gracePeriodDays: 14,
    now: NOW,
  });

describe('resolveSubscriptionLicenseState', () => {
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

  it('grants grace to a past_due subscription while dunning runs', () => {
    const periodStart = NOW_SECONDS - 5 * SECONDS_PER_DAY;

    expect(resolve('past_due', periodStart)).toEqual({
      outcome: 'grace',
      graceExpiresAt: periodStart + 14 * SECONDS_PER_DAY,
    });
  });

  it('rejects a past_due subscription once the grace window has elapsed', () => {
    expect(resolve('past_due', NOW_SECONDS - 20 * SECONDS_PER_DAY)).toEqual({
      outcome: 'rejected',
      graceExpiresAt: null,
    });
  });

  it('anchors grace on now when Stripe does not expose a period start', () => {
    expect(resolve('past_due', null)).toEqual({
      outcome: 'grace',
      graceExpiresAt: NOW_SECONDS + 14 * SECONDS_PER_DAY,
    });
  });

  it('reproduces the enquanta outage: past_due on the day after a failed cycle invoice stays licensed', () => {
    const tradeInvoiceAt = Math.floor(
      new Date('2026-08-10T04:01:00.000Z').getTime() / 1000,
    );

    const dayAfter = resolveSubscriptionLicenseState({
      status: 'past_due',
      currentPeriodStart: tradeInvoiceAt,
      gracePeriodDays: 14,
      now: new Date('2026-08-11T04:00:00.000Z'),
    });

    expect(dayAfter.outcome).toBe('grace');

    const afterDunning = resolveSubscriptionLicenseState({
      status: 'canceled',
      currentPeriodStart: tradeInvoiceAt,
      gracePeriodDays: 14,
      now: new Date('2026-08-25T04:00:00.000Z'),
    });

    expect(afterDunning.outcome).toBe('rejected');
  });
});
