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

import styles from './DatePicker.module.scss';
import { DatePickerHeader } from './internal/DatePickerHeader';
import { DatePickerViewedMonthEffect } from './internal/DatePickerViewedMonthEffect';
import { formatDatePickerLocalDate } from './internal/formatDatePickerLocalDate';
import { parseDatePickerLocalDateOrThrow } from './internal/parseDatePickerLocalDateOrThrow';
import { ReactDatePickerLibrary } from './internal/ReactDatePickerLibrary';
import { validateDatePickerHighlightedRangeOrThrow } from './internal/validateDatePickerHighlightedRangeOrThrow';
import { type DatePickerProps } from './types/DatePickerProps';

const DATE_PICKER_LOADING_HEIGHT = 300;

export const DatePicker = ({
  value,
  onValueChange,
  onValueSelect,
  viewedMonth,
  onViewedMonthChange,
  highlightedRange,
  readOnly = false,
  isGridHidden = false,
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
  isKeyboardNavigationDisabled = false,
  renderHeader,
  loadingFallback,
  dir,
  render,
  ref,
  className,
  ...props
}: DatePickerProps) => {
  const calendarRef = useRef<ReactDatePicker>(null);
  const internalMouseDownRef = useRef<MouseEvent | null>(null);
  const engineViewedMonthRef = useRef(value?.slice(0, 7) ?? viewedMonth);
  const providedDirection = useDirection();
  const direction = dir === 'rtl' || dir === 'ltr' ? dir : providedDirection;

  if (isDefined(highlightedRange)) {
    validateDatePickerHighlightedRangeOrThrow(highlightedRange);
  }

  const handleViewedMonthChange = (date: Date) => {
    const nextMonth = formatDatePickerLocalDate(date).slice(0, 7);
    engineViewedMonthRef.current = nextMonth;

    if (nextMonth !== viewedMonth) {
      onViewedMonthChange(nextMonth);
    }
  };

  const handleDateChange = (date: Date | null) => {
    if (readOnly || disabled || !isDefined(date)) {
      return;
    }

    onValueChange(formatDatePickerLocalDate(date));
  };

  const calendarProps = {
    ref: calendarRef,
    open: true,
    onClickOutside: (event: MouseEvent) => {
      if (internalMouseDownRef.current === event) {
        event.preventDefault();
      }
    },
    minDate: parseDatePickerLocalDateOrThrow('0001-01-01'),
    maxDate: parseDatePickerLocalDateOrThrow('9999-12-31'),
    disabled,
    disabledKeyboardNavigation: isKeyboardNavigationDisabled,
    openToDate: parseDatePickerLocalDateOrThrow(`${viewedMonth}-01`),
    calendarStartDay: weekStart,
    onMonthChange: handleViewedMonthChange,
    onYearChange: handleViewedMonthChange,
    filterDate: (date: Date) =>
      !isDateUnavailable?.(formatDatePickerLocalDate(date)),
    onSelect: (date: Date | null) => {
      if (readOnly || disabled || !isDefined(date)) {
        return;
      }

      const nextValue = formatDatePickerLocalDate(date);

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
        viewedMonth: formatDatePickerLocalDate(monthDate).slice(0, 7),
        onPreviousMonth: decreaseMonth,
        onNextMonth: increaseMonth,
        onMonthChange: (month: number) => changeMonth(month - 1),
        onYearChange: (year: number) => {
          const nextDate = new Date(monthDate);
          nextDate.setFullYear(year);
          const hasMonthOverflow = nextDate.getMonth() !== monthDate.getMonth();

          if (!hasMonthOverflow) {
            changeYear(year);
            return;
          }

          nextDate.setDate(0);
          calendarRef.current?.setPreSelection(nextDate);
        },
        isPreviousMonthDisabled: disabled || prevMonthButtonDisabled,
        isNextMonthDisabled: disabled || nextMonthButtonDisabled,
      };

      return isDefined(renderHeader) ? (
        <>{renderHeader(navigationProps)}</>
      ) : (
        <DatePickerHeader
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

  const renderCalendar = () => {
    if (isDefined(highlightedRange)) {
      return (
        <ReactDatePickerLibrary
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...calendarProps}
          selectsRange
          startDate={parseDatePickerLocalDateOrThrow(highlightedRange.start)}
          endDate={parseDatePickerLocalDateOrThrow(highlightedRange.end)}
          onChange={() => undefined}
        />
      );
    }

    return (
      <ReactDatePickerLibrary
        // oxlint-disable-next-line react/jsx-props-no-spreading
        {...calendarProps}
        selected={
          isDefined(value) ? parseDatePickerLocalDateOrThrow(value) : null
        }
        onChange={handleDateChange}
      />
    );
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
      'data-hide-grid': isGridHidden || undefined,
      children: (
        <Suspense
          fallback={
            loadingFallback ?? <Skeleton height={DATE_PICKER_LOADING_HEIGHT} />
          }
        >
          <DatePickerViewedMonthEffect
            calendarRef={calendarRef}
            engineViewedMonthRef={engineViewedMonthRef}
            viewedMonth={viewedMonth}
          />
          {renderCalendar()}
        </Suspense>
      ),
    },
  });
};
