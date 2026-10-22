import { LightIconButton } from '@ui/components/input/LightIconButton/LightIconButton';
import { IconChevronLeft, IconChevronRight } from '@ui/icon';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from '../DateCalendar.module.scss';
import { type DateCalendarProps } from '../types/DateCalendarProps';
import { DATE_CALENDAR_CONSTANTS } from './dateCalendarConstants';
import { DateCalendarSelect } from './DateCalendarSelect';
import { formatDateCalendarDate } from './formatDateCalendarDate';
import { parseDateCalendarDate } from './parseDateCalendarDate';
import { shiftDateCalendarDate } from './shiftDateCalendarDate';

const YEAR_WINDOW = 100;

export const DateCalendarHeader = ({
  viewedMonth,
  onViewedMonthChange,
  locale,
  previousMonthLabel,
  nextMonthLabel,
  monthLabel,
  yearLabel,
  portalContainer,
  onNavigationOpenChange,
  disabled,
}: Pick<
  DateCalendarProps,
  | 'viewedMonth'
  | 'onViewedMonthChange'
  | 'locale'
  | 'previousMonthLabel'
  | 'nextMonthLabel'
  | 'monthLabel'
  | 'yearLabel'
  | 'portalContainer'
  | 'onNavigationOpenChange'
  | 'disabled'
>) => {
  const monthDate = parseDateCalendarDate(`${viewedMonth}-01`);
  const year = monthDate.getUTCFullYear();
  const month = monthDate.getUTCMonth() + 1;
  const monthFormatter = new Intl.DateTimeFormat(locale, {
    month: 'long',
    calendar: 'gregory',
    timeZone: 'UTC',
  });
  const yearFormatter = new Intl.NumberFormat(locale, { useGrouping: false });
  const months = [];

  for (
    let index = 1;
    index <= DATE_CALENDAR_CONSTANTS.MONTHS_PER_YEAR;
    index++
  ) {
    const date = new Date(monthDate);
    date.setUTCMonth(index - 1);
    months.push({ value: index, label: monthFormatter.format(date) });
  }

  const years = [];
  const firstYear = Math.max(
    DATE_CALENDAR_CONSTANTS.MIN_YEAR,
    year - YEAR_WINDOW,
  );
  const lastYear = Math.min(
    DATE_CALENDAR_CONSTANTS.MAX_YEAR,
    year + YEAR_WINDOW,
  );

  for (let optionYear = firstYear; optionYear <= lastYear; optionYear++) {
    years.push({ value: optionYear, label: yearFormatter.format(optionYear) });
  }

  const previousMonth = shiftDateCalendarDate({
    date: `${viewedMonth}-01`,
    months: -1,
  });
  const nextMonth = shiftDateCalendarDate({
    date: `${viewedMonth}-01`,
    months: 1,
  });

  return (
    <div className={styles.header}>
      <div className={styles.monthSelect}>
        <DateCalendarSelect
          value={month}
          items={months}
          disabled={disabled}
          label={monthLabel}
          portalContainer={portalContainer}
          onOpenChange={(open) =>
            onNavigationOpenChange?.({ open, control: 'month' })
          }
          onValueChange={(nextMonthValue) => {
            const nextMonthDate = new Date(monthDate);
            nextMonthDate.setUTCMonth(nextMonthValue - 1);
            onViewedMonthChange(
              formatDateCalendarDate(nextMonthDate).slice(0, 7),
            );
          }}
        />
      </div>
      <div className={styles.yearSelect}>
        <DateCalendarSelect
          value={year}
          items={years}
          disabled={disabled}
          label={yearLabel}
          portalContainer={portalContainer}
          onOpenChange={(open) =>
            onNavigationOpenChange?.({ open, control: 'year' })
          }
          onValueChange={(nextYear) => {
            const nextMonthDate = new Date(monthDate);
            nextMonthDate.setUTCFullYear(nextYear);
            onViewedMonthChange(
              formatDateCalendarDate(nextMonthDate).slice(0, 7),
            );
          }}
        />
      </div>
      <div className={styles.navigation}>
        <LightIconButton
          size="md"
          disabled={disabled || !isDefined(previousMonth)}
          aria-label={previousMonthLabel}
          onClick={() => {
            if (isDefined(previousMonth)) {
              onViewedMonthChange(previousMonth.slice(0, 7));
            }
          }}
        >
          <IconChevronLeft className={styles.chevron} />
        </LightIconButton>
        <LightIconButton
          size="md"
          disabled={disabled || !isDefined(nextMonth)}
          aria-label={nextMonthLabel}
          onClick={() => {
            if (isDefined(nextMonth)) {
              onViewedMonthChange(nextMonth.slice(0, 7));
            }
          }}
        >
          <IconChevronRight className={styles.chevron} />
        </LightIconButton>
      </div>
    </div>
  );
};
