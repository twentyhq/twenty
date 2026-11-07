import { FirstDayOfTheWeek } from '@/types';
import { relativeDateFilterStringifiedSchema } from '@/utils/filter/dates/utils/relativeDateFilterStringifiedSchema';
import { stringifyRelativeDateFilter } from '@/utils/filter/dates/utils/stringifyRelativeDateFilter';

describe('stringifyRelativeDateFilter', () => {
  it('should stringify a relative date filter without time zone', () => {
    expect(
      stringifyRelativeDateFilter({
        direction: 'PAST',
        amount: 3,
        unit: 'WEEK',
        firstDayOfTheWeek: FirstDayOfTheWeek.MONDAY,
      }),
    ).toBe('PAST_3_WEEK');
  });

  it('should always use an amount of 1 for THIS', () => {
    expect(
      stringifyRelativeDateFilter({ direction: 'THIS', unit: 'MONTH' }),
    ).toBe('THIS_1_MONTH');
  });

  it('should append the time zone and the first day of the week', () => {
    expect(
      stringifyRelativeDateFilter({
        direction: 'NEXT',
        amount: 2,
        unit: 'DAY',
        timezone: 'Asia/Tokyo',
        firstDayOfTheWeek: FirstDayOfTheWeek.SUNDAY,
      }),
    ).toBe('NEXT_2_DAY;;Asia/Tokyo;;SUNDAY;;');
  });

  it('should round-trip through the stringified relative date filter schema', () => {
    const value = 'PAST_1_QUARTER;;America/New_York;;SATURDAY;;';

    expect(
      stringifyRelativeDateFilter(
        relativeDateFilterStringifiedSchema.parse(value),
      ),
    ).toBe(value);
  });

  it('should throw when a PAST or NEXT filter has no positive amount', () => {
    expect(() =>
      stringifyRelativeDateFilter({
        direction: 'PAST',
        amount: 0,
        unit: 'DAY',
      }),
    ).toThrow(
      'Amount must be defined and greater than 0 for relative date filters',
    );
  });
});
