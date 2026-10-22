import { useDirection } from '@base-ui/react/direction-provider';
import { useRender } from '@base-ui/react/use-render';
import { clsx } from 'clsx';
import { Suspense, useRef, type MouseEvent as ReactMouseEvent } from 'react';
import {
  type default as ReactDatePicker,
  type ReactDatePickerCustomHeaderProps,
} from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { Skeleton } from '@ui/primitives/feedback/Skeleton/Skeleton';
import { isDefined } from '@ui/utilities/utils/isDefined';

import styles from './DateCalendar.module.scss';
import { DateCalendarHeader } from './internal/DateCalendarHeader';
import { DateCalendarViewedMonthEffect } from './internal/DateCalendarViewedMonthEffect';
import { formatDateCalendarLocalDate } from './internal/formatDateCalendarLocalDate';
import { parseDateCalendarLocalDateOrThrow } from './internal/parseDateCalendarLocalDateOrThrow';
import { ReactDateCalendar } from './internal/ReactDateCalendar';
import { validateDateCalendarHighlightedRangeOrThrow } from './internal/validateDateCalendarHighlightedRangeOrThrow';
import { type DateCalendarProps } from './types/DateCalendarProps';

const DATE_CALENDAR_LOADING_HEIGHT = 300;

export const DateCalendar = ({
  value,
  onValueChange,
  onValueSelect,
  viewedMonth,
  onViewedMonthChange,
  highlightedRange,
  readOnly = false,
  hideGrid = false,
  weekStart,
  locale,
  weekdayLabels,
  previousMonthLabel,
  nextMonthLabel,
  monthLabel,
  yearLabel,
  portalContainer,
  onNavigationOpenChange,
  isDateUnavailable,
  disabled = false,
  disabledKeyboardNavigation = false,
  renderHeader,
  loadingFallback,
  dir,
  render,
  ref,
  className,
  ...props
}: DateCalendarProps) => {
  const calendarRef = useRef<ReactDatePicker>(null);
  const internalMouseDownRef = useRef<MouseEvent | null>(null);
  const engineViewedMonthRef = useRef(value?.slice(0, 7) ?? viewedMonth);
  const providedDirection = useDirection();
  const direction = dir === 'rtl' || dir === 'ltr' ? dir : providedDirection;

  if (isDefined(highlightedRange)) {
    validateDateCalendarHighlightedRangeOrThrow(highlightedRange);
  }

  const handleViewedMonthChange = (date: Date) => {
    const nextMonth = formatDateCalendarLocalDate(date).slice(0, 7);
    engineViewedMonthRef.current = nextMonth;

    if (nextMonth !== viewedMonth) {
      onViewedMonthChange(nextMonth);
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (readOnly || disabled || !isDefined(date)) {
      return;
    }

    onValueChange(formatDateCalendarLocalDate(date));
  };

  const calendarProps = {
    ref: calendarRef,
    open: true,
    onClickOutside: (event: MouseEvent) => {
      if (internalMouseDownRef.current === event) {
        event.preventDefault();
      }
    },
    minDate: parseDateCalendarLocalDateOrThrow('0001-01-01'),
    maxDate: parseDateCalendarLocalDateOrThrow('9999-12-31'),
    disabled,
    disabledKeyboardNavigation,
    openToDate: parseDateCalendarLocalDateOrThrow(`${viewedMonth}-01`),
    calendarStartDay: weekStart,
    onMonthChange: handleViewedMonthChange,
    onYearChange: handleViewedMonthChange,
    filterDate: (date: Date) =>
      !isDateUnavailable?.(formatDateCalendarLocalDate(date)),
    onSelect: (date: Date | null) => {
      if (readOnly || disabled || !isDefined(date)) {
        return;
      }

      const nextValue = formatDateCalendarLocalDate(date);

      if (isDefined(highlightedRange) && nextValue !== value) {
        onValueChange(nextValue);
      }

      onValueSelect?.(nextValue);
    },
    renderCustomDayName: isDefined(weekdayLabels)
      ? ({ day }: { day: Date }) => (
          <span
            title={new Intl.DateTimeFormat(locale, { weekday: 'long' }).format(
              day,
            )}
          >
            {weekdayLabels[day.getDay()]}
          </span>
        )
      : undefined,
    renderCustomHeader: ({
      monthDate,
      decreaseMonth,
      increaseMonth,
      changeMonth,
      changeYear,
      prevMonthButtonDisabled,
      nextMonthButtonDisabled,
    }: ReactDatePickerCustomHeaderProps) => {
      const navigationProps = {
        viewedMonth: formatDateCalendarLocalDate(monthDate).slice(0, 7),
        onPreviousMonth: decreaseMonth,
        onNextMonth: increaseMonth,
        onMonthChange: (month: number) => changeMonth(month - 1),
        onYearChange: changeYear,
        previousMonthDisabled: disabled || prevMonthButtonDisabled,
        nextMonthDisabled: disabled || nextMonthButtonDisabled,
      };

      return isDefined(renderHeader) ? (
        <>{renderHeader(navigationProps)}</>
      ) : (
        <DateCalendarHeader
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...navigationProps}
          locale={locale}
          previousMonthLabel={previousMonthLabel}
          nextMonthLabel={nextMonthLabel}
          monthLabel={monthLabel}
          yearLabel={yearLabel}
          portalContainer={portalContainer}
          onNavigationOpenChange={onNavigationOpenChange}
          disabled={disabled}
        />
      );
    },
  };

  return useRender({
    render,
    ref,
    props: {
      role: 'group',
      ...props,
      dir: direction,
      onMouseDownCapture: (event: ReactMouseEvent<HTMLDivElement>) => {
        props.onMouseDownCapture?.(event);
        internalMouseDownRef.current = event.nativeEvent;
      },
      className: clsx(styles.calendar, className),
      'data-readonly': readOnly || undefined,
      'data-hide-grid': hideGrid || undefined,
      children: (
        <Suspense
          fallback={
            loadingFallback ?? (
              <Skeleton height={DATE_CALENDAR_LOADING_HEIGHT} />
            )
          }
        >
          <DateCalendarViewedMonthEffect
            calendarRef={calendarRef}
            engineViewedMonthRef={engineViewedMonthRef}
            viewedMonth={viewedMonth}
          />
          {isDefined(highlightedRange) ? (
            <ReactDateCalendar
              // oxlint-disable-next-line react/jsx-props-no-spreading
              {...calendarProps}
              selectsRange
              startDate={parseDateCalendarLocalDateOrThrow(
                highlightedRange.start,
              )}
              endDate={parseDateCalendarLocalDateOrThrow(highlightedRange.end)}
              onChange={() => undefined}
            />
          ) : (
            <ReactDateCalendar
              // oxlint-disable-next-line react/jsx-props-no-spreading
              {...calendarProps}
              selected={
                isDefined(value)
                  ? parseDateCalendarLocalDateOrThrow(value)
                  : null
              }
              onChange={handleDateChange}
            />
          )}
        </Suspense>
      ),
    },
  });
};
