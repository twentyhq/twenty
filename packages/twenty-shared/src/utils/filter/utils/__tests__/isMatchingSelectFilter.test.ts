import { isMatchingSelectFilter } from '@/utils/filter/utils/isMatchingSelectFilter';

describe('isMatchingSelectFilter', () => {
  describe('in', () => {
    it('should return true when value is in the list', () => {
      expect(
        isMatchingSelectFilter({
          selectFilter: { in: ['ACTIVE', 'PENDING'] },
          value: 'ACTIVE',
        }),
      ).toBe(true);
    });

    it('should return false when value is not in the list', () => {
      expect(
        isMatchingSelectFilter({
          selectFilter: { in: ['ACTIVE', 'PENDING'] },
          value: 'CLOSED',
        }),
      ).toBe(false);
    });
  });

  describe('is', () => {
    it('should match NULL check', () => {
      expect(
        isMatchingSelectFilter({
          selectFilter: { is: 'NULL' },
          value: null as any,
        }),
      ).toBe(true);
    });

    it('should match NOT_NULL check', () => {
      expect(
        isMatchingSelectFilter({
          selectFilter: { is: 'NOT_NULL' },
          value: 'ACTIVE',
        }),
      ).toBe(true);
    });
  });

  describe('eq', () => {
    it('should return true when value equals', () => {
      expect(
        isMatchingSelectFilter({
          selectFilter: { eq: 'ACTIVE' },
          value: 'ACTIVE',
        }),
      ).toBe(true);
    });

    it('should return false when value does not equal', () => {
      expect(
        isMatchingSelectFilter({
          selectFilter: { eq: 'ACTIVE' },
          value: 'CLOSED',
        }),
      ).toBe(false);
    });
  });

  describe('neq', () => {
    it('should return true when value does not equal', () => {
      expect(
        isMatchingSelectFilter({
          selectFilter: { neq: 'ACTIVE' },
          value: 'CLOSED',
        }),
      ).toBe(true);
    });
  });

  describe('comparison operators', () => {
    it.each([
      { selectFilter: { gt: 'ACTIVE' }, value: 'PENDING', expected: true },
      { selectFilter: { gt: 'PENDING' }, value: 'ACTIVE', expected: false },
      { selectFilter: { gte: 'ACTIVE' }, value: 'ACTIVE', expected: true },
      { selectFilter: { lt: 'PENDING' }, value: 'ACTIVE', expected: true },
      { selectFilter: { lt: 'ACTIVE' }, value: 'PENDING', expected: false },
      { selectFilter: { lte: 'ACTIVE' }, value: 'ACTIVE', expected: true },
    ])(
      'should return $expected for $selectFilter and $value',
      ({ selectFilter, value, expected }) => {
        expect(
          isMatchingSelectFilter({
            selectFilter,
            value,
          }),
        ).toBe(expected);
      },
    );
  });

  describe('default', () => {
    it('should throw for unexpected filter', () => {
      expect(() =>
        isMatchingSelectFilter({
          selectFilter: {} as any,
          value: 'ACTIVE',
        }),
      ).toThrow('Unexpected value for select filter');
    });
  });
});
