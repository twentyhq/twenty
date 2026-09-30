import { type DateFilter } from '@/types';
import { isMatchingDateFilter } from '@/utils/filter/utils/isMatchingDateFilter';

describe('isMatchingDateFilter', () => {
  const testDate = '2023-12-19T12:15:29.810Z';

  describe('eq', () => {
    it('value equals eq filter', () => {
      expect(
        isMatchingDateFilter({ dateFilter: { eq: testDate }, value: testDate }),
      ).toBe(true);
    });

    it('value does not equal eq filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { eq: testDate },
          value: '2023-12-18T12:15:29.810Z',
        }),
      ).toBe(false);
    });
  });

  describe('neq', () => {
    it('value does not equal neq filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { neq: testDate },
          value: '2023-12-18T12:15:29.810Z',
        }),
      ).toBe(true);
    });

    it('value equals neq filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { neq: testDate },
          value: testDate,
        }),
      ).toBe(false);
    });
  });

  describe('in', () => {
    it('value is in the array', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { in: [testDate, '2023-12-20T12:15:29.810Z'] },
          value: testDate,
        }),
      ).toBe(true);
    });

    it('value is not in the array', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: {
            in: ['2023-12-20T12:15:29.810Z', '2023-12-21T12:15:29.810Z'],
          },
          value: testDate,
        }),
      ).toBe(false);
    });
  });

  describe('is', () => {
    it('value is NULL', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { is: 'NULL' },
          value: null as any,
        }),
      ).toBe(true);
    });

    it('value is NOT_NULL', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { is: 'NOT_NULL' },
          value: testDate,
        }),
      ).toBe(true);
    });

    it('evaluates comparison when combined with is: NOT_NULL', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { is: 'NOT_NULL', eq: testDate },
          value: testDate,
        }),
      ).toBe(true);

      expect(
        isMatchingDateFilter({
          dateFilter: { is: 'NOT_NULL', eq: testDate },
          value: '2023-12-18T12:15:29.810Z',
        }),
      ).toBe(false);
    });
  });

  describe('null or undefined value', () => {
    it.each([null, undefined])(
      'does not throw and returns false for comparison operators (value: %s)',
      (value) => {
        const comparisonFilters: DateFilter[] = [
          { eq: testDate },
          { neq: testDate },
          { gt: testDate },
          { gte: testDate },
          { lt: testDate },
          { lte: testDate },
          { in: [testDate] },
        ];

        for (const dateFilter of comparisonFilters) {
          expect(isMatchingDateFilter({ dateFilter, value })).toBe(false);
        }
      },
    );

    it.each([null, undefined])(
      'matches "is: NULL" for an empty value (value: %s)',
      (value) => {
        expect(
          isMatchingDateFilter({ dateFilter: { is: 'NULL' }, value }),
        ).toBe(true);
      },
    );

    it.each([null, undefined])(
      'does not match "is: NOT_NULL" for an empty value (value: %s)',
      (value) => {
        expect(
          isMatchingDateFilter({ dateFilter: { is: 'NOT_NULL' }, value }),
        ).toBe(false);
      },
    );
  });

  describe('gt', () => {
    it('value is greater than gt filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { gt: '2023-12-18T12:15:29.810Z' },
          value: testDate,
        }),
      ).toBe(true);
    });

    it('value is not greater than gt filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { gt: '2023-12-20T12:15:29.810Z' },
          value: testDate,
        }),
      ).toBe(false);
    });
  });

  describe('gte', () => {
    it('value is greater than or equal to gte filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { gte: testDate },
          value: testDate,
        }),
      ).toBe(true);
    });

    it('value is not greater than or equal to gte filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { gte: '2023-12-20T12:15:29.810Z' },
          value: testDate,
        }),
      ).toBe(false);
    });
  });

  describe('lt', () => {
    it('value is less than lt filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { lt: '2023-12-20T12:15:29.810Z' },
          value: testDate,
        }),
      ).toBe(true);
    });

    it('value is not less than lt filter', () => {
      expect(
        isMatchingDateFilter({ dateFilter: { lt: testDate }, value: testDate }),
      ).toBe(false);
    });
  });

  describe('lte', () => {
    it('value is less than or equal to lte filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { lte: testDate },
          value: testDate,
        }),
      ).toBe(true);
    });

    it('value is not less than or equal to lte filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { lte: '2023-12-18T12:15:29.810Z' },
          value: testDate,
        }),
      ).toBe(false);
    });
  });
  describe('Date object values', () => {
    const testDateObject = new Date(testDate);

    it('matches a gte filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { gte: '2023-12-18T12:15:29.810Z' },
          value: testDateObject,
        }),
      ).toBe(true);
    });

    it('matches an lt filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { lt: '2023-12-20T12:15:29.810Z' },
          value: testDateObject,
        }),
      ).toBe(true);

      expect(
        isMatchingDateFilter({
          dateFilter: { lt: '2023-12-18T12:15:29.810Z' },
          value: testDateObject,
        }),
      ).toBe(false);
    });

    it('matches an eq filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { eq: testDate },
          value: testDateObject,
        }),
      ).toBe(true);
    });

    it('matches an in filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { in: [testDate] },
          value: testDateObject,
        }),
      ).toBe(true);

      expect(
        isMatchingDateFilter({
          dateFilter: { in: ['2023-12-18T12:15:29.810Z'] },
          value: testDateObject,
        }),
      ).toBe(false);
    });

    it('matches the relative date range a view filter generates', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { gte: '2023-12-19T00:00:00.000Z' },
          value: testDateObject,
        }) &&
          isMatchingDateFilter({
            dateFilter: { lt: '2023-12-20T00:00:00.000Z' },
            value: testDateObject,
          }),
      ).toBe(true);
    });
  });

  describe('non-string or malformed date inputs resilience', () => {
    it.each([{}, { some: 'object' }, 12345, true, '', 'invalid-date-string'])(
      'does not throw and returns false when value is %p',
      (invalidValue) => {
        expect(
          isMatchingDateFilter({
            dateFilter: { eq: testDate },
            value: invalidValue as unknown as string,
          }),
        ).toBe(false);

        expect(
          isMatchingDateFilter({
            dateFilter: { gte: testDate },
            value: invalidValue as unknown as string,
          }),
        ).toBe(false);
      },
    );

    it.each([{}, { date: '2023-12-19' }, 12345, true, '', 'not-a-date'])(
      'does not throw e.split error and returns false when filter operand is %p',
      (invalidOperand) => {
        expect(
          isMatchingDateFilter({
            dateFilter: { eq: invalidOperand as unknown as string },
            value: testDate,
          }),
        ).toBe(false);

        expect(
          isMatchingDateFilter({
            dateFilter: { gte: invalidOperand as unknown as string },
            value: testDate,
          }),
        ).toBe(false);

        expect(
          isMatchingDateFilter({
            dateFilter: { in: [invalidOperand as unknown as string] },
            value: testDate,
          }),
        ).toBe(false);
      },
    );

    it.each(['', 'invalid-date-string', {}, 12345])(
      'matches standalone "is: NOT_NULL" for non-null value %p',
      (nonNullValue) => {
        expect(
          isMatchingDateFilter({
            dateFilter: { is: 'NOT_NULL' },
            value: nonNullValue as unknown as string,
          }),
        ).toBe(true);
      },
    );

    it.each(['', 'invalid-date-string', {}, 12345])(
      'does not match standalone "is: NULL" for non-null value %p',
      (nonNullValue) => {
        expect(
          isMatchingDateFilter({
            dateFilter: { is: 'NULL' },
            value: nonNullValue as unknown as string,
          }),
        ).toBe(false);
      },
    );

    it('requires valid date matching when "is: NOT_NULL" is combined with comparison filter', () => {
      expect(
        isMatchingDateFilter({
          dateFilter: { is: 'NOT_NULL', eq: testDate },
          value: '',
        }),
      ).toBe(false);

      expect(
        isMatchingDateFilter({
          dateFilter: { is: 'NOT_NULL', eq: testDate },
          value: testDate,
        }),
      ).toBe(true);

      expect(
        isMatchingDateFilter({
          dateFilter: { is: 'NOT_NULL', eq: '2020-01-01' },
          value: testDate,
        }),
      ).toBe(false);
    });
  });
});
