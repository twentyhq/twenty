import { useDirection } from '@base-ui/react/direction-provider';
import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';

import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './DateCalendar.module.scss';
import { DateCalendarGrid } from './internal/DateCalendarGrid';
import { DateCalendarHeader } from './internal/DateCalendarHeader';
import { parseDateCalendarDate } from './internal/parseDateCalendarDate';
import { useDateCalendarFocus } from './internal/useDateCalendarFocus';
import { type DateCalendarProps } from './types/DateCalendarProps';

export const DateCalendar = ({
  value,
  onValueChange,
  viewedMonth,
  onViewedMonthChange,
  today,
  weekStart,
  locale,
  weekdayLabels,
  previousMonthLabel,
  nextMonthLabel,
  monthLabel,
  yearLabel,
  isDateUnavailable,
  disabled = false,
  dir,
  render,
  ref,
  className,
  ...props
}: DateCalendarProps) => {
  const providedDirection = useDirection();
  const direction = dir === 'rtl' || dir === 'ltr' ? dir : providedDirection;

  if (isDefined(value)) {
    parseDateCalendarDate(value);
  }

  if (isDefined(today)) {
    parseDateCalendarDate(today);
  }

  const {
    focusedDate,
    handleDayKeyDown,
    handleViewedMonthChange,
    handleDateFocus,
    registerDateButton,
  } = useDateCalendarFocus({
    value,
    viewedMonth,
    onViewedMonthChange,
    today,
    weekStart,
    direction,
    disabled,
  });

  return useRender({
    render,
    ref,
    props: {
      role: 'group',
      ...props,
      dir: direction,
      className: clsx(styles.calendar, className),
      children: (
        <>
          <DateCalendarHeader
            viewedMonth={viewedMonth}
            onViewedMonthChange={handleViewedMonthChange}
            locale={locale}
            previousMonthLabel={previousMonthLabel}
            nextMonthLabel={nextMonthLabel}
            monthLabel={monthLabel}
            yearLabel={yearLabel}
            disabled={disabled}
          />
          <DateCalendarGrid
            value={value}
            onValueChange={onValueChange}
            viewedMonth={viewedMonth}
            today={today}
            weekStart={weekStart}
            locale={locale}
            weekdayLabels={weekdayLabels}
            isDateUnavailable={isDateUnavailable}
            disabled={disabled}
            focusedDate={focusedDate}
            onDayKeyDown={handleDayKeyDown}
            onDateFocus={handleDateFocus}
            registerDateButton={registerDateButton}
          />
        </>
      ),
    },
  });
};
