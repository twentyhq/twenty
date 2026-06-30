import { sumByProperty } from '@/utils/array/sumByProperty';

describe('sumByProperty', () => {
  it('should sum numeric property values', () => {
    const items = [
      { id: '1', amount: 10 },
      { id: '2', amount: 20 },
      { id: '3', amount: 30 },
    ];

    expect(items.reduce(sumByProperty('amount'), 0)).toBe(60);
  });

  it('should skip non-numeric values', () => {
    const items = [
      { id: '1', amount: 10 },
      { id: '2', amount: 'not-a-number' as unknown as number },
      { id: '3', amount: 30 },
    ];

    expect(items.reduce(sumByProperty('amount'), 0)).toBe(40);
  });

  it('should handle an empty array', () => {
    const items: { id: string; amount: number }[] = [];

    expect(items.reduce(sumByProperty('amount'), 0)).toBe(0);
  });
});
