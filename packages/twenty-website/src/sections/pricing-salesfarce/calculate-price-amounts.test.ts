import { calculatePriceAmounts } from './calculate-price-amounts';

const checked = (...ids: string[]): ReadonlySet<string> => new Set(ids);

describe('calculatePriceAmounts', () => {
  it('adds the per-seat cost of each checked add-on to the base', () => {
    const result = calculatePriceAmounts(
      [
        { cost: 35, id: 'api' },
        { cost: 5, id: 'sso' },
      ],
      100,
      checked('api', 'sso'),
    );

    expect(result.perSeatPriceAmount).toBe(140);
    expect(result.totalPriceAmount).toBe(140);
  });

  it('ignores unchecked add-ons', () => {
    const result = calculatePriceAmounts(
      [{ cost: 35, id: 'api' }],
      100,
      checked(),
    );

    expect(result.perSeatPriceAmount).toBe(100);
  });

  it('levies a shared-cost per-seat fee only once', () => {
    const addons = [
      { cost: 75, id: 'a', sharedCostKey: 'enterprise' },
      { cost: 75, id: 'b', sharedCostKey: 'enterprise' },
    ];

    expect(
      calculatePriceAmounts(addons, 100, checked('a', 'b')).perSeatPriceAmount,
    ).toBe(175);
  });

  it('adds fixed costs to the total but not the per-seat price', () => {
    const result = calculatePriceAmounts(
      [{ cost: 0, fixedCost: 7000, id: 'webhooks' }],
      100,
      checked('webhooks'),
    );

    expect(result.perSeatPriceAmount).toBe(100);
    expect(result.fixedPriceAmount).toBe(7000);
    expect(result.totalPriceAmount).toBe(7100);
  });

  it('applies a net-spend rate as a multiplier on the totals', () => {
    const result = calculatePriceAmounts(
      [{ cost: 75, id: 'encrypt', netSpendRate: 0.2 }],
      100,
      checked('encrypt'),
    );

    expect(result.perSeatPriceAmount).toBe(210);
    expect(result.totalPriceAmount).toBe(210);
  });
});
