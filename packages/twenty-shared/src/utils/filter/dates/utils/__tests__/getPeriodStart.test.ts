import { FirstDayOfTheWeek } from '@/types';
import { getPeriodStart } from '@/utils/filter/dates/utils/getPeriodStart';

import { Temporal } from 'temporal-polyfill';

describe('getPeriodStart', () => {
  const referenceDateTimeJanuary = Temporal.ZonedDateTime.from(
    '2026-01-14T12:34:56[Europe/Paris]',
  );

  const referenceDateTimeJune = Temporal.ZonedDateTime.from(
    '2026-06-14T12:34:56[Europe/Paris]',
  );

  it('should get start of day', () => {
    const startOfDay = getPeriodStart(referenceDateTimeJanuary, 'DAY');

    expect(startOfDay.toString()).toEqual(
      '2026-01-14T00:00:00+01:00[Europe/Paris]',
    );
  });

  it('should get start of week - weekd start on Monday', () => {
    const startOfWeek = getPeriodStart(
      referenceDateTimeJanuary,
      'WEEK',
      FirstDayOfTheWeek.MONDAY,
    );

    expect(startOfWeek.toString()).toEqual(
      '2026-01-12T00:00:00+01:00[Europe/Paris]',
    );
  });

  it('should get start of week - weekd start on Saturday', () => {
    const startOfWeek = getPeriodStart(
      referenceDateTimeJanuary,
      'WEEK',
      FirstDayOfTheWeek.SATURDAY,
    );

    expect(startOfWeek.toString()).toEqual(
      '2026-01-10T00:00:00+01:00[Europe/Paris]',
    );
  });

  it('should get start of week - weekd start on Sunday', () => {
    const startOfWeek = getPeriodStart(
      referenceDateTimeJanuary,
      'WEEK',
      FirstDayOfTheWeek.SUNDAY,
    );

    expect(startOfWeek.toString()).toEqual(
      '2026-01-11T00:00:00+01:00[Europe/Paris]',
    );
  });

  it('should get start of week - no first day of the week given (should default to monday)', () => {
    const startOfWeek = getPeriodStart(referenceDateTimeJanuary, 'WEEK');

    expect(startOfWeek.toString()).toEqual(
      '2026-01-12T00:00:00+01:00[Europe/Paris]',
    );
  });

  it('should get start of week - no first day of the week given (should default to monday)', () => {
    const startOfWeek = getPeriodStart(referenceDateTimeJanuary, 'WEEK');

    expect(startOfWeek.toString()).toEqual(
      '2026-01-12T00:00:00+01:00[Europe/Paris]',
    );
  });

  it('should get start of month', () => {
    const startOfWeek = getPeriodStart(referenceDateTimeJanuary, 'MONTH');

    expect(startOfWeek.toString()).toEqual(
      '2026-01-01T00:00:00+01:00[Europe/Paris]',
    );
  });

  it('should get start of year', () => {
    const startOfWeek = getPeriodStart(referenceDateTimeJune, 'YEAR');

    expect(startOfWeek.toString()).toEqual(
      '2026-01-01T00:00:00+01:00[Europe/Paris]',
    );
  });

  it('should get start of quarter', () => {
    const referenceDateTimeMarch = Temporal.ZonedDateTime.from(
      '2026-03-14T12:34:56[Europe/Paris]',
    );

    const referenceDateTimeSeptember = Temporal.ZonedDateTime.from(
      '2026-09-14T12:34:56[Europe/Paris]',
    );

    const referenceDateTimeDecember = Temporal.ZonedDateTime.from(
      '2026-12-14T12:34:56[Europe/Paris]',
    );

    const startOfQuarterForMarch = getPeriodStart(
      referenceDateTimeMarch,
      'QUARTER',
    );

    const startOfQuarterForJune = getPeriodStart(
      referenceDateTimeJune,
      'QUARTER',
    );

    const startOfQuarterForSeptember = getPeriodStart(
      referenceDateTimeSeptember,
      'QUARTER',
    );

    const startOfQuarterForDecember = getPeriodStart(
      referenceDateTimeDecember,
      'QUARTER',
    );

    expect(startOfQuarterForMarch.toString()).toEqual(
      '2026-01-01T00:00:00+01:00[Europe/Paris]',
    );
    expect(startOfQuarterForJune.toString()).toEqual(
      '2026-04-01T00:00:00+02:00[Europe/Paris]',
    );
    expect(startOfQuarterForSeptember.toString()).toEqual(
      '2026-07-01T00:00:00+02:00[Europe/Paris]',
    );
    expect(startOfQuarterForDecember.toString()).toEqual(
      '2026-10-01T00:00:00+02:00[Europe/Paris]',
    );
  });
});
