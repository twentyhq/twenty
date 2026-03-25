import { combineFilters } from '@/utils/filter/utils/combineFilters';

describe('combineFilters', () => {
  it('should return empty object when all filters are empty', () => {
    expect(combineFilters([{}, {}, {}])).toEqual({});
  });

  it('should return single filter when only one non-empty filter exists', () => {
    const filter = { name: { eq: 'test' } };

    expect(combineFilters([{}, filter, {}])).toEqual(filter);
  });

  it('should combine multiple non-empty filters with and', () => {
    const filter1 = { name: { eq: 'test' } };
    const filter2 = { age: { gt: 18 } };

    expect(combineFilters([filter1, filter2])).toEqual({
      and: [filter1, filter2],
    });
  });

  it('should return empty object for empty array', () => {
    expect(combineFilters([])).toEqual({});
  });
});
