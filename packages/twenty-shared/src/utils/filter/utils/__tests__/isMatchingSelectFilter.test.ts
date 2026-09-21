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
          value: null,
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

    it('should not match a null value, mirroring SQL semantics', () => {
      expect(
        isMatchingSelectFilter({
          selectFilter: { neq: 'ACTIVE' },
          value: null,
        }),
      ).toBe(false);
    });
  });

  describe('comparison operators', () => {
    const options = ['NEW', 'SCREENING', 'MEETING', 'PROPOSAL', 'CUSTOMER'].map(
      (value, position) => ({ value, position }),
    );

    it('should compare by option position, not lexically', () => {
      expect(
        isMatchingSelectFilter({
          selectFilter: { gt: 'NEW' },
          value: 'MEETING',
          options,
        }),
      ).toBe(true);

      expect(
        isMatchingSelectFilter({
          selectFilter: { lt: 'MEETING' },
          value: 'CUSTOMER',
          options,
        }),
      ).toBe(false);
    });

    it('should handle gte and lte inclusively', () => {
      expect(
        isMatchingSelectFilter({
          selectFilter: { gte: 'MEETING' },
          value: 'MEETING',
          options,
        }),
      ).toBe(true);

      expect(
        isMatchingSelectFilter({
          selectFilter: { lte: 'MEETING' },
          value: 'PROPOSAL',
          options,
        }),
      ).toBe(false);
    });

    it('should never match a null value', () => {
      expect(
        isMatchingSelectFilter({
          selectFilter: { gt: 'NEW' },
          value: null,
          options,
        }),
      ).toBe(false);
    });

    it('should never match when option values are unknown or missing', () => {
      expect(
        isMatchingSelectFilter({
          selectFilter: { gt: 'NEW' },
          value: 'DELETED_OPTION',
          options,
        }),
      ).toBe(false);

      expect(
        isMatchingSelectFilter({
          selectFilter: { gt: 'NEW' },
          value: 'MEETING',
        }),
      ).toBe(false);
    });
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
