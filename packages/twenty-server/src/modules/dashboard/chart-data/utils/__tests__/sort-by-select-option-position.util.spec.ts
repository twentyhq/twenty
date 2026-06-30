import { sortBySelectOptionPosition } from 'src/modules/dashboard/chart-data/utils/sort-by-select-option-position.util';

describe('sortBySelectOptionPosition', () => {
  type TestItem = { label: string };

  const testItems: TestItem[] = [
    { label: 'Option B' },
    { label: 'Option C' },
    { label: 'Option A' },
  ];

  const options = [
    { value: 'opt-a', position: 0 },
    { value: 'opt-b', position: 1 },
    { value: 'opt-c', position: 2 },
  ];

  const formattedToRawLookup = new Map([
    ['Option A', 'opt-a'],
    ['Option B', 'opt-b'],
    ['Option C', 'opt-c'],
  ]);

  const getFormattedValue = (item: TestItem) => item.label;

  it('should sort items by select option position in ascending order', () => {
    const result = sortBySelectOptionPosition({
      items: testItems,
      options,
      formattedToRawLookup,
      getFormattedValue,
      direction: 'ASC',
    });

    expect(result.map((item) => item.label)).toEqual([
      'Option A',
      'Option B',
      'Option C',
    ]);
  });

  it('should sort items by select option position in descending order', () => {
    const result = sortBySelectOptionPosition({
      items: testItems,
      options,
      formattedToRawLookup,
      getFormattedValue,
      direction: 'DESC',
    });

    expect(result.map((item) => item.label)).toEqual([
      'Option C',
      'Option B',
      'Option A',
    ]);
  });

  it('should place items not in options at the end when sorting ascending', () => {
    const itemsWithUnknown: TestItem[] = [
      { label: 'Unknown' },
      { label: 'Option A' },
      { label: 'Option B' },
    ];

    const result = sortBySelectOptionPosition({
      items: itemsWithUnknown,
      options,
      formattedToRawLookup,
      getFormattedValue,
      direction: 'ASC',
    });

    expect(result.map((item) => item.label)).toEqual([
      'Option A',
      'Option B',
      'Unknown',
    ]);
  });

  it('should place items not in options at the beginning when sorting descending', () => {
    const itemsWithUnknown: TestItem[] = [
      { label: 'Unknown' },
      { label: 'Option A' },
      { label: 'Option B' },
    ];

    const result = sortBySelectOptionPosition({
      items: itemsWithUnknown,
      options,
      formattedToRawLookup,
      getFormattedValue,
      direction: 'DESC',
    });

    expect(result.map((item) => item.label)).toEqual([
      'Unknown',
      'Option B',
      'Option A',
    ]);
  });

  it('should handle empty items array', () => {
    const result = sortBySelectOptionPosition({
      items: [],
      options,
      formattedToRawLookup,
      getFormattedValue,
      direction: 'ASC',
    });

    expect(result).toEqual([]);
  });

  it('should handle items without raw value in lookup', () => {
    const itemsWithMissingLookup: TestItem[] = [
      { label: 'Not In Lookup' },
      { label: 'Option A' },
    ];

    const result = sortBySelectOptionPosition({
      items: itemsWithMissingLookup,
      options,
      formattedToRawLookup,
      getFormattedValue,
      direction: 'ASC',
    });

    expect(result[0].label).toBe('Option A');
    expect(result[1].label).toBe('Not In Lookup');
  });
});
