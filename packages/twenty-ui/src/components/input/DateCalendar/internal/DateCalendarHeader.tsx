import { LightIconButton } from '@ui/components/input/LightIconButton/LightIconButton';
import { IconChevronLeft, IconChevronRight } from '@ui/icon';

import styles from '../DateCalendar.module.scss';
import { type DateCalendarProps } from '../types/DateCalendarProps';
import { type DateCalendarHeaderProps } from '../types/DateCalendarHeaderProps';
import { DATE_CALENDAR_CONSTANTS } from './dateCalendarConstants';
import { DateCalendarSelect } from './DateCalendarSelect';
import { parseDateCalendarDateOrThrow } from './parseDateCalendarDateOrThrow';

const YEAR_WINDOW = 100;

export const DateCalendarHeader = ({
  viewedMonth,
  onPreviousMonth,
  onNextMonth,
  onMonthChange,
  onYearChange,
  previousMonthDisabled,
  nextMonthDisabled,
  locale,
  previousMonthLabel,
  nextMonthLabel,
  monthLabel,
  yearLabel,
  portalContainer,
  onNavigationOpenChange,
  disabled,
}: DateCalendarHeaderProps &
  Pick<
    DateCalendarProps,
    | 'locale'
    | 'previousMonthLabel'
    | 'nextMonthLabel'
    | 'monthLabel'
    | 'yearLabel'
    | 'portalContainer'
    | 'onNavigationOpenChange'
    | 'disabled'
  >) => {
  const monthDate = parseDateCalendarDateOrThrow(`${viewedMonth}-01`);
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
          onValueChange={onMonthChange}
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
          onValueChange={onYearChange}
        />
      </div>
      <div className={styles.navigation}>
        <LightIconButton
          size="md"
          disabled={disabled || previousMonthDisabled}
          aria-label={previousMonthLabel}
          onClick={onPreviousMonth}
        >
          <IconChevronLeft className={styles.chevron} />
        </LightIconButton>
        <LightIconButton
          size="md"
          disabled={disabled || nextMonthDisabled}
          aria-label={nextMonthLabel}
          onClick={onNextMonth}
        >
          <IconChevronRight className={styles.chevron} />
        </LightIconButton>
      </div>
    </div>
  );
};
