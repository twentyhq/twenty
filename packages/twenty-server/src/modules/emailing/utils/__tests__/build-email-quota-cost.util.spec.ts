import { buildEmailQuotaCost } from 'src/modules/emailing/utils/build-email-quota-cost.util';
import { computeEmailCreditsUsedMicro } from 'src/modules/emailing/utils/compute-email-credits-used-micro.util';

describe('buildEmailQuotaCost', () => {
  it('names both meters a send will spend', () => {
    expect(buildEmailQuotaCost(30)).toEqual({
      quantity: 30,
      creditsUsedMicro: computeEmailCreditsUsedMicro(30),
    });
  });

  it('names no cost when the caller does not know the count', () => {
    expect(buildEmailQuotaCost(undefined)).toBeUndefined();
  });

  it('names a zero cost rather than none for an empty send', () => {
    expect(buildEmailQuotaCost(0)).toEqual({
      quantity: 0,
      creditsUsedMicro: 0,
    });
  });
});
