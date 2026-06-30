import { CalendarStartDay } from '@/constants';
import { FirstDayOfTheWeek } from '@/types';
import { convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek } from '@/utils/filter/dates/utils/convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek';
import { convertFirstDayOfTheWeekToCalendarStartDayNumber } from '@/utils/filter/dates/utils/convertFirstDayOfTheWeekToCalendarStartDayNumber';
import { getFirstDayOfTheWeekAsANumberForDateFNS } from '@/utils/filter/dates/utils/getFirstDayOfTheWeekAsANumberForDateFNS';

describe('convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek', () => {
  it('should convert MONDAY', () => {
    expect(
      convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek(
        CalendarStartDay.MONDAY,
        FirstDayOfTheWeek.SUNDAY,
      ),
    ).toBe(FirstDayOfTheWeek.MONDAY);
  });

  it('should convert SATURDAY', () => {
    expect(
      convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek(
        CalendarStartDay.SATURDAY,
        FirstDayOfTheWeek.SUNDAY,
      ),
    ).toBe(FirstDayOfTheWeek.SATURDAY);
  });

  it('should convert SUNDAY', () => {
    expect(
      convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek(
        CalendarStartDay.SUNDAY,
        FirstDayOfTheWeek.MONDAY,
      ),
    ).toBe(FirstDayOfTheWeek.SUNDAY);
  });

  it('should use system default for SYSTEM', () => {
    expect(
      convertCalendarStartDayNonIsoNumberToFirstDayOfTheWeek(
        CalendarStartDay.SYSTEM,
        FirstDayOfTheWeek.SATURDAY,
      ),
    ).toBe(FirstDayOfTheWeek.SATURDAY);
  });
});

describe('convertFirstDayOfTheWeekToCalendarStartDayNumber', () => {
  it('should convert MONDAY', () => {
    expect(
      convertFirstDayOfTheWeekToCalendarStartDayNumber(
        FirstDayOfTheWeek.MONDAY,
      ),
    ).toBe(CalendarStartDay.MONDAY);
  });

  it('should convert SATURDAY', () => {
    expect(
      convertFirstDayOfTheWeekToCalendarStartDayNumber(
        FirstDayOfTheWeek.SATURDAY,
      ),
    ).toBe(CalendarStartDay.SATURDAY);
  });

  it('should convert SUNDAY', () => {
    expect(
      convertFirstDayOfTheWeekToCalendarStartDayNumber(
        FirstDayOfTheWeek.SUNDAY,
      ),
    ).toBe(CalendarStartDay.SUNDAY);
  });
});

describe('getFirstDayOfTheWeekAsANumberForDateFNS', () => {
  it('should return 1 for MONDAY', () => {
    expect(
      getFirstDayOfTheWeekAsANumberForDateFNS(FirstDayOfTheWeek.MONDAY),
    ).toBe(1);
  });

  it('should return 6 for SATURDAY', () => {
    expect(
      getFirstDayOfTheWeekAsANumberForDateFNS(FirstDayOfTheWeek.SATURDAY),
    ).toBe(6);
  });

  it('should return 0 for SUNDAY', () => {
    expect(
      getFirstDayOfTheWeekAsANumberForDateFNS(FirstDayOfTheWeek.SUNDAY),
    ).toBe(0);
  });
});
