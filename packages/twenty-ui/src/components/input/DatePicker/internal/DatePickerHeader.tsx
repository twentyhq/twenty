import { LightIconButton } from '@ui/components/input/LightIconButton/LightIconButton';
import { IconChevronLeft, IconChevronRight } from '@ui/icon';
import { doNotTranslate } from '@ui/utilities/internal/doNotTranslate';

import styles from '../DatePicker.module.scss';
import { type DatePickerProps } from '../types/DatePickerProps';
import { type DatePickerHeaderProps } from '../types/DatePickerHeaderProps';
import { DATE_PICKER_CONSTANTS } from './datePickerConstants';
import { DatePickerSelect } from './DatePickerSelect';
import { parseDatePickerDateOrThrow } from './parseDatePickerDateOrThrow';

const YEAR_WINDOW = 100;

export const DatePickerHeader = ({
  viewedMonth,
  onPreviousMonth,
  onNextMonth,
  onMonthChange,
  onYearChange,
  isPreviousMonthDisabled,
  isNextMonthDisabled,
  locale,
  previousMonthLabel,
  nextMonthLabel,
  monthLabel,
  yearLabel,
  portalContainer,
  onNavigationOpenChange,
  disabled,
}: DatePickerHeaderProps &
  Pick<
    DatePickerProps,
    | 'locale'
    | 'previousMonthLabel'
    | 'nextMonthLabel'
    | 'monthLabel'
    | 'yearLabel'
    | 'portalContainer'
    | 'onNavigationOpenChange'
    | 'disabled'
  >) => {
  const monthDate = parseDatePickerDateOrThrow(`${viewedMonth}-01`);
  const year = monthDate.getUTCFullYear();
  const month = monthDate.getUTCMonth() + 1;
  const monthFormatter = new Intl.DateTimeFormat(locale, {
    month: 'long',
    calendar: 'gregory',
    timeZone: doNotTranslate('UTC'),
  });
  const yearFormatter = new Intl.NumberFormat(locale, { useGrouping: false });
  const months = [];

  for (let index = 1; index <= DATE_PICKER_CONSTANTS.MONTHS_PER_YEAR; index++) {
    const date = new Date(monthDate);
    date.setUTCMonth(index - 1);
    months.push({ value: index, label: monthFormatter.format(date) });
  }

  const years = [];
  const firstYear = Math.max(
    DATE_PICKER_CONSTANTS.MIN_YEAR,
    year - YEAR_WINDOW,
  );
  const lastYear = Math.min(DATE_PICKER_CONSTANTS.MAX_YEAR, year + YEAR_WINDOW);

  for (let optionYear = firstYear; optionYear <= lastYear; optionYear++) {
    years.push({ value: optionYear, label: yearFormatter.format(optionYear) });
  }

  return (
    <div className={styles.header}>
      <div className={styles.monthSelect}>
        <DatePickerSelect
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
        <DatePickerSelect
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
          disabled={disabled || isPreviousMonthDisabled}
          aria-label={previousMonthLabel}
          onClick={onPreviousMonth}
        >
          <IconChevronLeft className={styles.chevron} />
        </LightIconButton>
        <LightIconButton
          size="md"
          disabled={disabled || isNextMonthDisabled}
          aria-label={nextMonthLabel}
          onClick={onNextMonth}
        >
          <IconChevronRight className={styles.chevron} />
        </LightIconButton>
      </div>
    </div>
  );
};
