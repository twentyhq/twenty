import { useState } from 'react';

import { DatePicker } from '../DatePicker';
import { DATE_PICKER_WEEKDAY_LABELS } from './datePickerWeekdayLabels';
import { type DatePickerProps } from '../types/DatePickerProps';

export const DatePickerExample = ({
  initialValue = '2026-10-07',
  initialViewedMonth = '2026-10',
  highlightedRange,
  readOnly,
  isGridHidden,
  disabled,
  isDateUnavailable,
  onValueChange,
  onValueSelect,
  onViewedMonthChange,
  onNavigationOpenChange,
}: Partial<
  Pick<
    DatePickerProps,
    | 'highlightedRange'
    | 'readOnly'
    | 'isGridHidden'
    | 'disabled'
    | 'isDateUnavailable'
    | 'onValueChange'
    | 'onValueSelect'
    | 'onViewedMonthChange'
    | 'onNavigationOpenChange'
  >
> & {
  initialValue?: string | null;
  initialViewedMonth?: string;
}) => {
  const [value, setValue] = useState(initialValue);
  const [viewedMonth, setViewedMonth] = useState(initialViewedMonth);

  return (
    <DatePicker
      aria-label="Choose a date"
      value={value}
      onValueChange={(date) => {
        setValue(date);
        onValueChange?.(date);
      }}
      onValueSelect={onValueSelect}
      onNavigationOpenChange={onNavigationOpenChange}
      viewedMonth={viewedMonth}
      onViewedMonthChange={(month) => {
        setViewedMonth(month);
        onViewedMonthChange?.(month);
      }}
      highlightedRange={highlightedRange}
      readOnly={readOnly}
      isGridHidden={isGridHidden}
      weekStart={1}
      locale="en-US"
      weekdayLabels={DATE_PICKER_WEEKDAY_LABELS}
      previousMonthLabel="Previous month"
      nextMonthLabel="Next month"
      monthLabel="Month"
      yearLabel="Year"
      disabled={disabled}
      isDateUnavailable={isDateUnavailable}
    />
  );
};
