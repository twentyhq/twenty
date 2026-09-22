import { computeEmailCreditsUsedMicro } from 'src/modules/emailing/utils/compute-email-credits-used-micro.util';

describe('computeEmailCreditsUsedMicro', () => {
  it.each([
    [0, 0],
    [1, 300],
    [7, 2100],
    [1000, 300_000],
  ])('charges %i email(s) as %i micro-credits', (sentEmailCount, expected) => {
    expect(computeEmailCreditsUsedMicro(sentEmailCount)).toBe(expected);
  });

  it('rounds to a whole micro-credit', () => {
    expect(Number.isInteger(computeEmailCreditsUsedMicro(3))).toBe(true);
  });
});
