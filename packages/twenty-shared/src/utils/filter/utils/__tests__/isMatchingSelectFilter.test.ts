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

  describe('gt', () => {
    it('should return true when value is greater', () => {
      expect(
        isMatchingSelectFilter({
          selectFilter: { gt: 'ACTIVE' },
          value: 'CLOSED',
        }),
      ).toBe(true);
    });

    it('should return false when value is not greater', () => {
      expect(
        isMatchingSelectFilter({
          selectFilter: { gt: 'CLOSED' },
          value: 'ACTIVE',
        }),
      ).toBe(false);
    });
  });

  describe('gte', () => {
    it('should return true when value is equal', () => {
      expect(
        isMatchingSelectFilter({
          selectFilter: { gte: 'ACTIVE' },
          value: 'ACTIVE',
        }),
      ).toBe(true);
    });
  });

  describe('lt', () => {
    it('should return true when value is lower', () => {
      expect(
        isMatchingSelectFilter({
          selectFilter: { lt: 'CLOSED' },
          value: 'ACTIVE',
        }),
      ).toBe(true);
    });

    it('should return false when value is not lower', () => {
      expect(
        isMatchingSelectFilter({
          selectFilter: { lt: 'ACTIVE' },
          value: 'CLOSED',
        }),
      ).toBe(false);
    });
  });

  describe('lte', () => {
    it('should return true when value is equal', () => {
      expect(
        isMatchingSelectFilter({
          selectFilter: { lte: 'ACTIVE' },
          value: 'ACTIVE',
        }),
      ).toBe(true);
    });
  });

  describe('case insensitivity', () => {
    it('should compare case-insensitively, matching the server ordering', () => {
      expect(
        isMatchingSelectFilter({
          selectFilter: { gt: 'ACTIVE' },
          value: 'closed',
        }),
      ).toBe(true);
    });

    it('should not order lowercase values after uppercase ones', () => {
      expect(
        isMatchingSelectFilter({
          selectFilter: { gt: 'closed' },
          value: 'ACTIVE',
        }),
      ).toBe(false);
    });
  });

  describe('null values', () => {
    it.each(['gt', 'gte', 'lt', 'lte'] as const)(
      'should not match %s when value is null',
      (operand) => {
        expect(
          isMatchingSelectFilter({
            selectFilter: { [operand]: 'ACTIVE' },
            value: null as any,
          }),
        ).toBe(false);
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
