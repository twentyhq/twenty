import { sortByManualOrder } from 'src/modules/dashboard/chart-data/utils/sort-by-manual-order.util';

describe('sortByManualOrder', () => {
  type TestItem = { label: string };

  const testData: TestItem[] = [
    { label: 'Beta' },
    { label: 'Alpha' },
    { label: 'Gamma' },
  ];

  const getRawValue = (item: TestItem) => item.label;

  it('should sort items according to manual order', () => {
    const result = sortByManualOrder({
      items: testData,
      manualSortOrder: ['Gamma', 'Alpha', 'Beta'],
      getRawValue,
    });

    expect(result.map((item) => item.label)).toEqual([
      'Gamma',
      'Alpha',
      'Beta',
    ]);
  });

  it('should return items unchanged when manual order is empty', () => {
    const result = sortByManualOrder({
      items: testData,
      manualSortOrder: [],
      getRawValue,
    });

    expect(result).toEqual(testData);
  });

  it('should put items not in manual order at the end', () => {
    const result = sortByManualOrder({
      items: testData,
      manualSortOrder: ['Alpha', 'Gamma'],
      getRawValue,
    });

    expect(result.map((item) => item.label)).toEqual([
      'Alpha',
      'Gamma',
      'Beta',
    ]);
  });

  it('should handle items with null raw values', () => {
    const dataWithNull = [
      { label: 'Alpha' },
      { label: null as unknown as string },
      { label: 'Beta' },
    ];

    const result = sortByManualOrder({
      items: dataWithNull,
      manualSortOrder: ['Beta', 'Alpha'],
      getRawValue: (item) => item.label,
    });

    expect(result[0].label).toBe('Beta');
    expect(result[1].label).toBe('Alpha');
    expect(result[2].label).toBeNull();
  });

  it('should handle empty items array', () => {
    const result = sortByManualOrder({
      items: [],
      manualSortOrder: ['Alpha', 'Beta'],
      getRawValue,
    });

    expect(result).toEqual([]);
  });

  it('should maintain stability for items with equal positions', () => {
    const result = sortByManualOrder({
      items: testData,
      manualSortOrder: ['Delta'],
      getRawValue,
    });

    expect(result).toEqual(testData);
  });
});
