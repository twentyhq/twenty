import { FirstDayOfTheWeek } from '@/types';
import { getNextPeriodStart } from '@/utils/filter/dates/utils/getNextPeriodStart';

import { Temporal } from 'temporal-polyfill';

describe('getNextPeriodStart', () => {
  const referenceDateTimeJanuary = Temporal.ZonedDateTime.from(
    '2026-01-14T12:34:56[Europe/Paris]',
  );

  const referenceDateTimeJune = Temporal.ZonedDateTime.from(
    '2026-06-14T12:34:56[Europe/Paris]',
  );

  it('should get next day start', () => {
    const nextDayStart = getNextPeriodStart(referenceDateTimeJanuary, 'DAY');

    expect(nextDayStart.toString()).toEqual(
      '2026-01-15T00:00:00+01:00[Europe/Paris]',
    );
  });

  it('should get next week start - no first day of the week given (should default to monday)', () => {
    const nextWeekStart = getNextPeriodStart(referenceDateTimeJanuary, 'WEEK');

    expect(nextWeekStart.toString()).toEqual(
      '2026-01-19T00:00:00+01:00[Europe/Paris]',
    );
  });

  it('should get next week start - Monday', () => {
    const nextWeekStart = getNextPeriodStart(
      referenceDateTimeJanuary,
      'WEEK',
      FirstDayOfTheWeek.MONDAY,
    );

    expect(nextWeekStart.toString()).toEqual(
      '2026-01-19T00:00:00+01:00[Europe/Paris]',
    );
  });

  it('should get next week start - Saturday', () => {
    const nextWeekStart = getNextPeriodStart(
      referenceDateTimeJanuary,
      'WEEK',
      FirstDayOfTheWeek.SATURDAY,
    );

    expect(nextWeekStart.toString()).toEqual(
      '2026-01-17T00:00:00+01:00[Europe/Paris]',
    );
  });

  it('should get next week start - Sunday', () => {
    const nextWeekStart = getNextPeriodStart(
      referenceDateTimeJanuary,
      'WEEK',
      FirstDayOfTheWeek.SUNDAY,
    );

    expect(nextWeekStart.toString()).toEqual(
      '2026-01-18T00:00:00+01:00[Europe/Paris]',
    );
  });

  it('should get next month start', () => {
    const nextMonthStart = getNextPeriodStart(
      referenceDateTimeJanuary,
      'MONTH',
    );

    expect(nextMonthStart.toString()).toEqual(
      '2026-02-01T00:00:00+01:00[Europe/Paris]',
    );
  });

  it('should get next year start', () => {
    const nextQuarterStart = getNextPeriodStart(referenceDateTimeJune, 'YEAR');

    expect(nextQuarterStart.toString()).toEqual(
      '2027-01-01T00:00:00+01:00[Europe/Paris]',
    );
  });

  it('should get next start of quarter', () => {
    const referenceDateTimeMarch = Temporal.ZonedDateTime.from(
      '2026-03-14T12:34:56[Europe/Paris]',
    );

    const referenceDateTimeSeptember = Temporal.ZonedDateTime.from(
      '2026-09-14T12:34:56[Europe/Paris]',
    );

    const referenceDateTimeDecember = Temporal.ZonedDateTime.from(
      '2026-12-14T12:34:56[Europe/Paris]',
    );

    const nextStartOfQuarterForMarch = getNextPeriodStart(
      referenceDateTimeMarch,
      'QUARTER',
    );

    const nextStartOfQuarterForJune = getNextPeriodStart(
      referenceDateTimeJune,
      'QUARTER',
    );

    const nextStartOfQuarterForSeptember = getNextPeriodStart(
      referenceDateTimeSeptember,
      'QUARTER',
    );

    const nextStartOfQuarterForDecember = getNextPeriodStart(
      referenceDateTimeDecember,
      'QUARTER',
    );

    expect(nextStartOfQuarterForMarch.toString()).toEqual(
      '2026-04-01T00:00:00+02:00[Europe/Paris]',
    );
    expect(nextStartOfQuarterForJune.toString()).toEqual(
      '2026-07-01T00:00:00+02:00[Europe/Paris]',
    );
    expect(nextStartOfQuarterForSeptember.toString()).toEqual(
      '2026-10-01T00:00:00+02:00[Europe/Paris]',
    );
    expect(nextStartOfQuarterForDecember.toString()).toEqual(
      '2027-01-01T00:00:00+01:00[Europe/Paris]',
    );
  });
});
