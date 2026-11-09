import { findRootRecordFilterGroup } from '@/utils/filter/findRootRecordFilterGroup';

describe('findRootRecordFilterGroup', () => {
  it('should return the first parentless group only', () => {
    expect(
      findRootRecordFilterGroup([
        { id: 'child', parentRecordFilterGroupId: 'first' },
        { id: 'first', parentRecordFilterGroupId: null },
        { id: 'second' },
      ])?.id,
    ).toBe('first');
  });

  it('should return nothing without a parentless group', () => {
    expect(
      findRootRecordFilterGroup([
        { id: 'child', parentRecordFilterGroupId: 'x' },
      ]),
    ).toBeUndefined();
  });
});
