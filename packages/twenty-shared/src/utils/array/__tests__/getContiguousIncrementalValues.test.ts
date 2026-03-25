import { getContiguousIncrementalValues } from '@/utils/array/getContiguousIncrementalValues';

describe('getContiguousIncrementalValues', () => {
  it('should return incremental values starting from 0 by default', () => {
    expect(getContiguousIncrementalValues(5)).toEqual([0, 1, 2, 3, 4]);
  });

  it('should return incremental values starting from a custom value', () => {
    expect(getContiguousIncrementalValues(3, 10)).toEqual([10, 11, 12]);
  });

  it('should return an empty array for 0 values', () => {
    expect(getContiguousIncrementalValues(0)).toEqual([]);
  });

  it('should handle negative starting values', () => {
    expect(getContiguousIncrementalValues(3, -2)).toEqual([-2, -1, 0]);
  });
});
