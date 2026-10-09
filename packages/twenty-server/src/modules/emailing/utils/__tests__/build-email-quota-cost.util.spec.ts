import { UsageUnit } from 'src/engine/core-modules/usage/enums/usage-unit.enum';
import { buildEmailQuotaCost } from 'src/modules/emailing/utils/build-email-quota-cost.util';
import { computeEmailCreditsUsedMicro } from 'src/modules/emailing/utils/compute-email-credits-used-micro.util';

describe('buildEmailQuotaCost', () => {
  it('names both units a send will spend', () => {
    expect(buildEmailQuotaCost(30)).toEqual({
      [UsageUnit.CREDIT]: computeEmailCreditsUsedMicro(30),
      [UsageUnit.INVOCATION]: 30,
    });
  });

  it('names no cost when the caller does not know the count', () => {
    expect(buildEmailQuotaCost(undefined)).toBeUndefined();
  });

  it('names a zero cost rather than none for an empty send', () => {
    expect(buildEmailQuotaCost(0)).toEqual({
      [UsageUnit.CREDIT]: 0,
      [UsageUnit.INVOCATION]: 0,
    });
  });
});
