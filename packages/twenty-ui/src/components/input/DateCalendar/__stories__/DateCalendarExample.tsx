import { useState } from 'react';

import { DateCalendar } from '../DateCalendar';
import { DATE_CALENDAR_WEEKDAY_LABELS } from './dateCalendarWeekdayLabels';
import { type DateCalendarProps } from '../types/DateCalendarProps';

export const DateCalendarExample = ({
  initialValue = '2026-10-07',
  initialViewedMonth = '2026-10',
  highlightedRange,
  readOnly,
  hideGrid,
  disabled,
  isDateUnavailable,
  onValueChange,
  onValueSelect,
  onViewedMonthChange,
}: Partial<
  Pick<
    DateCalendarProps,
    | 'highlightedRange'
    | 'readOnly'
    | 'hideGrid'
    | 'disabled'
    | 'isDateUnavailable'
    | 'onValueChange'
    | 'onValueSelect'
    | 'onViewedMonthChange'
  >
> & {
  initialValue?: string | null;
  initialViewedMonth?: string;
}) => {
  const [value, setValue] = useState(initialValue);
  const [viewedMonth, setViewedMonth] = useState(initialViewedMonth);

  return (
    <DateCalendar
      aria-label="Choose a date"
      value={value}
      onValueChange={(date) => {
        setValue(date);
        onValueChange?.(date);
      }}
      onValueSelect={onValueSelect}
      viewedMonth={viewedMonth}
      onViewedMonthChange={(month) => {
        setViewedMonth(month);
        onViewedMonthChange?.(month);
      }}
      highlightedRange={highlightedRange}
      readOnly={readOnly}
      hideGrid={hideGrid}
      weekStart={1}
      locale="en-US"
      weekdayLabels={DATE_CALENDAR_WEEKDAY_LABELS}
      previousMonthLabel="Previous month"
      nextMonthLabel="Next month"
      monthLabel="Month"
      yearLabel="Year"
      disabled={disabled}
      isDateUnavailable={isDateUnavailable}
    />
  );
};
