import { resolveTrialPeriodDays } from './resolve-trial-period-days';

describe('resolveTrialPeriodDays', () => {
  it('grants the full trial to a server with no prior subscription', () => {
    expect(
      resolveTrialPeriodDays({
        defaultTrialPeriodDays: 30,
        hasPriorSubscription: false,
      }),
    ).toBe(30);
  });

  it('grants no trial to a returning server', () => {
    expect(
      resolveTrialPeriodDays({
        defaultTrialPeriodDays: 30,
        hasPriorSubscription: true,
      }),
    ).toBeUndefined();
  });

  it('grants no trial when the configured length is not positive', () => {
    expect(
      resolveTrialPeriodDays({
        defaultTrialPeriodDays: 0,
        hasPriorSubscription: false,
      }),
    ).toBeUndefined();
  });
});
